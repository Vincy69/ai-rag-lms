import Layout from "@/components/Layout";
import { HistoryList } from "@/components/history/HistoryList";
import { HistoryFilters } from "@/components/history/HistoryFilters";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ChatHistory } from "@/types/chat";
import { DateRange } from "react-day-picker";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay } from "date-fns";

export default function History() {
  const [dateRange, setDateRange] = useState<DateRange>();
  const [scoreFilter, setScoreFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch chat history
  const { data: historyItems = [], isLoading } = useQuery({
    queryKey: ["chat-history", dateRange, scoreFilter],
    queryFn: async () => {
      let query = supabase
        .from("chat_history")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply date filter if set
      if (dateRange?.from) {
        query = query.gte("created_at", startOfDay(dateRange.from).toISOString());
      }
      if (dateRange?.to) {
        query = query.lte("created_at", endOfDay(dateRange.to).toISOString());
      }

      // Apply score filter if set
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
      })) as ChatHistory[];
    },
  });

  // Update feedback mutation
  const updateFeedback = useMutation({
    mutationFn: async ({ id, feedback }: { id: string; feedback: string }) => {
      const { error } = await supabase
        .from("chat_history")
        .update({ feedback })
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

        <HistoryFilters
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          scoreFilter={scoreFilter}
          onScoreFilterChange={setScoreFilter}
        />

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