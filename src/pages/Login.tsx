import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Connexion</h2>
          <p className="mt-2 text-gray-600">
            Connectez-vous pour accéder à votre espace
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Mot de passe',
                button_label: 'Se connecter',
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Mot de passe',
                button_label: "S'inscrire",
              },
            },
          }}
        />
      </div>
    </div>
  );
}