import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingHeader() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate("/signin");
        },
      },
    });
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <span className="text-xl font-bold">Insurance Analyzer</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </a>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link to="/policies">
                  <Button variant="ghost">Policies</Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden lg:inline">{user?.name || user?.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span
              className={cn(
                "block w-6 h-0.5 bg-foreground transition-all duration-300 ease-in-out",
                isMobileMenuOpen && "rotate-45 translate-y-2"
              )}
            />
            <span
              className={cn(
                "block w-6 h-0.5 bg-foreground transition-all duration-300 ease-in-out",
                isMobileMenuOpen && "opacity-0"
              )}
            />
            <span
              className={cn(
                "block w-6 h-0.5 bg-foreground transition-all duration-300 ease-in-out",
                isMobileMenuOpen && "-rotate-45 -translate-y-2"
              )}
            />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <nav className="py-4 space-y-2 border-t">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={closeMobileMenu} className="block px-4 py-2 rounded-md hover:bg-accent transition-colors">
                  Dashboard
                </Link>
                <Link to="/policies" onClick={closeMobileMenu} className="block px-4 py-2 rounded-md hover:bg-accent transition-colors">
                  Policies
                </Link>
                <Link to="/reports" onClick={closeMobileMenu} className="block px-4 py-2 rounded-md hover:bg-accent transition-colors">
                  Reports
                </Link>
                <Link to="/billing" onClick={closeMobileMenu} className="block px-4 py-2 rounded-md hover:bg-accent transition-colors">
                  Billing
                </Link>
                <div className="border-t pt-2 mt-2">
                  <Link
                    to="/settings"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      handleSignOut();
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 rounded-md hover:bg-accent transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4 inline mr-2" />
                    {user?.name || user?.email}
                  </div>
                </div>
              </>
            ) : (
              <>
                <a
                  href="#features"
                  onClick={closeMobileMenu}
                  className="block px-4 py-2 rounded-md hover:bg-accent transition-colors"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  onClick={closeMobileMenu}
                  className="block px-4 py-2 rounded-md hover:bg-accent transition-colors"
                >
                  Pricing
                </a>
                <Link to="/signin" onClick={closeMobileMenu} className="block px-4 py-2 rounded-md hover:bg-accent transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" onClick={closeMobileMenu} className="block px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
