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
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase.functions.invoke('chat-with-docs', {
        body: { message: content }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Save chat history with new structure
      await supabase.from('chat_history').insert({
        session_id: crypto.randomUUID(),
        message: {
          input: content,
          output: data.response,
          score: data.confidence || 0.8,
          feedback: null
        },
        user_id: user.id
      });
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
      <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Chat avec l'Assistant IA</h1>
          <p className="text-white/80">
            Posez vos questions à l'assistant IA qui utilise vos documents comme source de connaissances
          </p>
        </div>

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