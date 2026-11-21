"""Export native HTML pages from verified rendered references, not an SPA runtime.

Usage: python3 tools/academic-export/export.py /tmp/browser/migracao /tmp/katchau-games
The references must include styles.json, data.json and the rendered content pages.
"""
import concurrent.futures
import copy
import html
import json
import re
import shutil
import sys
from pathlib import Path

import requests
from bs4 import BeautifulSoup

REF = Path(sys.argv[1])
OUT = Path(sys.argv[2])
PROJECT = Path(__file__).resolve().parents[2]
SCRIPTS = Path(__file__).parent
DATA = json.loads((REF / "data.json").read_text())
PAGES = {"index": "index", "catalogo": "catalogo", "consoles": "consoles", "jogos": "jogos",
         "perifericos": "perifericos", "sobre": "sobre", "atendimento": "contato", "faq": "faq", "carrinho": "carrinho"}
NAV = [("index", "Início"), ("catalogo", "Catálogo"), ("consoles", "Consoles"), ("jogos", "Jogos"),
       ("perifericos", "Periféricos"), ("novidades", "Novidades"), ("contato", "Atendimento"),
       ("faq", "Dúvidas frequentes"), ("sobre", "Sobre a KaTchau"), ("carrinho", "Carrinho")]
for folder in ["css", "js", "produtos", "assets/images", "assets/fonts", "assets/icons", "testes"]:
    (OUT / folder).mkdir(parents=True, exist_ok=True)

SOUPS = {destination: BeautifulSoup((REF / (source + ".html")).read_text(), "html.parser")
         for source, destination in PAGES.items()}
for product in DATA["products"]:
    SOUPS["produtos/" + product["slug"]] = BeautifulSoup((REF / ("p_" + product["slug"] + ".html")).read_text(), "html.parser")
classes = set()
for soup in SOUPS.values():
    for area in soup.select("header, main, footer"):
        for node in [area, *area.select("[class]")]:
            classes.update(node.get("class", []))
CLASSES = {value: "kt-" + str(index).zfill(3) for index, value in enumerate(sorted(classes), 1)}

def css_escape(value):
    return "".join("\\" + c if not re.match(r"[A-Za-z0-9_-]", c) else c for c in value)

css = json.loads((REF / "styles.json").read_text())[0]["rules"]
# Captured CSS is ordinary standards-based CSS. Preserve its exact declarations,
# rename selectors, and omit irrelevant UI-library selectors/runtime markers.
for old, new in sorted(CLASSES.items(), key=lambda pair: -len(pair[0])):
    escaped = css_escape(old)
    css = re.sub(r"\." + re.escape(escaped) + r"(?![A-Za-z0-9_\\-])", "." + new, css)
css = re.sub(r"--tw-", "--kt-", css)
css = css.replace("tailwind", "native").replace("Tailwind", "Native")
# Font files are part of the standalone deliverable, not app assets.
fonturl = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap"
fonts = requests.get(fonturl, headers={"User-Agent": "Mozilla/5.0"}, timeout=30)
fonts.raise_for_status()
fontcss = fonts.text
for index, url in enumerate(dict.fromkeys(re.findall(r"url\((https[^)]+)\)", fontcss))):
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    extension = ".woff2" if "woff2" in response.headers.get("Content-Type", "") else ".ttf"
    filename = "font-" + str(index) + extension
    (OUT / "assets/fonts" / filename).write_bytes(response.content)
    fontcss = fontcss.replace(url, "../assets/fonts/" + filename)
(OUT / "css/fonts.css").write_text(fontcss)
css = '/* CSS3 externo autônomo: declarações visuais preservadas, sem compilação ou biblioteca. */\n@import "fonts.css";\n' + css
css += (SCRIPTS / "native.css").read_text()
(OUT / "css/style.css").write_text(css)
(OUT / "css/MAPA-DE-CLASSES.md").write_text("# Mapa das classes de apresentação\n\nOs seletores kt-* preservam as declarações da interface original em CSS nativo.\n\n" +
    "\n".join(f"- `{alias}`: {original}" for original, alias in CLASSES.items()))
(OUT / "js/classes.js").write_text("window.KT_CLASSES = " + json.dumps(CLASSES, ensure_ascii=False) + ";\n")

