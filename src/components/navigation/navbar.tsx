
import { cn } from "@/lib/utils";
import { GradientButton } from "../ui/gradient-button";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface NavbarProps {
  className?: string;
}

const Navbar = ({ className }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "py-3 glass shadow-lg shadow-black/10"
          : "py-5 bg-transparent",
        className
      )}
    >
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-gradient">
            InsightValidator
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            to="/features"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            to="/pricing"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link to="/login">
            <GradientButton size="sm">Get Started</GradientButton>
          </Link>
        </div>
      </div>
    </header>
  );
};

export { Navbar };
