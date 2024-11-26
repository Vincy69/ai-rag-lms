import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/types/document";
import { useToast } from "@/hooks/use-toast";

export function useDocuments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      // Get the document to get its file_path
      const { data: document, error: fetchError } = await supabase
        .from("documents")
        .select("file_path, embedding")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete the document record (this will also delete the associated embedding due to CASCADE)
      const { error: deleteError } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document-stats"] });
      toast({
        title: "Document supprimé",
        description: "Le document et ses vecteurs associés ont été supprimés avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du document",
        variant: "destructive",
      });
      console.error("Delete error:", error);
    },
  });

  const updateDocument = useMutation({
    mutationFn: async ({ id, name, category }: Partial<Document> & { id: string }) => {
      const { error } = await supabase
        .from("documents")
        .update({ 
          name, 
          category,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({
        title: "Document mis à jour",
        description: "Le document a été mis à jour avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du document",
        variant: "destructive",
      });
      console.error("Update error:", error);
    },
  });

  return {
    documents,
    isLoading,
    deleteDocument,
    updateDocument,
  };
}