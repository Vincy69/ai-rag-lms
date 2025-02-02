import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import Account from "@/pages/Account";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
import ELearning from "@/pages/ELearning";
import Documentation from "@/pages/Documentation";
import CourseManagement from "@/pages/CourseManagement";
import CourseEditor from "@/pages/CourseEditor";
import "./App.css";

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error checking session:', error);
        toast({
          title: "Session Error",
          description: "Please try logging in again",
          variant: "destructive",
        });
      }
      setSession(!!session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setSession(!!session);
      
      if (event === 'SIGNED_OUT') {
        // Clear any stored session data
        await supabase.auth.signOut();
        setSession(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  if (session === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return session ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <PrivateRoute>
                <Documents />
              </PrivateRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <PrivateRoute>
                <Upload />
              </PrivateRoute>
            }
          />
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <History />
              </PrivateRoute>
            }
          />
          <Route
            path="/formations"
            element={
              <PrivateRoute>
                <Formations />
              </PrivateRoute>
            }
          />
          <Route
            path="/elearning"
            element={
              <PrivateRoute>
                <ELearning />
              </PrivateRoute>
            }
          />
          <Route
            path="/documentation"
            element={
              <PrivateRoute>
                <Documentation />
              </PrivateRoute>
            }
          />
          <Route
            path="/account"
            element={
              <PrivateRoute>
                <Account />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <PrivateRoute>
                <CourseManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/courses/:formationId"
            element={
              <PrivateRoute>
                <CourseEditor />
              </PrivateRoute>
            }
          />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;