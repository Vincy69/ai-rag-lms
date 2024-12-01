import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  GraduationCap, 
  Upload as UploadIcon, 
  Files, 
  History, 
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  FileText,
  Layers
} from "lucide-react";
import { Header } from "./Header";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

interface NavItem {
  icon: any;
  label: string;
  path: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const mainNavItems: NavSection[] = [
  {
    items: [
      { icon: MessageSquare, label: "Chat", path: "/chat" },
      { icon: BookOpen, label: "Ma formation", path: "/elearning" },
      { icon: GraduationCap, label: "Formations", path: "/formations" },
    ]
  },
  {
    title: "Administration",
    items: [
      { icon: Layers, label: "Gestion des formations", path: "/admin/courses" },
      { icon: UploadIcon, label: "Upload", path: "/upload" },
      { icon: Files, label: "Documents", path: "/documents" },
      { icon: History, label: "Historique", path: "/history" },
      { icon: FileText, label: "Documentation", path: "/documentation" },
      { icon: Settings, label: "Administration", path: "/admin" },
    ]
  }
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        setIsAdmin(true);
      }
    };

    checkAdminStatus();
  }, []);

  // Ferme le menu mobile quand on change de page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const renderNavSection = (section: NavSection) => (
    <div key={section.title} className="space-y-2">
      {section.title && (
        <>
          <h2 className={cn(
            "text-sm uppercase text-muted-foreground font-semibold px-2",
            isCollapsed && "sr-only"
          )}>
            {section.title}
          </h2>
          <Separator className="mb-2" />
        </>
      )}
      <nav className="space-y-1">
        {section.items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              "hover:bg-accent",
              location.pathname === item.path
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className={cn(
              "transition-opacity duration-200",
              isCollapsed ? "opacity-0 hidden" : "opacity-100"
            )}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </Header>

      <div className="flex">
        {/* Sidebar pour desktop */}
        <aside
          className={cn(
            "fixed left-0 z-30 hidden h-[calc(100vh-4rem)] border bg-card/50 transition-all duration-300 md:block",
            isCollapsed ? "w-16" : "w-64"
          )}
        >
          <div className="flex h-16 items-center justify-between px-4">
            <h2
              className={cn(
                "text-lg font-semibold transition-opacity duration-200",
                isCollapsed ? "opacity-0 hidden" : "opacity-100"
              )}
            >
              Menu
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="space-y-6 px-2">
            {mainNavItems.map((section, index) => {
              if (section.title === "Administration" && !isAdmin) return null;
              return renderNavSection(section);
            })}
          </div>
        </aside>

        {/* Menu mobile */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 border bg-background transition-transform duration-300 md:hidden",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-16 items-center justify-between px-4">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6 px-2">
            {mainNavItems.map((section, index) => {
              if (section.title === "Administration" && !isAdmin) return null;
              return renderNavSection(section);
            })}
          </div>
        </aside>

        {/* Overlay pour le menu mobile */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <main
          className={cn(
            "flex-1 p-4 md:p-8 transition-all duration-300",
            isCollapsed ? "md:ml-16" : "md:ml-64"
          )}
        >
          <div className="mx-auto max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

