import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Gamepad2, Headphones, MonitorPlay } from "lucide-react";

import capaInicial from "@/assets/brand/capa-inicial.webp.asset.json";
import capaConsoles from "@/assets/brand/capa-consoles.webp.asset.json";
import capaJogos from "@/assets/brand/capa-jogos.webp.asset.json";
import capaPerifericos from "@/assets/brand/capa-perifericos.webp.asset.json";
import { ProductCard, ProductImage, useAddToCart } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { discountPercent, money } from "@/lib/format";
import { FEATURED_IDS, getProduct, products, SPOTLIGHT_GAME_IDS, type Product } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KaTchau — Consoles, jogos e periféricos para quem vive o game" },
      {
        name: "description",
        content:
          "Encontre consoles PlayStation, Xbox e Nintendo, os jogos mais esperados e periféricos para elevar cada partida.",
      },
      { property: "og:title", content: "KaTchau — Seu próximo nível começa aqui" },
      {
        property: "og:description",
        content: "Consoles, jogos e periféricos para PlayStation, Xbox e Nintendo.",
      },
    ],
  }),
  component: Home,
});

const byIds = (ids: number[]) => ids.map(getProduct).filter((p): p is Product => !!p);

function Home() {
  const featured = byIds(FEATURED_IDS);
  const spotlight = byIds(SPOTLIGHT_GAME_IDS);
  const hero = getProduct(5)!;
  return (
    <>
      <Hero product={hero} />
      <PlatformStrip />
      <Departments />

      <section className="wrap mt-24">
        <SectionHeading eyebrow="Escolhas da KaTchau" title={<>Mais <span className="text-gradient-brand">procurados</span></>} to="/catalogo" />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <GamesShelf games={spotlight} />
      <ClosingBand />
    </>
  );
}

