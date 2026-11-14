import { Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { cartStore } from "@/lib/cart";
import { discountPercent, installment, money, MAX_INSTALLMENTS } from "@/lib/format";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

export function useAddToCart() {
  const navigate = useNavigate();
  return (p: Product, qty = 1) => {
    cartStore.add(p.id, qty);
    toast.success("Adicionado ao carrinho", {
      description: p.name,
      action: { label: "Ver carrinho", onClick: () => navigate({ to: "/carrinho" }) },
    });
  };
}

export function ProductImage({ product, className, size = "card" }: { product: Product; className?: string; size?: "card" | "large" }) {
  const isGame = product.kind === "game";
  return (
    <div
      className={cn(
        "relative grid aspect-square place-items-center overflow-hidden",
        isGame ? "bg-surface-raised grid-texture" : "bg-tile",
        className,
      )}
    >
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        className={cn(
          "transition-transform duration-500 ease-out group-hover:scale-[1.04]",
          isGame
            ? cn("h-[84%] w-auto rounded-sm object-contain shadow-card", size === "large" && "h-[88%]")
            : "h-full w-full object-contain p-[12%] mix-blend-multiply",
        )}
      />
    </div>
  );
}

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const add = useAddToCart();
  const off = discountPercent(product.price, product.oldPrice);
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow",
        className,
      )}
    >
      <Link to="/produto/$slug" params={{ slug: product.slug }} className="block" aria-label={product.name}>
        <ProductImage product={product} />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-sm bg-background/90 px-2 py-1 font-display text-[11px] font-bold uppercase tracking-wider text-foreground">
            {product.tag}
          </span>
        </div>
        {off > 0 && (
          <span className="absolute right-3 top-3 rounded-sm bg-signal px-2 py-1 font-display text-xs font-bold text-signal-foreground">
            -{off}%
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {product.platforms.join(" · ")}
        </span>
        <Link
          to="/produto/$slug"
          params={{ slug: product.slug }}
          className="line-clamp-2 min-h-[2.6em] text-[15px] font-semibold leading-snug text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground line-through">{money(product.oldPrice)}</div>
            <div className="font-display text-2xl font-bold leading-none text-foreground">{money(product.price)}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              ou {MAX_INSTALLMENTS}x de {money(installment(product.price))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => add(product)}
            aria-label={`Adicionar ${product.name} ao carrinho`}
            className="grid size-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground transition hover:brightness-110 active:scale-95 sm:size-11"
          >
            <Plus className="size-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </article>
  );
}
