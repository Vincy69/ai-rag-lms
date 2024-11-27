import Layout from "@/components/Layout";
import { HistoryList } from "@/components/history/HistoryList";
import { HistoryFilters } from "@/components/history/HistoryFilters";
import { UserSelector } from "@/components/history/UserSelector";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { DateRange } from "react-day-picker";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function History() {
  const [dateRange, setDateRange] = useState<DateRange>();
  const [scoreFilter, setScoreFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current user's role
  const { data: currentUserRole } = useQuery({
    queryKey: ["currentUserRole"],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user?.id)
        .single();

      if (profileError) throw profileError;
      return profile.role;
    },
  });

  // Fetch chat history
  const { data: historyItems = [], isLoading } = useQuery({
    queryKey: ["chat-history", dateRange, scoreFilter, selectedUserId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from("chat_history")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply user filtering based on role and selection
      if (currentUserRole !== "admin" || (currentUserRole === "admin" && selectedUserId)) {
        query = query.eq("user_id", selectedUserId || user?.id);
      }

      if (dateRange?.from) {
        query = query.gte("created_at", dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte("created_at", dateRange.to.toISOString());
      }

      if (scoreFilter !== "all") {
        query = query.gte("score", parseFloat(scoreFilter));
      }

      const { data, error } = await query;
      
      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger l'historique",
          variant: "destructive",
        });
        throw error;
      }

      return data.map(item => ({
        ...item,
        timestamp: new Date(item.created_at),
      }));
    },
  });

  // Update feedback mutation
  const updateFeedback = useMutation({
    mutationFn: async ({ id, feedback }: { id: string; feedback: string }) => {
      const response = await fetch('/functions/v1/generate-embedding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ text: feedback }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate embedding');
      }

      const { embedding } = await response.json();

      const { error } = await supabase
        .from("chat_history")
        .update({ 
          feedback,
          feedback_embedding: embedding
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-history"] });
      toast({
        title: "Feedback enregistré",
        description: "Merci pour votre contribution à l'amélioration du chatbot.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le feedback",
        variant: "destructive",
      });
    },
  });

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Historique des Conversations</h1>
          <p className="text-muted-foreground">
            Consultez et analysez l'historique des interactions avec le chatbot
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {currentUserRole === "admin" && (
            <UserSelector
              selectedUserId={selectedUserId}
              onUserChange={setSelectedUserId}
            />
          )}
          
          <HistoryFilters
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            scoreFilter={scoreFilter}
            onScoreFilterChange={setScoreFilter}
          />
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground">
            Chargement de l'historique...
          </div>
        ) : historyItems.length === 0 ? (
          <div className="text-center text-muted-foreground">
            Aucun historique trouvé pour les filtres sélectionnés
          </div>
        ) : (
          <HistoryList 
            items={historyItems} 
            onFeedbackSubmit={(id, feedback) => updateFeedback.mutate({ id, feedback })} 
          />
        )}
      </div>
    </Layout>
  );
}