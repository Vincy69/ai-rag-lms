import Layout from "@/components/Layout";
import { HistoryList } from "@/components/history/HistoryList";
import { HistoryFilters } from "@/components/history/HistoryFilters";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ChatHistory } from "@/types/chat";

export default function History() {
  const [dateRange, setDateRange] = useState<[Date | undefined, Date | undefined]>([undefined, undefined]);
  const [scoreFilter, setScoreFilter] = useState<number | null>(null);
  const { toast } = useToast();

  // Mock data - à remplacer par les vraies données de l'API
  const historyItems: ChatHistory[] = [
    {
      id: "1",
      question: "Comment puis-je configurer mon environnement de développement ?",
      answer: "Pour configurer votre environnement, suivez ces étapes...",
      timestamp: new Date("2024-02-20T10:30:00"),
      score: 0.85,
      feedback: "Réponse claire et précise",
    },
    {
      id: "2",
      question: "Quelle est la différence entre let et const ?",
      answer: "Let permet de réassigner une variable tandis que const...",
      timestamp: new Date("2024-02-19T15:45:00"),
      score: 0.92,
      feedback: null,
    },
  ];

  const handleFeedbackSubmit = (id: string, feedback: string) => {
    toast({
      title: "Feedback enregistré",
      description: "Merci pour votre contribution à l'amélioration du chatbot.",
    });
  };

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

        <HistoryList items={historyItems} onFeedbackSubmit={handleFeedbackSubmit} />
      </div>
    </Layout>
  );
}