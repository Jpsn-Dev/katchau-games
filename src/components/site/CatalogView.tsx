import { Link } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { useMemo } from "react";

import { ProductCard } from "./ProductCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  filterProducts,
  parseList,
  PRICE_RANGES,
  SORT_OPTIONS,
  type CatalogSearch,
  type SortKey,
} from "@/lib/catalog";
import { CATEGORIES, PLATFORMS, products, type Category } from "@/lib/products";

type Props = {
  search: CatalogSearch;
  setSearch: (patch: Partial<CatalogSearch>) => void;
  fixedCategory?: Category;
};

const toggle = (list: string[] | undefined, value: string) => {
  const set = new Set(list ?? []);
  if (set.has(value)) set.delete(value);
  else set.add(value);
  return set.size ? [...set].join(",") : undefined;
};

export function CatalogView({ search, setSearch, fixedCategory }: Props) {
  const categorias = fixedCategory ? [fixedCategory] : parseList(search.categoria, CATEGORIES);
  const plataformas = parseList(search.plataforma, PLATFORMS);
  const precos = parseList(search.preco, PRICE_RANGES.map((r) => r.value));
  const ordem: SortKey = search.ordem ?? "relevancia";

  const list = useMemo(
    () => filterProducts(products, { q: search.q, categorias, plataformas, precos, ordem }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search.q, search.categoria, search.plataforma, search.preco, ordem, fixedCategory],
  );

  const chips: { label: string; clear: () => void }[] = [];
  if (search.q) chips.push({ label: `“${search.q}”`, clear: () => setSearch({ q: undefined }) });
  if (!fixedCategory)
    categorias?.forEach((c) =>
      chips.push({ label: c, clear: () => setSearch({ categoria: toggle(categorias, c) }) }),
    );
  plataformas?.forEach((p) =>
    chips.push({ label: p, clear: () => setSearch({ plataforma: toggle(plataformas, p) }) }),
  );
  precos?.forEach((v) =>
    chips.push({
      label: PRICE_RANGES.find((r) => r.value === v)!.label,
      clear: () => setSearch({ preco: toggle(precos, v) }),
    }),
  );
  const clearAll = () =>
    setSearch({ q: undefined, categoria: undefined, plataforma: undefined, preco: undefined });

  const filters = (
    <div className="space-y-7">
      {!fixedCategory && (
        <FilterGroup title="Categoria">
          {CATEGORIES.map((c) => (
            <FilterCheck
              key={c}
              label={c}
              count={products.filter((p) => p.category === c).length}
              checked={!!categorias?.includes(c)}
              onChange={() => setSearch({ categoria: toggle(categorias, c) })}
            />
          ))}
        </FilterGroup>
      )}
      <FilterGroup title="Plataforma">
        {PLATFORMS.map((p) => (
          <FilterCheck
            key={p}
            label={p}
            count={products.filter((x) => (!fixedCategory || x.category === fixedCategory) && x.platforms.includes(p)).length}
            checked={!!plataformas?.includes(p)}
            onChange={() => setSearch({ plataforma: toggle(plataformas, p) })}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Faixa de preço">
        {PRICE_RANGES.map((r) => (
          <FilterCheck
            key={r.value}
            label={r.label}
            checked={!!precos?.includes(r.value)}
            onChange={() => setSearch({ preco: toggle(precos, r.value) })}
          />
        ))}
      </FilterGroup>
      {chips.length > 0 && (
        <button onClick={clearAll} className="text-sm font-semibold text-primary hover:underline">
          Limpar todos os filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="wrap py-10">
      {!fixedCategory && (
        <div className="scrollbar-none -mx-1 mb-8 flex gap-2 overflow-x-auto px-1">
          {[undefined, ...CATEGORIES].map((c) => {
            const active = c ? categorias?.length === 1 && categorias[0] === c : !categorias?.length;
            return (
              <button
                key={c ?? "todos"}
                onClick={() => setSearch({ categoria: c })}
                className={
                  active
                    ? "shrink-0 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
                    : "shrink-0 rounded-full border border-border px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                }
              >
                {c ?? "Todos os produtos"}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-44">
            <h2 className="mb-6 font-display text-lg font-bold uppercase tracking-widest">Filtrar por</h2>
            {filters}
          </div>
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{list.length}</strong>{" "}
              {list.length === 1 ? "produto encontrado" : "produtos encontrados"}
            </p>
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-semibold lg:hidden">
                  <SlidersHorizontal className="size-4" /> Filtros
                  {chips.length > 0 && (
                    <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                      {chips.length}
                    </span>
                  )}
                </SheetTrigger>
                <SheetContent side="left" className="w-[86vw] max-w-sm overflow-y-auto border-border bg-background">
                  <SheetHeader className="mb-6 p-0">
                    <SheetTitle className="font-display text-xl uppercase tracking-widest">Filtrar por</SheetTitle>
                  </SheetHeader>
                  {filters}
                </SheetContent>
              </Sheet>
              <Select value={ordem} onValueChange={(v) => setSearch({ ordem: v === "relevancia" ? undefined : (v as SortKey) })}>
                <SelectTrigger className="h-10 w-[190px] border-border bg-surface" aria-label="Ordenar produtos">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {chips.map((c) => (
                <button
                  key={c.label}
                  onClick={c.clear}
                  className="inline-flex items-center gap-1.5 rounded-full bg-surface-raised px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
                >
                  {c.label} <X className="size-3.5" />
                </button>
              ))}
            </div>
          )}

          {list.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border px-6 py-20 text-center">
              <p className="display text-3xl">Nada por aqui</p>
              <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
                Não encontramos produtos com esses filtros. Tente outro termo ou limpe os filtros.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button onClick={clearAll} className="rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
                  Limpar filtros
                </button>
                <Link to="/catalogo" className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold">
                  Ver catálogo
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{title}</legend>
      <div className="space-y-2.5">{children}</div>
    </fieldset>
  );
}

function FilterCheck({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground/90 hover:text-foreground">
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        className="border-input data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs tabular-nums text-muted-foreground">{count}</span>}
    </label>
  );
}
