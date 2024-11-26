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
      return <FileText className="h-5 w-5 text-primary" />;
    case "text/plain":
      return <File className="h-5 w-5 text-primary" />;
    case "application/json":
      return <FileJson className="h-5 w-5 text-primary" />;
    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return <Book className="h-5 w-5 text-primary" />;
    default:
      return <FileCode className="h-5 w-5 text-primary" />;
  }
};

export function DocumentCard({ document, onView, onEdit, onDelete }: DocumentCardProps) {
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
    <Card className="glass hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-4 p-4">
        <div className="p-2 bg-white/5 rounded-lg">
          {getDocumentIcon(document.content_type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold truncate">{document.name}</h3>
            <span 
              className="px-2 py-0.5 rounded-full text-xs whitespace-nowrap"
              style={{ 
                backgroundColor: categoryData?.color ? `${categoryData.color}20` : 'transparent',
                color: categoryData?.color
              }}
            >
              {document.category}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatBytes(document.size)}
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground mt-1">
            Modifié le {format(new Date(document.updated_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
          </div>
        </div>

        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onView(document.id)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(document.id)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(document.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}