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
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/");
      }
      if (event === 'SIGNED_OUT') {
        navigate("/login");
        toast({
          title: "Session terminée",
          description: "Vous avez été déconnecté",
          variant: "destructive",
        });
      }
      if (event === 'USER_UPDATED') {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1F2C]">
      <div className="max-w-md w-full space-y-8 p-8 rounded-lg shadow-xl bg-black/40 backdrop-blur-sm border border-white/10">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Connexion</h2>
          <p className="text-white/60">
            Connectez-vous pour accéder à votre espace
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#9b87f5',
                  brandAccent: '#7E69AB',
                  brandButtonText: 'white',
                  defaultButtonBackground: '#1A1F2C',
                  defaultButtonBackgroundHover: '#2A2F3C',
                  inputBackground: '#1A1F2C',
                  inputBorder: '#2A2F3C',
                  inputBorderHover: '#9b87f5',
                  inputBorderFocus: '#9b87f5',
                  inputText: 'white',
                  inputLabelText: 'white',
                  inputPlaceholder: '#666',
                },
              },
            },
            className: {
              container: 'text-white',
              label: 'text-white',
              button: 'bg-primary hover:bg-primary/80 text-white',
              input: 'bg-black/40 border-white/10 text-white placeholder-white/40',
            },
          }}
          providers={[]}
          redirectTo={window.location.origin}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Mot de passe',
                button_label: 'Se connecter',
                loading_button_label: 'Connexion en cours...',
                email_input_placeholder: 'Votre email',
                password_input_placeholder: 'Votre mot de passe',
                link_text: 'Vous avez déjà un compte ? Connectez-vous',
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Mot de passe',
                button_label: "S'inscrire",
                loading_button_label: 'Inscription en cours...',
                email_input_placeholder: 'Votre email',
                password_input_placeholder: 'Votre mot de passe',
                link_text: "Vous n'avez pas de compte ? Inscrivez-vous",
              },
            },
          }}
        />
      </div>
    </div>
  );
}