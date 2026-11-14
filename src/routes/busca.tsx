import { createFileRoute, redirect } from "@tanstack/react-router";

// Old search address: forwards to the catalog, which handles searching.
export const Route = createFileRoute("/busca")({
  validateSearch: (s: Record<string, unknown>): { q?: string | undefined } => ({
    q: typeof s["q"] === "string" ? s["q"] : undefined,
  }),
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/catalogo", search: search.q ? { q: search.q } : {} });
  },
});
