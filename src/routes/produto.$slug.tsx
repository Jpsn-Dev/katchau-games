import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Minus, Plus, ShieldCheck, ShoppingBag, Sparkles, Tag } from "lucide-react";
import { useState } from "react";

import { ProductCard, ProductImage, useAddToCart } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { cartStore, MAX_QTY } from "@/lib/cart";
import { discountPercent, installment, MAX_INSTALLMENTS, money } from "@/lib/format";
import { products, type Product } from "@/lib/products";
import { getReviews } from "@/lib/reviews";
import { Stars } from "@/components/site/Stars";

export const Route = createFileRoute("/produto/$slug")({
  loader: ({ params }) => {
    const product = products.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const title = p ? `${p.name} | KaTchau` : "Produto | KaTchau";
    const description = p
      ? `${p.name} para ${p.platforms.join(", ")} por ${money(p.price)} na KaTchau.`
      : "Produto da KaTchau.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="wrap py-32 text-center">
      <p className="display text-5xl">Produto não encontrado</p>
      <p className="mt-3 text-muted-foreground">Esse item não está mais no catálogo.</p>
      <Button asChild variant="brand" size="lg" className="mt-8">
        <Link to="/catalogo">Ver catálogo</Link>
      </Button>
    </div>
  ),
  component: ProductPage,
});

const CATEGORY_ROUTE = { Consoles: "/consoles", Jogos: "/jogos", "Periféricos": "/perifericos" } as const;

function describe(p: Product) {
  if (p.category === "Consoles")
    return `O ${p.name} entrega desempenho de sobra para os maiores lançamentos, com acesso a toda a biblioteca da plataforma ${p.platforms[0]}. Ideal para quem quer começar uma coleção ou dar o próximo passo.`;
  if (p.category === "Jogos")
    return `${p.name} é uma das experiências mais marcantes do catálogo. Disponível para ${p.platforms.join(" e ")}, é escolha certa para quem busca horas de diversão e uma grande história.`;
  return `${p.name} foi pensado para jogar por horas com conforto e precisão. Compatível com ${p.platforms.join(" e ")}, completa o seu setup com qualidade.`;
}

