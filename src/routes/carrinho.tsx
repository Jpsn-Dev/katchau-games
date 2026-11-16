import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ProductImage } from "@/components/site/ProductCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cartCount, cartStore, cartTotals, MAX_QTY, useCart } from "@/lib/cart";
import { installment, MAX_INSTALLMENTS, money } from "@/lib/format";
import { products } from "@/lib/products";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho | KaTchau" },
      { name: "description", content: "Revise os produtos do seu carrinho na KaTchau." },
      { property: "og:title", content: "Carrinho | KaTchau" },
      { property: "og:description", content: "Revise os produtos do seu carrinho na KaTchau." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const items = useCart();
  const lines = items
    .map((i) => ({ ...i, product: products.find((p) => p.id === i.id) }))
    .filter((l) => l.product);
  const { subtotal, savings } = cartTotals(items, products);
  const count = cartCount(items);

  return (
    <div className="wrap py-12">
      <span className="eyebrow">Sua seleção</span>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-5xl md:text-6xl">Carrinho</h1>
        {lines.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button type="button" className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-destructive/60 hover:text-destructive">
                <Trash2 className="size-4" /> Limpar carrinho
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Esvaziar o carrinho?</AlertDialogTitle>
                <AlertDialogDescription>
                  Todos os {count} {count === 1 ? "item será removido" : "itens serão removidos"}. Essa ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    cartStore.clear();
                    toast("Carrinho esvaziado");
                  }}
                >
                  Sim, limpar carrinho
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {lines.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border px-6 py-24 text-center">
          <ShoppingBag className="mx-auto size-10 text-primary" />
          <p className="display mt-5 text-3xl">Seu carrinho está vazio</p>
          <p className="mt-2 text-muted-foreground">Adicione produtos pelo catálogo — consoles, jogos e periféricos esperam por você.</p>
          <Button asChild variant="brand" size="xl" className="mt-8">
            <Link to="/catalogo">Voltar ao catálogo</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <ul className="h-fit divide-y divide-border rounded-xl border border-border bg-card">
            {lines.map(({ product: p, qty }) => (
              <li key={p!.id} className="flex gap-4 p-4 sm:gap-6 sm:p-5">
                <Link to="/produto/$slug" params={{ slug: p!.slug }} className="group block h-fit w-24 shrink-0 overflow-hidden rounded-md border border-border sm:w-28">
                  <ProductImage product={p!} />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {p!.platforms.join(" · ")}
                      </p>
                      <Link to="/produto/$slug" params={{ slug: p!.slug }} className="mt-0.5 block font-semibold hover:text-primary">
                        {p!.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">{money(p!.price)} cada</p>
                    </div>
                    <p className="shrink-0 font-display text-xl font-bold">{money(p!.price * qty)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex h-10 items-center rounded-md border border-border">
                      <button className="grid h-full w-10 place-items-center text-muted-foreground hover:text-foreground" onClick={() => cartStore.setQty(p!.id, qty - 1)} aria-label="Diminuir quantidade">
                        <Minus className="size-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold tabular-nums">{qty}</span>
                      <button className="grid h-full w-10 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-40" disabled={qty >= MAX_QTY} onClick={() => cartStore.setQty(p!.id, qty + 1)} aria-label="Aumentar quantidade">
                        <Plus className="size-4" />
                      </button>
                    </div>
                    <button onClick={() => cartStore.remove(p!.id)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-destructive">
                      <Trash2 className="size-4" /> Remover
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-xl border border-border bg-card p-6 lg:sticky lg:top-44">
            <h2 className="font-display text-lg font-bold uppercase tracking-widest">Resumo do pedido</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Produtos ({count})</dt>
                <dd>{money(subtotal + savings)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Descontos</dt>
                <dd className="text-success">− {money(savings)}</dd>
              </div>
            </dl>
            <div className="mt-5 flex items-end justify-between border-t border-border pt-5">
              <span className="font-semibold">Total</span>
              <div className="text-right">
                <p className="font-display text-4xl font-bold leading-none">{money(subtotal)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  ou {MAX_INSTALLMENTS}x de {money(installment(subtotal))} sem juros
                </p>
              </div>
            </div>
            <Button
              variant="brand"
              size="xl"
              className="mt-6 w-full"
              onClick={() => toast("Compra simulada", { description: "Este é um ambiente demonstrativo: nenhum pedido ou pagamento foi realizado." })}
            >
              Finalizar compra <ArrowRight />
            </Button>
            <Button asChild variant="ghost" className="mt-2 w-full">
              <Link to="/catalogo">Continuar comprando</Link>
            </Button>
            <p className="mt-4 text-center text-xs text-muted-foreground">Ambiente demonstrativo. Nenhuma cobrança será feita.</p>
          </aside>
        </div>
      )}
    </div>
  );
}
