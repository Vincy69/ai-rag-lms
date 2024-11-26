import { useState } from "react";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { useDocuments } from "@/hooks/useDocuments";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DocumentsHeader } from "@/components/documents/DocumentsHeader";
import { DocumentsContent } from "@/components/documents/DocumentsContent";
import { EditDocumentDialog } from "@/components/documents/EditDocumentDialog";
import { ViewDocumentDialog } from "@/components/documents/ViewDocumentDialog";
import { Document } from "@/types/document";

export default function Documents() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const { toast } = useToast();
  const { documents, isLoading, deleteDocument, updateDocument } = useDocuments();
  const [editingDocument, setEditingDocument] = useState<{ id: string; name: string; category: string } | null>(null);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument.mutateAsync(id);
      toast({
        title: "Document supprimé",
        description: "Le document a été supprimé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du document",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!editingDocument) return;

    try {
      await updateDocument.mutateAsync({
        id: editingDocument.id,
        name: editingDocument.name,
        category: editingDocument.category,
      });
      setEditingDocument(null);
      toast({
        title: "Document modifié",
        description: "Le document a été modifié avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification du document",
        variant: "destructive",
      });
    }
  };

  const filteredDocuments = documents
    ?.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || doc.category === category;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "date-asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <DocumentsHeader />
        
        <DocumentsContent
          documents={filteredDocuments}
          isLoading={isLoading}
          search={search}
          category={category}
          sortBy={sortBy}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onSortChange={setSortBy}
          onView={(id) => {
            const doc = documents?.find((d) => d.id === id);
            if (doc) {
              setViewingDocument(doc);
            }
          }}
          onEdit={(id) => {
            const doc = documents?.find((d) => d.id === id);
            if (doc) {
              setEditingDocument({
                id: doc.id,
                name: doc.name,
                category: doc.category,
              });
            }
          }}
          onDelete={handleDelete}
        />

        <EditDocumentDialog
          open={!!editingDocument}
          onOpenChange={(open) => !open && setEditingDocument(null)}
          document={editingDocument}
          onDocumentChange={(field, value) =>
            setEditingDocument((prev) => prev && { ...prev, [field]: value })
          }
          onSave={handleEdit}
          categories={categories}
        />

        <ViewDocumentDialog
          open={!!viewingDocument}
          onOpenChange={(open) => !open && setViewingDocument(null)}
          document={viewingDocument}
        />
      </div>
    </Layout>
  );
}