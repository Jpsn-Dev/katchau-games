import { describe, expect, it } from "vitest";

import { addItem, cartTotals, MAX_QTY, setQty } from "@/lib/cart";
import { filterProducts } from "@/lib/catalog";
import { products } from "@/lib/products";

describe("cart rules", () => {
  it("caps a product at 99 units", () => {
    expect(MAX_QTY).toBe(99);
    const items = addItem([{ id: 1, qty: 98 }], 1, 5);
    expect(items[0]?.qty).toBe(99);
  });

  it("removes a product when its quantity drops below 1", () => {
    expect(setQty([{ id: 1, qty: 1 }], 1, 0)).toEqual([]);
  });

  it("totals prices and savings", () => {
    // PlayStation 5 Slim: R$ 3.299,90 (de R$ 3.699,90)
    const t = cartTotals([{ id: 1, qty: 2 }], products);
    expect(t.subtotal).toBe(6599.8);
    expect(t.savings).toBe(800);
  });
});

describe("catalog rules", () => {
  it("only sells PlayStation, Xbox and Nintendo products", () => {
    const all = new Set(products.flatMap((p) => p.platforms));
    expect([...all].sort()).toEqual(["Nintendo", "PlayStation", "Xbox"]);
  });

  it("search ignores accents", () => {
    expect(filterProducts(products, { q: "pokemon" }).map((p) => p.id)).toContain(33);
    expect(filterProducts(products, { q: "perifericos" }).every((p) => p.category === "Periféricos")).toBe(true);
  });
});

import { cartStore as __cs } from "@/lib/cart";
import { getReviews } from "@/lib/reviews";
import { products as __ps } from "@/lib/products";
describe("rodada de melhorias", () => {
  it("todo produto tem nota entre 4 e 5 e ao menos 3 comentários", () => {
    for (const p of __ps) {
      const r = getReviews(p);
      expect(r.average).toBeGreaterThanOrEqual(4);
      expect(r.average).toBeLessThanOrEqual(5);
      expect(r.reviews.length).toBeGreaterThanOrEqual(3);
    }
  });
  it("limpar carrinho remove todos os itens", () => {
    __cs.add(1, 2); __cs.add(5, 1);
    __cs.clear();
    expect(__cs.getSnapshot()).toEqual([]);
  });
});
