import { createFileRoute } from "@tanstack/react-router";

import capa from "@/assets/brand/capa-jogos.webp.asset.json";
import { CatalogView } from "@/components/site/CatalogView";
import { PageHeader } from "@/components/site/PageHeader";
import { validateCatalogSearch } from "@/lib/catalog";
import { useCatalogSetter } from "@/lib/use-catalog-search";

export const Route = createFileRoute("/jogos")({
  validateSearch: validateCatalogSearch,
  head: () => ({
    meta: [
      { title: "Jogos | KaTchau" },
      { name: "description", content: "Dos lançamentos mais esperados aos clássicos indispensáveis — aventura, corrida, RPG, esporte e muito mais." },
      { property: "og:title", content: "Jogos | KaTchau" },
      { property: "og:description", content: "Dos lançamentos mais esperados aos clássicos indispensáveis — aventura, corrida, RPG, esporte e muito mais." },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  const setSearch = useCatalogSetter("/jogos");
  return (
    <>
      <PageHeader
        crumb="Jogos"
        eyebrow="Departamento"
        title={<>Jogos para <span className="text-gradient-brand">todos os estilos</span></>}
        description="Dos lançamentos mais esperados aos clássicos indispensáveis — aventura, corrida, RPG, esporte e muito mais."
        image={capa.url}
      />
      <CatalogView search={search} setSearch={setSearch} fixedCategory="Jogos" />
    </>
  );
}