function ProductPage() {
  const { product: p } = Route.useLoaderData();
  const [qty, setQty] = useState(1);
  const add = useAddToCart();
  const navigate = useNavigate();
  const off = discountPercent(p.price, p.oldPrice);
  const reviews = getReviews(p);
  const related = products
    .filter((x) => x.id !== p.id && (x.category === p.category || x.platforms.some((pl) => p.platforms.includes(pl))))
    .sort((a, b) => Number(b.category === p.category) - Number(a.category === p.category))
    .slice(0, 4);

  return (
    <>
      <div className="wrap py-8">
        <nav aria-label="Navegação estrutural" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Início</Link>
          <ChevronRight className="size-3" />
          <Link to={CATEGORY_ROUTE[p.category]} className="hover:text-foreground">{p.category}</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">{p.name}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="group relative self-start overflow-hidden rounded-xl border border-border lg:sticky lg:top-44">
            <ProductImage product={p} size="large" />
            <span className="absolute left-4 top-4 rounded-sm bg-background/90 px-2.5 py-1 font-display text-xs font-bold uppercase tracking-wider">
              {p.tag}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="eyebrow">{p.platforms.join(" · ")}</span>
            <h1 className="display mt-3 text-5xl md:text-6xl">{p.name}</h1>
            <a href="#avaliacoes" className="mt-3 inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <Stars value={reviews.average} className="text-base" />
              <span className="font-semibold text-foreground">{reviews.average.toFixed(1).replace(".", ",")}</span>
              <span>· {reviews.count} avaliações demonstrativas</span>
            </a>
            <p className="mt-2 text-sm text-muted-foreground">Código KT-{String(p.id).padStart(4, "0")} · {p.category}</p>

            <div className="mt-8 rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground line-through">{money(p.oldPrice)}</span>
                {off > 0 && (
                  <span className="rounded-sm bg-signal px-2 py-0.5 font-display text-xs font-bold text-signal-foreground">
                    -{off}%
                  </span>
                )}
              </div>
              <p className="mt-1 font-display text-5xl font-bold leading-none">{money(p.price)}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                ou {MAX_INSTALLMENTS}x de {money(installment(p.price))} sem juros
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex h-12 items-center rounded-md border border-border">
                  <button
                    className="grid h-full w-11 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-8 text-center font-semibold tabular-nums">{qty}</span>
                  <button
                    className="grid h-full w-11 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                    onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
                    disabled={qty >= MAX_QTY}
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <Button variant="brand" size="xl" className="flex-1" onClick={() => add(p, qty)}>
                  <ShoppingBag /> Adicionar ao carrinho
                </Button>
              </div>
              <Button
                variant="line"
                size="xl"
                className="mt-3 w-full"
                onClick={() => {
                  cartStore.add(p.id, qty);
                  navigate({ to: "/carrinho" });
                }}
              >
                Comprar agora
              </Button>
              <p className="mt-4 text-xs text-muted-foreground">Preço ilustrativo — nenhuma compra real é realizada.</p>
            </div>

            <ul className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
              <Perk icon={ShieldCheck} text="Compra simulada e segura" />
              <Perk icon={Tag} text={`Economia de ${money(p.oldPrice - p.price)}`} />
              <Perk icon={Sparkles} text={`Para ${p.platforms.join(" e ")}`} />
            </ul>

            <div className="mt-8 border-t border-border pt-6">
              <h2 className="font-display text-lg font-bold uppercase tracking-widest">Sobre o produto</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{describe(p)}</p>
            </div>
          </div>
        </div>
      </div>

      <ReviewsSection summary={reviews} />

      {related.length > 0 && (
        <section className="wrap mt-16">
          <span className="eyebrow">Você também pode gostar</span>
          <h2 className="display mb-8 mt-3 text-4xl">Combina com isso</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function Perk({ icon: Icon, text }: { icon: typeof ShieldCheck; text: string }) {
  return (
    <li className="flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3.5 py-3">
      <Icon className="size-4 shrink-0 text-primary" />
      <span className="text-foreground/90">{text}</span>
    </li>
  );
}

function ReviewsSection({ summary }: { summary: ReturnType<typeof getReviews> }) {
  const dist = [5, 4, 3, 2, 1].map((n) => {
    const shown = summary.reviews.filter((r) => r.rating === n).length;
    const base = n === 5 ? 0.62 : n === 4 ? 0.27 : n === 3 ? 0.08 : n === 2 ? 0.02 : 0.01;
    const share = (base * 3 + shown / summary.reviews.length) / 4;
    return { n, share };
  });
  return (
    <section id="avaliacoes" className="wrap mt-16 scroll-mt-40">
      <span className="eyebrow">Opiniões</span>
      <h2 className="display mt-3 text-4xl">Avaliações</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Avaliações demonstrativas criadas para este projeto acadêmico — não são opiniões de compradores reais.
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="h-fit rounded-xl border border-border bg-card p-6">
          <p className="font-display text-6xl font-bold leading-none">{summary.average.toFixed(1).replace(".", ",")}</p>
          <Stars value={summary.average} className="mt-3 text-xl" />
          <p className="mt-2 text-sm text-muted-foreground">{summary.count} avaliações</p>
          <ul className="mt-5 space-y-2">
            {dist.map((d) => (
              <li key={d.n} className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="w-3 tabular-nums">{d.n}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-raised">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.round(d.share * 100)}%` }} />
                </span>
                <span className="w-8 text-right tabular-nums">{Math.round(d.share * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
        <ul className="grid gap-4 md:grid-cols-2">
          {summary.reviews.map((r) => (
            <li key={r.author + r.title} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <Stars value={r.rating} className="text-sm" />
                <span className="text-xs text-muted-foreground">{r.date}</span>
              </div>
              <p className="mt-3 font-semibold">{r.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
              <div className="mt-4 flex items-center gap-2.5 border-t border-border pt-3">
                <span className="grid size-8 place-items-center rounded-full bg-surface-raised font-display text-sm font-bold text-primary">
                  {r.author.split(" ").map((w) => w[0]).join("")}
                </span>
                <span className="text-xs"><span className="font-semibold text-foreground">{r.author}</span> <span className="text-muted-foreground">· {r.city}</span></span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
