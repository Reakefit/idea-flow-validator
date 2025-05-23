import { cn } from "@/lib/utils";
import { GradientButton } from "../ui/gradient-button";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/context/AuthContext";
import { useProject } from "@/lib/context/ProjectContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  className?: string;
}

const Navbar = ({ className }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut, isLoading } = useAuth();
  const { currentProject } = useProject();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return user?.email?.[0].toUpperCase() || 'U';
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleCreateNewProject = () => {
    // This would typically open a modal or navigate to a project creation page
    // For now, we'll just navigate to the dashboard
    navigate('/dashboard');
  };

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
          {user && (
            <>
              <Link
                to="/dashboard"
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/chat"
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                Problem Chat
              </Link>
              <Link
                to="/interviews"
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                Interviews
              </Link>
              {currentProject && currentProject.progress.problem_validation === 'complete' && (
                <>
                  <Link
                    to="/insights"
                    className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  >
                    Insights
                  </Link>
                </>
              )}
            </>
          )}
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
        </nav>

        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-primary animate-spin"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 bg-primary/20">
                    <AvatarFallback>{getInitials(user.user_metadata?.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.user_metadata?.name && (
                      <p className="font-medium">{user.user_metadata.name}</p>
                    )}
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCreateNewProject}>
                  New Project
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium hover:text-primary">
                Sign in
              </Link>
              <Link to="/register">
                <GradientButton size="sm">Get Started</GradientButton>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export { Navbar };
