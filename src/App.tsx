import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
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

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: 'test1@example.com',
          password: 'password123',
        });
        
        if (error) {
          console.error('Auto-login error:', error);
          toast({
            title: "Erreur de connexion",
            description: "Une erreur est survenue lors de la connexion automatique.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Auto-login error:', error);
        toast({
          title: "Erreur de connexion",
          description: "Une erreur est survenue lors de la connexion automatique.",
          variant: "destructive",
        });
      }
    };

    autoLogin();
  }, []);

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