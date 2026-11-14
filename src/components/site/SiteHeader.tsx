import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Logo } from "./Logo";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cartCount, useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const MAIN_NAV = [
  { to: "/", label: "Início", exact: true },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/consoles", label: "Consoles" },
  { to: "/jogos", label: "Jogos" },
  { to: "/perifericos", label: "Periféricos" },
] as const;

const HELP_NAV = [
  { to: "/atendimento", label: "Atendimento" },
  { to: "/faq", label: "Dúvidas frequentes" },
  { to: "/sobre", label: "Sobre a KaTchau" },
] as const;

const PLATFORM_LINKS = ["PlayStation", "Xbox", "Nintendo"] as const;

function SearchBox({ className, onDone }: { className?: string; onDone?: () => void }) {
  const navigate = useNavigate();
  const currentQ = useRouterState({
    select: (s) => (s.location.search as { q?: string }).q ?? "",
  });
  const [term, setTerm] = useState(currentQ);
  useEffect(() => setTerm(currentQ), [currentQ]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    navigate({ to: "/catalogo", search: q ? { q } : {} });
    onDone?.();
  };

  return (
    <form onSubmit={submit} role="search" className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        type="search"
        placeholder="Buscar consoles, jogos e periféricos"
        aria-label="Buscar produtos"
        className="h-11 w-full rounded-full border border-input bg-surface pl-11 pr-24 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-full bg-primary px-4 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:brightness-110"
      >
        Buscar
      </button>
    </form>
  );
}

function CartButton() {
  const items = useCart();
  const count = cartCount(items);
  return (
    <Link
      to="/carrinho"
      className="group relative inline-flex h-11 items-center gap-2.5 rounded-full border border-border bg-surface px-4 text-sm font-semibold transition-colors hover:border-primary"
      aria-label={`Carrinho, ${count} ${count === 1 ? "item" : "itens"}`}
    >
      <ShoppingBag className="size-5 text-primary" />
      <span className="hidden sm:inline">Carrinho</span>
      <span className="grid min-w-6 place-items-center rounded-full bg-signal px-1.5 text-xs font-bold leading-6 text-signal-foreground tabular-nums">
        {count}
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="hidden border-b border-border/70 bg-surface/60 md:block">
        <div className="wrap flex h-9 items-center justify-between text-xs text-muted-foreground">
          <span>Projeto acadêmico · preços ilustrativos · nenhuma venda é realizada</span>
          <nav className="flex gap-5">
            {HELP_NAV.map((l) => (
              <Link key={l.to} to={l.to} className="transition-colors hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="wrap flex h-[72px] items-center gap-4 md:gap-8">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="grid size-11 place-items-center rounded-full border border-border bg-surface lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[86vw] max-w-sm border-border bg-background p-0">
            <SheetHeader className="border-b border-border p-5">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="h-10" onClick={() => setOpen(false)}>
                <Logo className="h-10" />
              </div>
            </SheetHeader>
            <div className="space-y-6 p-5">
              <SearchBox onDone={() => setOpen(false)} />
              <nav className="flex flex-col">
                {[...MAIN_NAV, ...HELP_NAV, { to: "/carrinho", label: "Carrinho" } as const].map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="border-b border-border/60 py-3.5 font-display text-xl font-bold uppercase tracking-wide"
                    activeProps={{ className: "text-primary" }}
                    activeOptions={{ exact: l.to === "/" }}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <Logo className="h-9 md:h-11" />
        <SearchBox className="hidden flex-1 md:block md:max-w-xl" />
        <div className="ml-auto">
          <CartButton />
        </div>
      </div>

      <div className="hidden border-t border-border/70 lg:block">
        <div className="wrap flex h-12 items-center justify-between">
          <nav className="flex h-full items-center gap-1">
            {MAIN_NAV.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: "exact" in l, includeSearch: false }}
                className="relative flex h-full items-center px-4 font-display text-[15px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{
                  className:
                    "!text-foreground after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:bg-primary",
                }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="mr-1 uppercase tracking-widest">Plataformas</span>
            {PLATFORM_LINKS.map((p) => (
              <Link
                key={p}
                to="/catalogo"
                search={{ plataforma: p }}
                className="rounded-full border border-border px-3 py-1 font-semibold text-foreground/80 transition-colors hover:border-primary hover:text-primary"
              >
                {p}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="wrap pb-3 md:hidden">
        <SearchBox />
      </div>
    </header>
  );
}
