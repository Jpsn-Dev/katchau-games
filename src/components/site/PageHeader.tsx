import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  image,
  crumb,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  image?: string;
  crumb: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {image ? (
        <>
          <img src={image} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-hero-fade" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-bottom-fade" />
        </>
      ) : (
        <div className="absolute inset-0 grid-texture" />
      )}
      <div className="wrap relative py-14 md:py-20">
        <nav aria-label="Navegação estrutural" className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Início</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">{crumb}</span>
        </nav>
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="display mt-3 max-w-2xl text-5xl md:text-7xl">{title}</h1>
        {description && <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">{description}</p>}
      </div>
    </section>
  );
}
