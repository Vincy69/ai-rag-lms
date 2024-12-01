import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
        
        if (profile?.first_name || profile?.last_name) {
          setUserName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim());
        }
      }
    };

    getUserProfile();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          {children}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              AI RAG Learning Assistant
            </span>
          </Link>
        </div>

        <Link 
          to="/account" 
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
        >
          <User className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {userName || "Mon compte"}
          </span>
        </Link>
      </div>
    </header>
  );
}