import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatHistory } from "@/types/chat";
import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, Gauge } from "lucide-react";

interface HistoryListProps {
  items: ChatHistory[];
  onFeedbackSubmit: (id: string, feedback: string) => void;
}

export function HistoryList({ items, onFeedbackSubmit }: HistoryListProps) {
  const [feedbackText, setFeedbackText] = useState<{ [key: string]: string }>({});

  const handleFeedbackSubmit = (id: string) => {
    if (feedbackText[id]) {
      onFeedbackSubmit(id, feedbackText[id]);
      setFeedbackText((prev) => ({ ...prev, [id]: "" }));
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">{item.message}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{item.response}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-full">
                <Gauge className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Score: {Math.round(item.score * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                {item.score >= 0.8 ? (
                  <ThumbsUp className="h-5 w-5 text-green-500" />
                ) : (
                  <ThumbsDown className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {new Date(item.timestamp).toLocaleString()}
            </p>
            {item.feedback && (
              <p className="text-sm bg-muted p-2 rounded">
                Feedback: {item.feedback}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Ajouter un feedback pour améliorer les réponses..."
              value={feedbackText[item.id] || ""}
              onChange={(e) =>
                setFeedbackText((prev) => ({
                  ...prev,
                  [item.id]: e.target.value,
                }))
              }
            />
            <Button
              onClick={() => handleFeedbackSubmit(item.id)}
              disabled={!feedbackText[item.id]}
            >
              Soumettre le feedback
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}