def download_asset(pointer):
    asset = json.loads(pointer.read_text())
    response = requests.get("http://localhost:8080" + asset["url"], timeout=45)
    response.raise_for_status()
    (OUT / "assets/images" / asset["original_filename"]).write_bytes(response.content)

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    list(pool.map(download_asset, (PROJECT / "src/assets").rglob("*.asset.json")))
shutil.copy(PROJECT / "public/favicon.png", OUT / "assets/icons/favicon.png")
for product in DATA["products"]:
    product["image"] = "assets/images/" + product["image"].split("/")[-1]
(OUT / "js/dados.js").write_text("/* Preços e avaliações demonstrativos preservados. */\nwindow.KT_DATA = " + json.dumps(DATA, ensure_ascii=False, indent=2) + ";\n")
for name in ["carrinho", "filtros", "catalogo", "produto", "contato", "main"]:
    shutil.copy(SCRIPTS / (name + ".js"), OUT / "js" / (name + ".js"))

def classnames(*names):
    return " ".join(CLASSES.get(name, name) for name in names)

def convert_link(value, prefix):
    if value.startswith("/produto/"):
        return prefix + "produtos/" + value.split("/")[-1] + ".html"
    path, sep, query = value.partition("?")
    mapped = "index" if path == "/" else PAGES.get(path.lstrip("/"))
    return prefix + mapped + ".html" + (sep + query if sep else "") if mapped else value

def clean(area, prefix):
    for node in [area, *area.find_all(True)]:
        for attr in list(node.attrs):
            if attr.startswith("data-") and not attr.startswith("data-kt-"):
                del node.attrs[attr]
            if attr in ["aria-controls", "aria-describedby", "aria-expanded", "aria-haspopup", "id"]:
                del node.attrs[attr]
        if node.has_attr("class"):
            node["class"] = [CLASSES.get(name, name) for name in node["class"] if not name.startswith("lucide")]
        if node.has_attr("href"):
            node["href"] = convert_link(node["href"], prefix)
        if node.has_attr("src") and "/__l5e/assets-v1/" in node["src"]:
            node["src"] = prefix + "assets/images/" + node["src"].split("/")[-1]
    # Bindings were deliberately namespaced to survive sanitization.
    for node in [area, *area.find_all(True)]:
        for attr in list(node.attrs):
            if attr.startswith("data-kt-"):
                node.attrs[attr.replace("data-kt-", "data-", 1)] = node.attrs.pop(attr)

cards = {}
for article in SOUPS["catalogo"].select("main article"):
    article = copy.deepcopy(article)
    link = article.select_one('a[href^="/produto/"]')
    slug = link["href"].split("/")[-1]
    product = next(p for p in DATA["products"] if p["slug"] == slug)
    clean(article, "")
    article.select_one("button")["data-add"] = product["id"]
    cards[slug] = str(article)
(OUT / "js/cartoes.js").write_text("/* Fragmentos HTML nativos para os resultados do catálogo. */\nwindow.KT_CARDS = " + json.dumps(cards, ensure_ascii=False, indent=2) + ";\n")

def binding(node, name, value=""):
    if node is not None:
        node["data-kt-" + name] = value

