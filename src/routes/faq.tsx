import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Dúvidas frequentes | KaTchau" },
      { name: "description", content: "Respostas rápidas sobre compras, preços, carrinho e o projeto KaTchau." },
      { property: "og:title", content: "Dúvidas frequentes | KaTchau" },
      { property: "og:description", content: "Respostas rápidas sobre compras, preços, carrinho e o projeto KaTchau." },
    ],
  }),
  component: FaqPage,
});

const FAQ = [
  { q: "A KaTchau realiza vendas de verdade?", a: "Não. A KaTchau é um projeto universitário. O carrinho e a finalização de compra são simulações para demonstrar a experiência de uma loja virtual." },
  { q: "Os preços e descontos são reais?", a: "Não. Todos os preços, descontos e parcelamentos foram criados exclusivamente para demonstrar a interface." },
  { q: "Preciso criar uma conta?", a: "Não. A loja não possui cadastro nem login. Você pode navegar e montar seu carrinho livremente." },
  { q: "O carrinho fica salvo?", a: "Sim. Os produtos ficam salvos apenas no seu navegador, neste dispositivo. Nenhum pedido é enviado." },
  { q: "As imagens e produtos são oficiais?", a: "As imagens são usadas como referência visual de produtos e jogos conhecidos. A loja é fictícia e não tem vínculo com fabricantes ou marcas." },
  { q: "Como entro em contato?", a: "A página de Atendimento mostra como seria a central de suporte da loja. O formulário é apenas demonstrativo." },
];

function FaqPage() {
  return (
    <>
      <PageHeader crumb="Dúvidas frequentes" eyebrow="Central de ajuda" title={<>Dúvidas <span className="text-gradient-brand">frequentes</span></>} description="Tudo o que você precisa saber sobre a experiência KaTchau." />
      <div className="wrap grid gap-12 py-14 lg:grid-cols-[1fr_320px]">
        <Accordion type="single" collapsible defaultValue="item-0" className="rounded-xl border border-border bg-card px-6">
          {FAQ.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`} className="border-border last:border-b-0">
              <AccordionTrigger className="py-5 text-left text-base font-semibold hover:no-underline hover:text-primary">{f.q}</AccordionTrigger>
              <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <aside className="h-fit rounded-xl border border-border bg-surface p-6">
          <p className="font-display text-xl font-bold uppercase tracking-wide">Não achou sua resposta?</p>
          <p className="mt-2 text-sm text-muted-foreground">Fale com a gente pela página de atendimento.</p>
          <Link to="/atendimento" className="mt-5 inline-flex font-semibold text-primary hover:underline">Ir para o atendimento →</Link>
        </aside>
      </div>
    </>
  );
}
