import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { ChatHistory } from "@/types/chat";

interface UserHistoryProps {
  user: {
    id: string;
    email: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserHistory({ user, open, onOpenChange }: UserHistoryProps) {
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadHistory = async () => {
      if (!user || !open) return;

      try {
        const { data, error } = await supabase
          .from("chat_history")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const formattedHistory = data.map((item) => ({
          id: item.id,
          session_id: item.session_id,
          message: {
            input: (item.message as any).input || "",
            output: (item.message as any).output || "",
            score: (item.message as any).score || 0,
            feedback: (item.message as any).feedback,
          },
          timestamp: new Date(item.created_at),
          user_id: item.user_id,
        }));

        setHistory(formattedHistory);
      } catch (error) {
        console.error("Error loading chat history:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger l'historique",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [user, open, toast]);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historique des conversations de {user.email}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{item.message.input}</p>
                    <p className="text-muted-foreground">{item.message.output}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.message.score >= 0.8 ? (
                      <ThumbsUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <ThumbsDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {Math.round(item.message.score * 100)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {item.timestamp.toLocaleString()}
                  </p>
                  {item.message.feedback && (
                    <p className="text-sm bg-muted p-2 rounded">
                      Feedback: {item.message.feedback}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {history.length === 0 && (
              <p className="text-center text-muted-foreground">
                Aucun historique de conversation
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}