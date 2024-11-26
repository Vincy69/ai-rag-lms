import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { label: "Chat", path: "/chat" },
    { label: "Upload", path: "/upload" },
    { label: "Documents", path: "/documents" },
    { label: "Historique", path: "/history" },
    { label: "Formations", path: "/formations" },
  ];

  return (
    <header className="glass sticky top-0 z-50 w-full border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">AI Assistant</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm transition-colors hover:text-primary ${
                  location.pathname === item.path ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <Link
            to="/account"
            className={`flex items-center space-x-2 text-sm transition-colors hover:text-primary ${
              location.pathname === "/account" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Mon compte</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 glass border-b md:hidden">
            <nav className="container flex flex-col space-y-4 p-4">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm transition-colors hover:text-primary ${
                    location.pathname === item.path ? "text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/account"
                className={`flex items-center space-x-2 text-sm transition-colors hover:text-primary ${
                  location.pathname === "/account" ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                <span>Mon compte</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}