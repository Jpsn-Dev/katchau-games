import { normalizeText } from "./format";
import type { Category, Platform, Product } from "./products";

export type SortKey = "relevancia" | "menor-preco" | "maior-preco" | "nome";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevancia", label: "Mais relevantes" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "nome", label: "Nome (A–Z)" },
];

export const PRICE_RANGES = [
  { value: "0-200", label: "Até R$ 200", min: 0, max: 200 },
  { value: "200-500", label: "R$ 200 a R$ 500", min: 200, max: 500 },
  { value: "500-1000", label: "R$ 500 a R$ 1.000", min: 500, max: 1000 },
  { value: "1000-99999", label: "Acima de R$ 1.000", min: 1000, max: 99999 },
] as const;

export type CatalogFilters = {
  q?: string | undefined;
  categorias?: Category[] | undefined;
  plataformas?: Platform[] | undefined;
  precos?: string[] | undefined;
  ordem?: SortKey | undefined;
};

const RELEVANCE = [5, 1, 4, 19, 17, 10, 36, 3, 7, 22, 24, 2, 8, 18, 35, 34, 33, 16];

export function filterProducts(list: Product[], f: CatalogFilters): Product[] {
  let out = list;
  const q = normalizeText(f.q?.trim() ?? "");
  if (q) {
    out = out.filter((p) =>
      normalizeText(`${p.name} ${p.category} ${p.platforms.join(" ")} ${p.tag}`).includes(q),
    );
  }
  if (f.categorias?.length) out = out.filter((p) => f.categorias!.includes(p.category));
  if (f.plataformas?.length)
    out = out.filter((p) => p.platforms.some((pl) => f.plataformas!.includes(pl)));
  if (f.precos?.length) {
    const ranges = PRICE_RANGES.filter((r) => f.precos!.includes(r.value));
    out = out.filter((p) => ranges.some((r) => p.price >= r.min && p.price < r.max));
  }
  const sorted = [...out];
  switch (f.ordem ?? "relevancia") {
    case "menor-preco":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "maior-preco":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "nome":
      sorted.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
      break;
    default: {
      const rank = (id: number) => {
        const i = RELEVANCE.indexOf(id);
        return i === -1 ? 100 + id : i;
      };
      sorted.sort((a, b) => rank(a.id) - rank(b.id));
    }
  }
  return sorted;
}

/** Parses comma separated search params safely. */
export function parseList<T extends string>(value: unknown, allowed: readonly T[]): T[] | undefined {
  if (typeof value !== "string" || !value) return undefined;
  const items = value.split(",").filter((v): v is T => (allowed as readonly string[]).includes(v));
  return items.length ? items : undefined;
}

export type CatalogSearch = {
  q?: string | undefined;
  plataforma?: string | undefined;
  preco?: string | undefined;
  ordem?: SortKey | undefined;
  categoria?: string | undefined;
};

export function validateCatalogSearch(raw: Record<string, unknown>): CatalogSearch {
  const search = raw as { [K in keyof CatalogSearch]?: unknown };
  const out: CatalogSearch = {};
  if (typeof search.q === "string" && search.q.trim()) out.q = search.q.slice(0, 80);
  if (typeof search.plataforma === "string" && search.plataforma) out.plataforma = search.plataforma;
  if (typeof search.preco === "string" && search.preco) out.preco = search.preco;
  if (typeof search.categoria === "string" && search.categoria) out.categoria = search.categoria;
  if (SORT_OPTIONS.some((o) => o.value === search.ordem)) out.ordem = search.ordem as SortKey;
  return out;
}
