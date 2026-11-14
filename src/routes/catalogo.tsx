import { createFileRoute } from "@tanstack/react-router";

import capa from "@/assets/brand/capa-inicial.webp.asset.json";
import { CatalogView } from "@/components/site/CatalogView";
import { PageHeader } from "@/components/site/PageHeader";
import { validateCatalogSearch } from "@/lib/catalog";
import { useCatalogSetter } from "@/lib/use-catalog-search";

export const Route = createFileRoute("/catalogo")({
  validateSearch: validateCatalogSearch,
  head: () => ({
    meta: [
      { title: "Catálogo completo | KaTchau" },
      { name: "description", content: "Todos os consoles, jogos e periféricos para PlayStation, Xbox e Nintendo da KaTchau." },
      { property: "og:title", content: "Catálogo completo | KaTchau" },
      { property: "og:description", content: "Filtre por categoria, plataforma e faixa de preço." },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const search = Route.useSearch();
  const setSearch = useCatalogSetter("/catalogo");
  return (
    <>
      <PageHeader
        crumb={search.q ? "Busca" : "Catálogo"}
        eyebrow={search.q ? "Resultado da busca" : "KaTchau / Catálogo"}
        title={search.q ? <>Busca por “{search.q}”</> : <>Catálogo <span className="text-gradient-brand">completo</span></>}
        description="Consoles, jogos e periféricos para PlayStation, Xbox e Nintendo. Use os filtros para encontrar o que procura."
        image={capa.url}
      />
      <CatalogView search={search} setSearch={setSearch} />
    </>
  );
}
