import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/chat");
      } else if (event === "USER_DELETED") {
        toast({
          title: "Erreur d'authentification",
          description: "Votre compte a été supprimé.",
          variant: "destructive",
        });
      } else if (event === "SIGNED_OUT") {
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
                  button_label: "Se connecter",
                  loading_button_label: "Connexion en cours...",
                  email_input_placeholder: "Votre email",
                  password_input_placeholder: "Votre mot de passe",
                  link_text: "Vous avez déjà un compte ? Connectez-vous",
                },
                sign_up: {
                  email_label: "Email",
                  password_label: "Mot de passe",
                  button_label: "S'inscrire",
                  loading_button_label: "Inscription en cours...",
                  email_input_placeholder: "Votre email",
                  password_input_placeholder: "Votre mot de passe",
                  link_text: "Vous n'avez pas de compte ? Inscrivez-vous",
                },
              },
            }}
            showLinks={false}
            view="sign_in"
          />
        </div>
      </div>
    </div>
  );
}