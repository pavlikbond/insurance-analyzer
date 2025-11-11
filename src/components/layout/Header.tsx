import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// Reusable navigation link styles
const navLinkBase =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all h-9 px-4 py-2 cursor-pointer";
const navLinkGhost = cn(navLinkBase, "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50");
const navLinkPrimary = cn(navLinkBase, "bg-primary text-primary-foreground hover:bg-primary/90");
const mobileNavLink = "block px-4 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer";
const mobileNavLinkPrimary =
  "block px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer";

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if a route is active
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

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
    <header className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className={cn("flex items-center gap-2 cursor-pointer transition-colors", isActive("/") && "opacity-80")}
          >
            <FileText className="h-6 w-6" />
            <span className="text-xl font-bold">Insurance Analyzer</span>
          </Link>

          {isAuthenticated ? (
            <>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className={cn(
                    navLinkGhost,
                    isActive("/dashboard") && "bg-accent text-accent-foreground font-semibold"
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  to="/policies"
                  className={cn(
                    navLinkGhost,
                    isActive("/policies") && "bg-accent text-accent-foreground font-semibold"
                  )}
                >
                  Policies
                </Link>
                <Link
                  to="/reports"
                  className={cn(navLinkGhost, isActive("/reports") && "bg-accent text-accent-foreground font-semibold")}
                >
                  Reports
                </Link>
                <Link
                  to="/billing"
                  className={cn(navLinkGhost, isActive("/billing") && "bg-accent text-accent-foreground font-semibold")}
                >
                  Billing
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden lg:inline">{user?.name || user?.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => navigate("/settings")}
                      className={isActive("/settings") ? "bg-accent" : ""}
                    >
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
            </>
          ) : (
            <>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-2">
                <Link to="/signin" className={navLinkGhost}>
                  Sign In
                </Link>
                <Link to="/signup" className={navLinkPrimary}>
                  Sign Up
                </Link>
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
            </>
          )}
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
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className={cn(
                    mobileNavLink,
                    isActive("/dashboard") && "bg-accent text-accent-foreground font-semibold"
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  to="/policies"
                  onClick={closeMobileMenu}
                  className={cn(
                    mobileNavLink,
                    isActive("/policies") && "bg-accent text-accent-foreground font-semibold"
                  )}
                >
                  Policies
                </Link>
                <Link
                  to="/reports"
                  onClick={closeMobileMenu}
                  className={cn(
                    mobileNavLink,
                    isActive("/reports") && "bg-accent text-accent-foreground font-semibold"
                  )}
                >
                  Reports
                </Link>
                <Link
                  to="/billing"
                  onClick={closeMobileMenu}
                  className={cn(
                    mobileNavLink,
                    isActive("/billing") && "bg-accent text-accent-foreground font-semibold"
                  )}
                >
                  Billing
                </Link>
                <div className="border-t pt-2 mt-2">
                  <Link
                    to="/settings"
                    onClick={closeMobileMenu}
                    className={cn(
                      mobileNavLink,
                      "flex items-center gap-2",
                      isActive("/settings") && "bg-accent text-accent-foreground font-semibold"
                    )}
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
                <Link to="/signin" onClick={closeMobileMenu} className={mobileNavLink}>
                  Sign In
                </Link>
                <Link to="/signup" onClick={closeMobileMenu} className={mobileNavLinkPrimary}>
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
