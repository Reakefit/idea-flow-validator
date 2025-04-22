
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
}

const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  (
    { className, children, size = "md", variant = "primary", ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-lg font-medium text-white transition-all duration-300",
          "hover:shadow-lg hover:shadow-primary/20",
          "active:scale-95",
          {
            "text-sm px-4 py-2": size === "sm",
            "text-base px-6 py-3": size === "md",
            "text-lg px-8 py-4": size === "lg",
            "bg-gradient-primary": variant === "primary",
            "bg-gradient-secondary": variant === "secondary",
          },
          className
        )}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

GradientButton.displayName = "GradientButton";

export { GradientButton };
