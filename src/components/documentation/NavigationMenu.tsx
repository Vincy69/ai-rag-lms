import { cn } from "@/lib/utils";
import { Link } from "react-scroll";

interface NavItem {
  id: string;
  label: string;
}

const navItems: NavItem[] = [
  { id: "description", label: "Description" },
  { id: "database", label: "Base de données" },
];

export function NavigationMenu() {
  return (
    <nav className="sticky top-4 space-y-1 mb-8">
      {navItems.map((item) => (
        <Link
          key={item.id}
          to={item.id}
          spy={true}
          smooth={true}
          offset={-100}
          duration={500}
          className={cn(
            "flex items-center px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "active:bg-accent/80"
          )}
          activeClass="bg-accent text-accent-foreground"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}