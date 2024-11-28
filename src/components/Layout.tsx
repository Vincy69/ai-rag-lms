import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MessageSquare, Upload, Files, History, GraduationCap, User, Settings, BookOpen } from "lucide-react";
import { Header } from "./Header";
import { supabase } from "@/integrations/supabase/client";

const baseNavItems = [
  { icon: MessageSquare, label: "Chat", path: "/chat" },
  { icon: Upload, label: "Upload", path: "/upload" },
  { icon: Files, label: "Documents", path: "/documents" },
  { icon: History, label: "Historique", path: "/history" },
  { icon: BookOpen, label: "E-Learning", path: "/elearning" },
  { icon: GraduationCap, label: "Formations", path: "/formations" },
  { icon: User, label: "Mon compte", path: "/account" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [navItems, setNavItems] = useState(baseNavItems);

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
        setNavItems([
          ...baseNavItems,
          { icon: Settings, label: "Administration", path: "/admin" },
        ]);
      }
    };

    checkAdminStatus();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <aside
          className={cn(
            "glass fixed left-0 z-30 hidden h-[calc(100vh-4rem)] transition-all duration-300 lg:block",
            isCollapsed ? "w-16" : "w-64"
          )}
        >
          <div className="flex h-16 items-center justify-between px-4">
            <h1
              className={cn(
                "font-bold text-primary transition-all duration-300",
                isCollapsed ? "scale-0" : "scale-100"
              )}
            >
              Menu
            </h1>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="rounded-lg p-2 hover:bg-white/10"
            >
              {isCollapsed ? "→" : "←"}
            </button>
          </div>
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                  "hover:bg-white/10",
                  location.pathname === item.path
                    ? "bg-primary/20 text-primary"
                    : "text-white/90"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span
                  className={cn(
                    "transition-all duration-300",
                    isCollapsed ? "scale-0" : "scale-100"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </aside>
        <main
          className={cn(
            "flex-1 p-8 transition-all duration-300",
            isCollapsed ? "lg:ml-16" : "lg:ml-64"
          )}
        >
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}