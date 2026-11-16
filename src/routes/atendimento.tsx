import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Copy, HelpCircle, Mail, Package, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { CONTACT_EMAIL } from "@/lib/contact";
import { useState, type FormEvent } from "react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/atendimento")({
  head: () => ({
    meta: [
      { title: "Atendimento | KaTchau" },
      { name: "description", content: "Central de atendimento da KaTchau: dúvidas sobre pedidos, produtos e o projeto." },
      { property: "og:title", content: "Atendimento | KaTchau" },
      { property: "og:description", content: "Central de atendimento da KaTchau." },
    ],
  }),
  component: SupportPage,
});

const TOPICS = [
  { icon: Package, title: "Pedidos e entregas", text: "Como a loja é demonstrativa, nenhum pedido ou pagamento é processado." },
  { icon: HelpCircle, title: "Informações de produtos", text: "Consulte os departamentos para ver detalhes, preços e plataformas de cada item." },
  { icon: ShieldCheck, title: "Sobre o projeto", text: "A KaTchau é um projeto acadêmico, sem equipe comercial ou canal de vendas ativo." },
];

function SupportPage() {
  const [sent, setSent] = useState(false);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.currentTarget.reset();
    setSent(true);
  };
  return (
    <>
      <PageHeader crumb="Atendimento" eyebrow="Central de ajuda" title={<>Como podemos <span className="text-gradient-brand">ajudar?</span></>} description="Escolha um assunto ou envie uma mensagem para a equipe do projeto." />
      <div className="wrap py-14">
        <div className="grid gap-4 md:grid-cols-3">
          {TOPICS.map((t) => (
            <div key={t.title} className="rounded-xl border border-border bg-card p-6">
              <t.icon className="size-6 text-primary" />
              <p className="mt-4 font-semibold">{t.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <span className="eyebrow">Fale conosco</span>
            <h2 className="display mt-3 text-4xl">Envie sua mensagem</h2>
            <p className="mt-4 text-muted-foreground">
              Este formulário é demonstrativo: nenhuma mensagem ou dado é enviado ou armazenado. Para dúvidas rápidas, confira as{" "}
              <Link to="/faq" className="font-semibold text-primary hover:underline">perguntas frequentes</Link>.
            </p>
            <EmailCard />
          </div>
          <form onSubmit={submit} className="space-y-5 rounded-xl border border-border bg-card p-6 md:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" required maxLength={80} placeholder="Seu nome" className="h-11 bg-surface" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" required maxLength={120} placeholder="voce@email.com" className="h-11 bg-surface" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assunto">Assunto</Label>
              <Input id="assunto" required maxLength={120} placeholder="Sobre o que você quer falar?" className="h-11 bg-surface" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mensagem">Mensagem</Label>
              <Textarea id="mensagem" required maxLength={1000} rows={5} placeholder="Escreva sua mensagem" className="bg-surface" />
            </div>
            <Button type="submit" variant="brand" size="xl" className="w-full sm:w-auto">Enviar mensagem</Button>
            {sent && (
              <p role="status" className="rounded-md border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-foreground">
                Obrigado! Como este é um ambiente demonstrativo, sua mensagem não foi enviada nem armazenada.
              </p>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

function EmailCard() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      toast.success("E-mail copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Não foi possível copiar", { description: CONTACT_EMAIL });
    }
  };
  return (
    <div className="mt-8 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
          <Mail className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">E-mail do projeto</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="block truncate font-semibold hover:text-primary">{CONTACT_EMAIL}</a>
        </div>
        <button
          type="button"
          onClick={copy}
          aria-label="Copiar e-mail"
          className="grid size-10 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Endereço demonstrativo do projeto acadêmico — não há atendimento comercial.</p>
    </div>
  );
}
