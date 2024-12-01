import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [isWelcomeLoading, setIsWelcomeLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const getWelcomeMessage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsWelcomeLoading(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke('chat-with-docs', {
          body: { 
            sessionId: crypto.randomUUID(),
            action: "getWelcomeMessage",
            userId: user.id
          }
        });

        if (error) throw error;
        
        if (data?.response) {
          setWelcomeMessage(data.response);
        }
      } catch (error) {
        console.error('Error getting welcome message:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le message de bienvenue",
          variant: "destructive",
        });
      } finally {
        setIsWelcomeLoading(false);
      }
    };

    getWelcomeMessage();
  }, [toast]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour utiliser le chat.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('chat-with-docs', {
        body: { 
          sessionId: crypto.randomUUID(),
          action: "sendMessage",
          chatInput: content,
          userId: user.id
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('503') || error.message?.toLowerCase().includes('workflow is not active')) {
          toast({
            title: "Service indisponible",
            description: "Le service de chat est temporairement indisponible. Veuillez réessayer dans quelques instants.",
            variant: "destructive",
          });
          return;
        }
        
        if (error.message?.includes('500')) {
          toast({
            title: "Erreur du service",
            description: "Une erreur est survenue lors du traitement de votre message. Notre équipe a été notifiée.",
            variant: "destructive",
          });
          return;
        }
        
        throw error;
      }

      if (!data || !data.response) {
        throw new Error('Invalid response format from chat service');
      }

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Chat avec l'Assistant IA</h1>
          <p className="text-white/80">
            Posez vos questions à l'assistant IA qui utilise vos documents comme source de connaissances
          </p>
        </div>

        {isWelcomeLoading ? (
          <Card className="p-4 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </Card>
        ) : welcomeMessage && (
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="prose prose-invert max-w-none">
              {welcomeMessage}
            </div>
          </Card>
        )}

        <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border border-white/20 bg-black/40 backdrop-blur-sm">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-white/80">
                Aucun message. Commencez la conversation !
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} {...message} />
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 glass border border-white/20 p-4 rounded-lg">
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </Layout>
  );
}