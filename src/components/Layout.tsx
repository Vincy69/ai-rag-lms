import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Upload, MessageSquare, Files, History, Settings } from "lucide-react";

const navItems = [
  { icon: Upload, label: "Upload", path: "/upload" },
  { icon: Files, label: "Documents", path: "/documents" },
  { icon: MessageSquare, label: "Chat", path: "/chat" },
  { icon: History, label: "Historique", path: "/history" },
  { icon: Settings, label: "Paramètres", path: "/settings" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <aside className={cn(
        "glass fixed left-0 top-0 z-40 h-screen transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex h-16 items-center justify-between px-4">
          <h1 className={cn(
            "font-bold text-primary transition-all duration-300",
            isCollapsed ? "scale-0" : "scale-100"
          )}>
            AI Assistant
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
                location.pathname === item.path ? "bg-primary/20 text-primary" : "text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className={cn(
                "transition-all duration-300",
                isCollapsed ? "scale-0" : "scale-100"
              )}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300 p-8",
        isCollapsed ? "ml-16" : "ml-64"
      )}>
        {children}
      </main>
    </div>
  );
}