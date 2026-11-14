import { createFileRoute } from "@tanstack/react-router";

import capa from "@/assets/brand/capa-perifericos.webp.asset.json";
import { CatalogView } from "@/components/site/CatalogView";
import { PageHeader } from "@/components/site/PageHeader";
import { validateCatalogSearch } from "@/lib/catalog";
import { useCatalogSetter } from "@/lib/use-catalog-search";

export const Route = createFileRoute("/perifericos")({
  validateSearch: validateCatalogSearch,
  head: () => ({
    meta: [
      { title: "Periféricos | KaTchau" },
      { name: "description", content: "Controles oficiais, headsets e fones para elevar a precisão e o conforto em cada sessão." },
      { property: "og:title", content: "Periféricos | KaTchau" },
      { property: "og:description", content: "Controles oficiais, headsets e fones para elevar a precisão e o conforto em cada sessão." },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  const setSearch = useCatalogSetter("/perifericos");
  return (
    <>
      <PageHeader
        crumb="Periféricos"
        eyebrow="Departamento"
        title={<>Controles e <span className="text-gradient-brand">periféricos</span></>}
        description="Controles oficiais, headsets e fones para elevar a precisão e o conforto em cada sessão."
        image={capa.url}
      />
      <CatalogView search={search} setSearch={setSearch} fixedCategory="Periféricos" />
    </>
  );
}
