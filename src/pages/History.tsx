import Layout from "@/components/Layout";
import { HistoryList } from "@/components/history/HistoryList";
import { HistoryFilters } from "@/components/history/HistoryFilters";
import { UserSelector } from "@/components/history/UserSelector";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { DateRange } from "react-day-picker";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatHistory, ChatMessage } from "@/types/chat";

export default function History() {
  const [dateRange, setDateRange] = useState<DateRange>();
  const [scoreFilter, setScoreFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current user's role
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch user profile",
          variant: "destructive",
        });
        throw error;
      }

      return { id: user.id, role: profile.role };
    },
  });

  // Fetch chat history
  const { data: historyItems = [], isLoading } = useQuery({
    queryKey: ["chat-history", dateRange, scoreFilter, selectedUserId],
    queryFn: async () => {
      let query = supabase
        .from("chat_history")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply user filtering based on role and selection
      if (userProfile?.role !== "admin" || (userProfile?.role === "admin" && selectedUserId)) {
        query = query.eq("user_id", selectedUserId || userProfile?.id);
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
          title: "Error",
          description: "Failed to load chat history",
          variant: "destructive",
        });
        throw error;
      }

      return data.map(item => ({
        id: item.id,
        session_id: item.session_id,
        message: item.message as ChatMessage,
        timestamp: new Date(item.created_at),
        user_id: item.user_id
      })) as ChatHistory[];
    },
    enabled: !!userProfile,
  });

  // Update feedback mutation
  const updateFeedback = useMutation({
    mutationFn: async ({ id, feedback }: { id: string; feedback: string }) => {
      const { data: chatItem } = await supabase
        .from("chat_history")
        .select("message")
        .eq("id", id)
        .single();

      if (!chatItem) throw new Error("Chat item not found");

      const message = chatItem.message as ChatMessage;
      const updatedMessage: ChatMessage = {
        ...message,
        feedback
      };

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
          message: updatedMessage,
          feedback_embedding: embedding
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-history"] });
      toast({
        title: "Success",
        description: "Feedback saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save feedback",
        variant: "destructive",
      });
    },
  });

  if (isLoadingProfile) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

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
          {userProfile?.role === "admin" && (
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