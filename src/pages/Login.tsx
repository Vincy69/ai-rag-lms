import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AuthError } from "@supabase/supabase-js";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/chat");
      } else if (event === "user_deleted") {
        toast({
          title: "Erreur d'authentification",
          description: "Votre compte a été supprimé.",
          variant: "destructive",
        });
      } else if (event === "signed_out") {
        // Optionally handle sign out
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
            localization={{
              variables: {
                sign_in: {
                  email_label: "Email",
                  password_label: "Mot de passe",
                }
              }
            }}
            showLinks={false}
            view="sign_in"
            onError={(error: AuthError) => {
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
            }}
          />
        </div>
      </div>
    </div>
  );
}