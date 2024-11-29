import { cn } from "@/lib/utils";
import { Link } from "react-scroll";

export function NavigationMenu() {
  const sections = [
    { id: "description", label: "Description" },
    { id: "quiz-progression", label: "Quiz & Progression" },
    { id: "database", label: "Base de données" },
  ];

  return (
    <div className="space-y-4 sticky top-8">
      <h2 className="text-lg font-semibold">Sections</h2>
      <nav className="space-y-2">
        {sections.map((section) => (
          <Link
            key={section.id}
            to={section.id}
            spy={true}
            smooth={true}
            offset={-100}
            duration={500}
            className={cn(
              "block p-2 rounded-lg hover:bg-accent cursor-pointer",
              "transition-colors duration-200"
            )}
            activeClass="bg-accent"
          >
            {section.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}