import { Link } from "@tanstack/react-router";
import { Facebook, Gamepad2, Instagram, Mail, ShieldCheck, Tag, Truck, Youtube } from "lucide-react";

import { CONTACT_EMAIL } from "@/lib/contact";
import { Logo } from "./Logo";

const PERKS = [
  { icon: Gamepad2, title: "Só PlayStation, Xbox e Nintendo", text: "Curadoria focada em consoles" },
  { icon: Tag, title: "Até 10x sem juros", text: "Condições ilustrativas" },
  { icon: Truck, title: "Entrega simulada", text: "Nenhum pedido é enviado" },
  { icon: ShieldCheck, title: "Ambiente seguro", text: "Sem pagamentos reais" },
];

const SOCIAL = [
  { icon: Instagram, label: "Instagram" },
  { icon: Youtube, label: "YouTube" },
  { icon: Facebook, label: "Facebook" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface/50">
      <div className="border-b border-border">
        <ul className="wrap grid grid-cols-2 gap-px py-6 lg:grid-cols-4">
          {PERKS.map((p) => (
            <li key={p.title} className="flex items-center gap-3 py-2 pr-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                <p.icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-tight">{p.title}</span>
                <span className="block text-xs text-muted-foreground">{p.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="wrap grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.4fr]">
        <div className="max-w-xs space-y-4 sm:col-span-2 lg:col-span-1">
          <Logo className="h-12" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Consoles, jogos e periféricos para PlayStation, Xbox e Nintendo — uma vitrine gamer criada como projeto acadêmico.
          </p>
          <div className="flex gap-2" aria-label="Redes sociais (perfis ainda não existem)">
            {SOCIAL.map((s) => (
              <span
                key={s.label}
                title={`${s.label} — perfil não disponível neste projeto`}
                className="grid size-9 place-items-center rounded-md border border-border text-muted-foreground/70"
              >
                <s.icon className="size-4" />
                <span className="sr-only">{s.label} (indisponível)</span>
              </span>
            ))}
          </div>
        </div>
        <FooterCol title="Departamentos">
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
          <Link to="/atendimento">Atendimento</Link>
          <Link to="/faq">Dúvidas frequentes</Link>
          <Link to="/sobre">Sobre a KaTchau</Link>
        </FooterCol>
        <div>
          <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-[0.18em] text-foreground">Contato</h3>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="group flex items-start gap-2.5 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="break-all">{CONTACT_EMAIL}</span>
          </a>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            E-mail demonstrativo. Sem atendimento comercial.
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="wrap flex flex-col gap-2 py-5 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>© 2026 KaTchau. Todos os direitos reservados. Projeto acadêmico sem fins comerciais.</span>
          <span>Preços, avaliações e condições ilustrativos. Marcas e imagens pertencem aos seus donos.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-[0.18em] text-foreground">{title}</h3>
      <div className="flex flex-col gap-2.5 text-sm text-muted-foreground [&_a]:w-fit [&_a]:transition-colors [&_a:hover]:text-primary">
        {children}
      </div>
    </div>
  );
}
