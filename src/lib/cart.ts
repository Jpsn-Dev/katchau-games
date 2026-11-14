import { useSyncExternalStore } from "react";
import type { Product } from "./products";

export type CartItem = { id: number; qty: number };

export const MAX_QTY = 99;
const KEY = "katchau-cart-v5";

/* ---------- pure logic ---------- */

const clamp = (n: number) => Math.max(1, Math.min(MAX_QTY, Math.floor(n)));

export function addItem(items: CartItem[], id: number, qty = 1): CartItem[] {
  const found = items.find((i) => i.id === id);
  if (found) return items.map((i) => (i.id === id ? { ...i, qty: clamp(i.qty + qty) } : i));
  return [...items, { id, qty: clamp(qty) }];
}

export function setQty(items: CartItem[], id: number, qty: number): CartItem[] {
  if (qty < 1) return removeItem(items, id);
  return items.map((i) => (i.id === id ? { ...i, qty: clamp(qty) } : i));
}

export function removeItem(items: CartItem[], id: number): CartItem[] {
  return items.filter((i) => i.id !== id);
}

export const cartCount = (items: CartItem[]) => items.reduce((s, i) => s + i.qty, 0);

export function cartTotals(items: CartItem[], catalog: Product[]) {
  let subtotal = 0;
  let original = 0;
  for (const item of items) {
    const p = catalog.find((x) => x.id === item.id);
    if (!p) continue;
    subtotal += p.price * item.qty;
    original += p.oldPrice * item.qty;
  }
  const round = (n: number) => Math.round(n * 100) / 100;
  return { subtotal: round(subtotal), savings: round(original - subtotal) };
}

/* ---------- browser store ---------- */

const EMPTY: CartItem[] = [];
let state: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    if (Array.isArray(parsed)) {
      state = parsed
        .filter((i) => Number.isFinite(Number(i?.id)))
        .map((i) => ({ id: Number(i.id), qty: clamp(Number(i.qty) || 1) }));
    }
  } catch {
    state = EMPTY;
  }
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      loaded = false;
      load();
      listeners.forEach((l) => l());
    }
  });
}

function commit(next: CartItem[]) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked: keep in memory */
  }
  listeners.forEach((l) => l());
}

export const cartStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot() {
    load();
    return state;
  },
  add: (id: number, qty = 1) => commit(addItem(cartStore.getSnapshot(), id, qty)),
  setQty: (id: number, qty: number) => commit(setQty(cartStore.getSnapshot(), id, qty)),
  remove: (id: number) => commit(removeItem(cartStore.getSnapshot(), id)),
  clear: () => commit([]),
};

export function useCart() {
  return useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, () => EMPTY);
}
