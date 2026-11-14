import { Link } from "@tanstack/react-router";
import logo from "@/assets/brand/katchau-logo.webp.asset.json";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" aria-label="KaTchau — página inicial" className={cn("inline-flex shrink-0", className)}>
      <img src={logo.url} alt="KaTchau Games & Gear" width={700} height={278} className="h-full w-auto" />
    </Link>
  );
}
