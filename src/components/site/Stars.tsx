import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`Nota ${value.toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className="relative inline-block size-[1em]">
            <Star className="absolute inset-0 size-full text-muted-foreground/40" strokeWidth={1.5} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="size-[1em] fill-primary text-primary" strokeWidth={1.5} />
            </span>
          </span>
        );
      })}
    </span>
  );
}
