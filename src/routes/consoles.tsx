import { createFileRoute } from "@tanstack/react-router";

import capa from "@/assets/brand/capa-consoles.webp.asset.json";
import { CatalogView } from "@/components/site/CatalogView";
import { PageHeader } from "@/components/site/PageHeader";
import { validateCatalogSearch } from "@/lib/catalog";
import { useCatalogSetter } from "@/lib/use-catalog-search";

export const Route = createFileRoute("/consoles")({
  validateSearch: validateCatalogSearch,
  head: () => ({
    meta: [
      { title: "Consoles | KaTchau" },
      { name: "description", content: "PlayStation 5, Xbox Series X|S e Nintendo Switch 2: encontre a plataforma ideal para a sua próxima partida." },
      { property: "og:title", content: "Consoles | KaTchau" },
      { property: "og:description", content: "PlayStation 5, Xbox Series X|S e Nintendo Switch 2: encontre a plataforma ideal para a sua próxima partida." },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  const setSearch = useCatalogSetter("/consoles");
  return (
    <>
      <PageHeader
        crumb="Consoles"
        eyebrow="Departamento"
        title={<>Consoles de <span className="text-gradient-brand">nova geração</span></>}
        description="PlayStation 5, Xbox Series X|S e Nintendo Switch 2: encontre a plataforma ideal para a sua próxima partida."
        image={capa.url}
      />
      <CatalogView search={search} setSearch={setSearch} fixedCategory="Consoles" />
    </>
  );
}