def document(page, soup):
    prefix = "../" if page.startswith("produtos/") else ""
    header, main, footer = soup.select_one("header"), soup.select_one("main"), soup.select_one("footer")
    for script in soup.select("script"):
        script.decompose()
    for form in header.select("form"):
        form["action"] = prefix + "catalogo.html"
        form["method"] = "get"
        field = form.select_one("input")
        field["name"] = "q"
        field["maxlength"] = "80"
    binding(header.select_one('button[aria-label="Abrir menu"]'), "open", "menu-dialog")
    for link in header.select('a[href="/carrinho"]'):
        binding(link.select("span")[-1], "cart-count")
    # Reset current-page styles so native navigation can choose them for each file.
    for link in header.select("nav a"):
        link["class"] = [c for c in link.get("class", []) if c != "active" and not c.startswith("after:") and c != "!text-foreground"]
        link.attrs.pop("aria-current", None)
    desktopnav = header.select("nav")[-1]
    extra = copy.deepcopy(desktopnav.select_one("a"))
    extra["href"] = "novidades.html"
    extra.clear()
    extra.string = "Novidades"
    desktopnav.append(extra)
    for node in main.select('button[role="checkbox"]'):
        label = node.parent
        text = label.select_one("span.flex-1").get_text()
        legend = label.find_parent("fieldset").select_one("legend").get_text()
        key = {"Categoria": "categoria", "Plataforma": "plataforma", "Faixa de preço": "preco"}[legend]
        if key == "preco":
            text = {"Até R$ 200": "0-200", "R$ 200 a R$ 500": "200-500", "R$ 500 a R$ 1.000": "500-1000", "Acima de R$ 1.000": "1000-99999"}[text]
        field = soup.new_tag("input", type="checkbox", value=text)
        field["class"] = ["native-check"]
        binding(field, "filter", key)
        node.replace_with(field)
    for node in main.select('button[role="combobox"]'):
        select = soup.new_tag("select")
        select["aria-label"] = "Ordenar produtos"
        select["class"] = ["native-select"]
        binding(select, "sort")
        for value, label in [("relevancia", "Mais relevantes"), ("menor-preco", "Menor preço"), ("maior-preco", "Maior preço"), ("nome", "Nome (A–Z)")]:
            option = soup.new_tag("option", value=value)
            option.string = label
            select.append(option)
        node.replace_with(select)
    for node in main.select('select[aria-hidden="true"]'):
        node.decompose()
    for button in main.select("button"):
        text = button.get_text(" ", strip=True)
        aria = button.get("aria-label", "")
        if aria.startswith("Adicionar "):
            article = button.find_parent("article")
            if article:
                link = article.select_one('a[href^="/produto/"]')
                product = next(p for p in DATA["products"] if p["slug"] == link["href"].split("/")[-1])
                binding(button, "add", product["id"])
        if text == "Comprar":
            binding(button, "add", 5)
        if text.startswith("Filtros"):
            binding(button, "open", "filters-dialog")
        if text in ["Todos os produtos", "Consoles", "Jogos", "Periféricos"]:
            binding(button, "category", "" if text == "Todos os produtos" else text)
        if text == "Adicionar ao carrinho":
            binding(button, "product-add")
        if text == "Comprar agora":
            binding(button, "buy-now")
        if aria in ["Diminuir quantidade", "Aumentar quantidade"]:
            binding(button, "qty", "-1" if aria.startswith("Diminuir") else "1")
        if aria == "Copiar e-mail":
            binding(button, "copy-email")
    if page in ["catalogo", "consoles", "jogos", "perifericos"]:
        binding(main, "catalog", {"consoles": "Consoles", "jogos": "Jogos", "perifericos": "Periféricos"}.get(page, ""))
        articles = main.select("article")
        grid = articles[0].parent
        binding(grid, "product-grid")
        binding(main.select_one("aside"), "filters")
        for paragraph in main.select("p"):
            if "produtos encontrados" in paragraph.get_text():
                binding(paragraph, "result-count")
        chips = soup.new_tag("div")
        chips["class"] = ["mb-6", "flex", "flex-wrap", "gap-2"]
        binding(chips, "chips")
        grid.insert_before(chips)
        if page == "catalogo":
            binding(main.select_one("h1"), "catalog-title")
    if page.startswith("produtos/"):
        product = next(p for p in DATA["products"] if p["slug"] == page.split("/")[-1])
        binding(main, "product", product["id"])
        minus = main.select_one('[data-kt-qty="-1"]')
        binding(minus.find_next_sibling("span"), "product-qty")
    if page == "contato":
        binding(main.select_one("form"), "contact")
    if page == "faq":
        raw = (PROJECT / "src/routes/faq.tsx").read_text()
        faq = re.findall(r'\{ q: "([^"]+)", a: "([^"]+)" \}', raw)
        accordion = main.select_one('div[data-orientation="vertical"]')
        accordion.clear()
        for index, (q, a) in enumerate(faq):
            accordion.append(BeautifulSoup('<details' + (' open' if index == 0 else '') + '><summary class="native-summary">' + html.escape(q) + '</summary><p>' + html.escape(a) + '</p></details>', "html.parser"))
    for area in [header, main, footer]:
        clean(area, prefix)
    if page.startswith("produtos/"):
        for section in main.select("section"):
            title = section.select_one("h2")
            if title and title.get_text() == "Avaliações":
                section["id"] = "avaliacoes"
    if page == "contato":
        form = main.select_one("form")
        for name, field in zip(["nome", "email", "assunto", "mensagem"], form.select("input,textarea")):
            field["id"] = name
            field["name"] = name
    if page == "carrinho":
        main.clear()
        main.append(BeautifulSoup('<div class="' + classnames("wrap", "py-12") + '"><span class="' + classnames("eyebrow") + '">Sua seleção</span><div class="cart-heading"><h1 class="' + classnames("display", "text-5xl", "md:text-6xl") + '">Carrinho</h1><button data-clear-cart class="clear-cart">Limpar carrinho</button></div><div data-cart-content></div></div>', "html.parser"))
    drawer = '<dialog id="menu-dialog" class="drawer" aria-label="Menu"><div class="drawer-top"><a href="' + prefix + 'index.html"><img src="' + prefix + 'assets/images/katchau-logo.webp" alt="KaTchau" width="110"></a><button data-close class="drawer-close" aria-label="Fechar menu">×</button></div><form action="' + prefix + 'catalogo.html" method="get" class="drawer-search"><input type="search" name="q" maxlength="80" placeholder="Buscar produtos" aria-label="Buscar produtos no menu"><button type="submit">Buscar</button></form><nav>' + ''.join('<a href="' + prefix + filename + '.html">' + label + '</a>' for filename, label in NAV) + '</nav></dialog>'
    filters = ""
    aside = main.select_one("[data-filters]")
    if aside:
        fields = copy.deepcopy(aside.select_one("div"))
        fields["class"] = []
        fields.select_one("h2").decompose()
        filters = '<dialog id="filters-dialog" class="drawer" aria-label="Filtrar por"><div class="drawer-top"><h2>Filtrar por</h2><button data-close class="drawer-close" aria-label="Fechar filtros">×</button></div>' + str(fields) + '</dialog>'
    title = soup.title.get_text()
    description = soup.select_one('meta[name="description"]')["content"]
    scripts = ''.join('<script defer src="' + prefix + 'js/' + name + '.js"></script>' for name in ["dados", "classes", "cartoes", "carrinho", "filtros", "catalogo", "produto", "contato", "main"])
    result = '<!DOCTYPE html>\n<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + html.escape(title) + '</title><meta name="description" content="' + html.escape(description, quote=True) + '"><meta property="og:title" content="' + html.escape(title, quote=True) + '"><meta property="og:description" content="' + html.escape(description, quote=True) + '"><meta property="og:type" content="website"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="' + prefix + 'assets/icons/favicon.png"><link rel="stylesheet" href="' + prefix + 'css/style.css">' + scripts + '</head><body data-root="' + prefix + '"><div class="kt-app">' + str(header) + str(main) + str(footer) + '</div>' + drawer + filters + '<dialog id="clear-dialog" class="confirm-dialog" aria-labelledby="clear-title"><h2 id="clear-title">Esvaziar o carrinho?</h2><p data-clear-description></p><div class="actions"><button data-close>Cancelar</button><button data-confirm-clear>Sim, limpar carrinho</button></div></dialog><div id="toast" class="toast" role="status" hidden></div></body></html>'
    (OUT / (page + ".html")).write_text(result)

