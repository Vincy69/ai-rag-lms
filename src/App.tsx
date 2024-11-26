import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Chat from "@/pages/Chat";
import Documents from "@/pages/Documents";
import Upload from "@/pages/Upload";
import History from "@/pages/History";
import Formations from "@/pages/Formations";
import "./App.css";

const queryClient = new QueryClient();

// Auto-login avec un utilisateur de test
const autoLogin = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: 'test1@example.com',
    password: 'password123',
  });
  
  if (error) {
    console.error('Erreur de connexion automatique:', error);
  }
};

function App() {
  useEffect(() => {
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