function Hero({ product }: { product: Product }) {
  const add = useAddToCart();
  return (
    <section className="relative overflow-hidden border-b border-border">
      <img
        src={capaInicial.url}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-center"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-hero-fade" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-bottom-fade" />

      <div className="wrap relative grid items-center gap-12 py-20 md:py-28 lg:grid-cols-[1.25fr_1fr]">
        <div className="animate-rise">
          <span className="eyebrow">A loja de quem vive o game</span>
          <h1 className="display mt-5 text-6xl sm:text-7xl lg:text-[6.5rem]">
            Seu próximo
            <br />
            <span className="text-gradient-brand">nível</span> começa
            <br />
            aqui.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Consoles, jogos e periféricos para PlayStation, Xbox e Nintendo — selecionados para deixar cada partida melhor.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild variant="brand" size="xl">
              <Link to="/catalogo">
                Ver catálogo <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="line" size="xl">
              <Link to="/jogos">Explorar jogos</Link>
            </Button>
          </div>
        </div>

        <div className="animate-rise justify-self-center [animation-delay:150ms] lg:justify-self-end">
          <div className="w-[300px] overflow-hidden rounded-xl border border-border bg-card shadow-glow sm:w-[340px]">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-display text-sm font-bold uppercase tracking-widest text-primary">Lançamento</span>
              <span className="rounded-sm bg-signal px-2 py-0.5 font-display text-xs font-bold text-signal-foreground">
                -{discountPercent(product.price, product.oldPrice)}%
              </span>
            </div>
            <Link to="/produto/$slug" params={{ slug: product.slug }} className="group block">
              <ProductImage product={product} className="aspect-[4/3]" />
            </Link>
            <div className="space-y-3 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{product.platforms.join(" · ")}</p>
                <p className="mt-1 text-lg font-semibold">{product.name}</p>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xs text-muted-foreground line-through">{money(product.oldPrice)}</div>
                  <div className="font-display text-3xl font-bold leading-none">{money(product.price)}</div>
                </div>
                <Button variant="brand" onClick={() => add(product)}>
                  Comprar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const PLATFORMS_INFO = [
  { name: "PlayStation", line: "PS5, PS4 e DualSense" },
  { name: "Xbox", line: "Series X|S e acessórios" },
  { name: "Nintendo", line: "Switch 2, OLED e exclusivos" },
] as const;

function PlatformStrip() {
  return (
    <section className="wrap -mt-px">
      <div className="grid divide-y divide-border overflow-hidden rounded-b-xl border border-t-0 border-border bg-surface md:grid-cols-3 md:divide-x md:divide-y-0">
        {PLATFORMS_INFO.map((p) => {
          const count = products.filter((x) => x.platforms.includes(p.name)).length;
          return (
            <Link
              key={p.name}
              to="/catalogo"
              search={{ plataforma: p.name }}
              className="group flex items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-surface-raised"
            >
              <div>
                <p className="font-display text-2xl font-bold uppercase tracking-wide">{p.name}</p>
                <p className="text-sm text-muted-foreground">
                  {p.line} · {count} produtos
                </p>
              </div>
              <ArrowUpRight className="size-5 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Departments() {
  const items = [
    { to: "/consoles", n: "01", title: "Consoles", text: "Encontre sua próxima plataforma.", img: capaConsoles.url, icon: MonitorPlay },
    { to: "/jogos", n: "02", title: "Jogos", text: "Grandes histórias esperam por você.", img: capaJogos.url, icon: Gamepad2 },
    { to: "/perifericos", n: "03", title: "Controles e periféricos", text: "Precisão e conforto em cada partida.", img: capaPerifericos.url, icon: Headphones },
  ] as const;
  return (
    <section className="wrap mt-24">
      <SectionHeading eyebrow="Encontre o que procura" title={<>Explore por <span className="text-gradient-brand">departamento</span></>} />
      <div className="grid gap-4 md:grid-cols-6 md:grid-rows-2">
        {items.map((d, i) => (
          <Link
            key={d.to}
            to={d.to}
            className={
              "group relative flex min-h-[260px] overflow-hidden rounded-xl border border-border " +
              (i === 0 ? "md:col-span-4 md:row-span-2 md:min-h-[520px]" : "md:col-span-2")
            }
          >
            <img
              src={d.img}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-card-fade" />
            <div className="relative mt-auto flex w-full items-end justify-between gap-4 p-6 md:p-8">
              <div>
                <span className="font-display text-sm font-bold tracking-[0.2em] text-primary">{d.n}</span>
                <h3 className={"display mt-1 " + (i === 0 ? "text-5xl md:text-6xl" : "text-4xl")}>{d.title}</h3>
                <p className="mt-2 text-sm text-foreground/80">{d.text}</p>
              </div>
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:rotate-45">
                <ArrowUpRight className="size-5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function GamesShelf({ games }: { games: Product[] }) {
  return (
    <section className="mt-24 border-y border-border bg-surface/60 py-16">
      <div className="wrap">
        <SectionHeading eyebrow="Curadoria de jogos" title={<>Na fila do <span className="text-gradient-brand">play</span></>} to="/jogos" />
        <div className="scrollbar-none -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:px-0 lg:grid-cols-8">
          {games.map((g) => (
            <Link
              key={g.id}
              to="/produto/$slug"
              params={{ slug: g.slug }}
              className="group w-36 shrink-0 snap-start md:w-auto"
            >
              <div className="overflow-hidden rounded-md border border-border bg-surface-raised">
                <img
                  src={g.image}
                  alt={g.name}
                  loading="lazy"
                  className="aspect-[2/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 line-clamp-1 text-sm font-semibold group-hover:text-primary">{g.name}</p>
              <p className="font-display text-lg font-bold">{money(g.price)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingBand() {
  return (
    <section className="wrap mt-24">
      <div className="relative overflow-hidden rounded-2xl bg-brand px-8 py-14 md:px-14">
        <div className="absolute inset-0 grid-texture opacity-40" />
        <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="text-primary-foreground">
            <p className="font-display text-sm font-bold uppercase tracking-[0.2em]">Seleção da semana</p>
            <h2 className="display mt-2 text-5xl md:text-6xl">Ofertas que valem o play.</h2>
            <p className="mt-3 max-w-md font-medium opacity-80">Descontos em consoles, jogos e periféricos selecionados.</p>
          </div>
          <Link
            to="/catalogo"
            search={{ ordem: "menor-preco" }}
            className="inline-flex h-12 items-center gap-2 rounded-md bg-background px-7 font-display text-base font-bold uppercase tracking-wider text-foreground transition hover:bg-surface-raised"
          >
            Conferir ofertas <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, to }: { eyebrow: string; title: React.ReactNode; to?: "/catalogo" | "/jogos" }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="display mt-3 text-4xl md:text-5xl">{title}</h2>
      </div>
      {to && (
        <Link to={to} className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary sm:inline-flex">
          Ver todos <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
