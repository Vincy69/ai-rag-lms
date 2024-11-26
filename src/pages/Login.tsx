import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/chat");
      }
    });

    // Handle auth errors
    const {
      data: { subscription },
    } = supabase.auth.onError((error) => {
      if (error.message.includes("email_provider_disabled")) {
        toast({
          title: "Erreur d'authentification",
          description: "Les inscriptions par email sont actuellement désactivées. Veuillez contacter l'administrateur.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur d'authentification",
          description: error.message,
          variant: "destructive",
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Bienvenue</h1>
          <p className="text-muted-foreground">
            Connectez-vous pour accéder à votre historique de chat
          </p>
        </div>
        <div className="glass border border-white/20 p-6 rounded-lg">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="dark"
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
}