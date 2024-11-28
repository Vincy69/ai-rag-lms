import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {children}
        <Link to="/" className="ml-4 flex items-center space-x-2">
          <span className="text-xl font-bold">AI RAG Learning Assistant</span>
        </Link>
      </div>
    </header>
  );
}