import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import Chat from "@/pages/Chat";
import Documents from "@/pages/Documents";
import Upload from "@/pages/Upload";
import History from "@/pages/History";
import Formations from "@/pages/Formations";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: 'test1@example.com',
          password: 'password123',
        });
        
        if (error) {
          console.error('Auto-login error:', error);
          
          if (error.message.includes("Database error") && retryCount < MAX_RETRIES) {
            // Wait for a few seconds before retrying
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              setIsInitializing(true);
            }, delay);
            return;
          }
          
          let errorMessage = "Une erreur est survenue lors de la connexion automatique.";
          if (error.message.includes("Database error")) {
            errorMessage = "Erreur de connexion à la base de données. Veuillez réessayer plus tard.";
          } else if (error.message.includes("Invalid login credentials")) {
            errorMessage = "Identifiants de connexion invalides.";
          }
          
          toast({
            title: "Erreur de connexion",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Auto-login error:', error);
        toast({
          title: "Erreur de connexion",
          description: "Une erreur inattendue est survenue. Veuillez réessayer plus tard.",
          variant: "destructive",
        });
      } finally {
        setIsInitializing(false);
      }
    };

    if (isInitializing) {
      autoLogin();
    }
  }, [isInitializing, retryCount]);

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {retryCount > 0 ? `Tentative de reconnexion (${retryCount}/${MAX_RETRIES})...` : 'Chargement...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/history" element={<History />} />
          <Route path="/formations" element={<Formations />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;