import { useState } from "react";
import Layout from "@/components/Layout";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call the Edge Function that communicates with n8n
      const { data, error } = await supabase.functions.invoke('chat-with-docs', {
        body: { message: content }
      });

      if (error) throw error;

      // Add AI response
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex h-full flex-col gap-4 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Chat avec l'Assistant IA</h1>
          <p className="text-muted-foreground">
            Posez vos questions à l'assistant IA qui utilise vos documents comme source de connaissances
          </p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border bg-background p-4">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Aucun message. Commencez la conversation !
            </p>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} {...message} />
            ))
          )}
        </div>

        <div className="sticky bottom-0 bg-background p-4">
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </Layout>
  );
}