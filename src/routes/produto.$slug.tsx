import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Minus, Plus, ShieldCheck, ShoppingBag, Sparkles, Tag } from "lucide-react";
import { useState } from "react";

import { ProductCard, ProductImage, useAddToCart } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { cartStore, MAX_QTY } from "@/lib/cart";
import { discountPercent, installment, MAX_INSTALLMENTS, money } from "@/lib/format";
import { products, type Product } from "@/lib/products";

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
