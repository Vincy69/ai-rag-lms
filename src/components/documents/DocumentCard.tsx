import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Edit2, Eye, FileCode, FileJson, Book, File } from "lucide-react";
import { Document } from "@/types/document";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatBytes } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DocumentCardProps {
  document: Document;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const getDocumentIcon = (contentType: string) => {
  switch (contentType) {
    case "application/pdf":
      return <FileText className="h-8 w-8 text-primary" />;
    case "text/plain":
      return <File className="h-8 w-8 text-primary" />;
    case "application/json":
      return <FileJson className="h-8 w-8 text-primary" />;
    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return <Book className="h-8 w-8 text-primary" />;
    default:
      return <FileCode className="h-8 w-8 text-primary" />;
  }
};

export function DocumentCard({ document, onView, onEdit, onDelete }: DocumentCardProps) {
  // Fetch category color
  const { data: categoryData } = useQuery({
    queryKey: ["category", document.category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("color")
        .eq("name", document.category)
        .single();
      if (error) throw error;
      return data;
    },
  });

  return (
    <Card className="glass p-6 space-y-6 hover:bg-white/5 transition-colors">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-white/5 rounded-lg">
          {getDocumentIcon(document.content_type)}
        </div>
        <div className="flex-1 space-y-4 text-left">
          <div>
            <h3 className="text-lg font-semibold mb-2">{document.name}</h3>
            <div className="flex items-center gap-4">
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: categoryData?.color ? `${categoryData.color}20` : 'transparent',
                  color: categoryData?.color
                }}
              >
                {document.category}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatBytes(document.size)}
              </span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Créé le {format(new Date(document.created_at), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
            <p>Dernière modification le {format(new Date(document.updated_at), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
        <Button variant="ghost" size="icon" onClick={() => onView(document.id)}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onEdit(document.id)}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(document.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}