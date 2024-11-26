import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Chat from "@/pages/Chat";
import Documents from "@/pages/Documents";
import Upload from "@/pages/Upload";
import History from "@/pages/History";
import Login from "@/pages/Login";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  if (isAuthenticated === null) {
    return null; // Loading state
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/chat" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/chat" replace /> : <Login />
            }
          />
          <Route
            path="/chat"
            element={isAuthenticated ? <Chat /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/documents"
            element={
              isAuthenticated ? <Documents /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/upload"
            element={
              isAuthenticated ? <Upload /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/history"
            element={
              isAuthenticated ? <History /> : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;