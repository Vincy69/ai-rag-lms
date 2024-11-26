import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Document } from "@/types/document";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ViewDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
}

export function ViewDocumentDialog({
  open,
  onOpenChange,
  document,
}: ViewDocumentDialogProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchDocument = async () => {
    if (!document) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from("documents")
        .download(document.file_path);

      if (error) throw error;

      if (document.content_type === "application/pdf") {
        const url = URL.createObjectURL(data);
        setContent(url);
      } else {
        const text = await data.text();
        setContent(text);
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch document content when dialog opens
  useEffect(() => {
    if (open && document) {
      fetchDocument();
    } else {
      setContent(null);
    }
  }, [open, document]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{document?.name}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : document?.content_type === "application/pdf" ? (
            <iframe
              src={content || ""}
              className="w-full h-full border-0"
              style={{ minHeight: "calc(80vh - 4rem)" }}
              title={document.name}
            />
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-sm p-4 h-full overflow-auto">
              {content}
            </pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}