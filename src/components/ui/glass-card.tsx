
import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, glow = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-card rounded-xl p-6 transition-all duration-300",
          "hover:shadow-xl hover:shadow-black/5",
          { glow: glow },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
