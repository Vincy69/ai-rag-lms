import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { MessageSquare, Upload, History } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Upload de Documents",
    description: "Importez vos documents pour entraîner votre assistant"
  },
  {
    icon: MessageSquare,
    title: "Chat Intelligent",
    description: "Interagissez avec votre assistant et testez ses capacités"
  },
  {
    icon: History,
    title: "Historique & Amélioration",
    description: "Suivez et améliorez les performances de votre assistant"
  }
];

const Index = () => {
  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Bienvenue sur votre Assistant IA</h1>
          <p className="text-muted-foreground">
            Gérez, testez et améliorez votre chatbot en toute simplicité
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, i) => (
            <Card key={i} className="glass p-6 space-y-4">
              <feature.icon className="h-12 w-12 text-primary" />
              <h2 className="text-xl font-semibold">{feature.title}</h2>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Index;