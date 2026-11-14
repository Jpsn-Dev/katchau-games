import { createFileRoute, Link } from "@tanstack/react-router";
import { Gamepad2, Headphones, MonitorPlay } from "lucide-react";

import capaPerifericos from "@/assets/brand/capa-perifericos.webp.asset.json";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/products";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a KaTchau | Loja de games" },
      { name: "description", content: "Conheça a KaTchau, uma proposta de loja especializada em consoles, jogos e periféricos." },
      { property: "og:title", content: "Sobre a KaTchau" },
      { property: "og:description", content: "Uma loja feita para quem joga." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const count = (c: string) => products.filter((p) => p.category === c).length;
  const pillars = [
    { icon: MonitorPlay, title: "Consoles", text: "Plataformas de mesa e portáteis das três grandes marcas.", n: count("Consoles") },
    { icon: Gamepad2, title: "Jogos", text: "Lançamentos e clássicos de todos os gêneros.", n: count("Jogos") },
    { icon: Headphones, title: "Periféricos", text: "Controles, áudio e acessórios para o seu setup.", n: count("Periféricos") },
  ];
  return (
    <>
      <PageHeader crumb="Sobre" eyebrow="Institucional" title={<>Uma loja feita <span className="text-gradient-brand">para quem joga</span></>} />
      <div className="wrap py-14">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-5 text-[17px] leading-relaxed text-muted-foreground">
            <p>
              A <strong className="text-foreground">KaTchau</strong> é uma marca fictícia criada como projeto universitário. A proposta é construir uma experiência de comércio eletrônico focada em consoles, jogos e acessórios — com catálogo organizado, navegação simples e identidade visual marcante.
            </p>
            <p>
              O catálogo é dividido em três áreas — consoles, jogos e periféricos — e pode ser explorado por departamento, plataforma ou busca.
            </p>
            <p className="rounded-lg border-l-2 border-signal bg-surface px-5 py-4 text-sm">
              <strong className="text-foreground">Transparência:</strong> a KaTchau não é uma loja em operação. Não há estoque, venda, pagamento, entrega ou atendimento comercial. Valores e condições são fictícios.
            </p>
            <Button asChild variant="brand" size="xl">
              <Link to="/catalogo">Conhecer o catálogo</Link>
            </Button>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <img src={capaPerifericos.url} alt="Controle, headset, teclado e mouse com iluminação amarela" loading="lazy" className="aspect-[16/10] w-full object-cover" />
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-xl border border-border bg-card p-7">
              <div className="flex items-center justify-between">
                <p.icon className="size-7 text-primary" />
                <span className="font-display text-4xl font-bold text-foreground/15">{String(p.n).padStart(2, "0")}</span>
              </div>
              <p className="display mt-6 text-3xl">{p.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