for page, soup in SOUPS.items():
    document(page, soup)
news = BeautifulSoup((OUT / "index.html").read_text(), "html.parser")
main = news.select_one("main")
sections = main.select("section")
hero = copy.deepcopy(sections[0])
hero.select_one("h1").clear()
hero.select_one("h1").append(BeautifulSoup('Novidades e <span class="' + classnames("text-gradient-brand") + '">lançamentos</span>', "html.parser"))
main.clear()
main.append(hero)
for section in sections:
    h2 = section.select_one("h2")
    if h2 and ("Na fila do" in h2.get_text() or "Ofertas que" in h2.get_text()):
        main.append(copy.deepcopy(section))
news.title.string = "Novidades e lançamentos | KaTchau"
news.select_one('meta[property="og:title"]')["content"] = news.title.string
for tag in news.select('meta[name="description"],meta[property="og:description"]'):
    tag["content"] = "Lançamentos e curadoria de jogos da KaTchau. Preços e condições ilustrativos."
(OUT / "novidades.html").write_text(str(news))
(OUT / "busca.html").write_text('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Busca | KaTchau</title><meta name="description" content="Busca de produtos KaTchau."><meta property="og:title" content="Busca | KaTchau"><meta property="og:description" content="Pesquisa de produtos na KaTchau."><meta property="og:type" content="website"><meta name="twitter:card" content="summary"><link rel="stylesheet" href="css/style.css"><script defer src="js/busca.js"></script></head><body><main><h1>Busca de produtos</h1><a href="catalogo.html">Ver catálogo</a></main></body></html>')
(OUT / "js/busca.js").write_text('location.replace("catalogo.html" + location.search);\n')
print("Exportados", len(list(OUT.rglob("*.html"))), "arquivos HTML e", len(DATA["products"]), "produtos.")