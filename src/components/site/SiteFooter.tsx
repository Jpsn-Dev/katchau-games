import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface/50">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs space-y-4">
          <Logo className="h-12" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Consoles, jogos e periféricos para PlayStation, Xbox e Nintendo — tudo em um só lugar.
          </p>
        </div>
        <FooterCol title="Loja">
          <Link to="/catalogo">Catálogo completo</Link>
          <Link to="/consoles">Consoles</Link>
          <Link to="/jogos">Jogos</Link>
          <Link to="/perifericos">Controles e periféricos</Link>
        </FooterCol>
        <FooterCol title="Plataformas">
          <Link to="/catalogo" search={{ plataforma: "PlayStation" }}>PlayStation</Link>
          <Link to="/catalogo" search={{ plataforma: "Xbox" }}>Xbox</Link>
          <Link to="/catalogo" search={{ plataforma: "Nintendo" }}>Nintendo</Link>
        </FooterCol>
        <FooterCol title="Institucional">
          <Link to="/sobre">Sobre a KaTchau</Link>
          <Link to="/atendimento">Atendimento</Link>
          <Link to="/faq">Dúvidas frequentes</Link>
        </FooterCol>
      </div>
      <div className="border-t border-border">
        <div className="wrap flex flex-col gap-2 py-5 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>© 2026 KaTchau. Projeto acadêmico sem fins comerciais.</span>
          <span>Preços e condições ilustrativos. Marcas e imagens pertencem aos seus respectivos donos.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-[0.18em] text-foreground">{title}</h3>
      <div className="flex flex-col gap-2.5 text-sm text-muted-foreground [&_a]:transition-colors [&_a:hover]:text-primary">
        {children}
      </div>
    </div>
  );
}
