import { useNavigate } from "@tanstack/react-router";
import type { CatalogSearch } from "./catalog";

/** Updates catalog filters in the URL without scrolling the page back to the top. */
export function useCatalogSetter(from: "/catalogo" | "/consoles" | "/jogos" | "/perifericos") {
  const navigate = useNavigate({ from });
  return (patch: Partial<CatalogSearch>) =>
    navigate({
      search: (prev: CatalogSearch) => ({ ...prev, ...patch }),
      replace: true,
      resetScroll: false,
    });
}
