import { useState } from "react";
import Layout from "@/components/Layout";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { DocumentFilters } from "@/components/documents/DocumentFilters";
import { DocumentStats } from "@/components/documents/DocumentStats";
import { CategoryManager } from "@/components/documents/CategoryManager";
import { useToast } from "@/components/ui/use-toast";
import { useDocuments } from "@/hooks/useDocuments";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Documents() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const { toast } = useToast();
  const { documents, isLoading, deleteDocument, updateDocument } = useDocuments();
  const [editingDocument, setEditingDocument] = useState<{ id: string; name: string; category: string } | null>(null);

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
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Gestion des Documents</h1>
          <p className="text-muted-foreground">
            Visualisez, modifiez et organisez vos documents
          </p>
        </div>

        <DocumentStats />

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <DocumentFilters
              search={search}
              category={category}
              sortBy={sortBy}
              onSearchChange={setSearch}
              onCategoryChange={setCategory}
              onSortChange={setSortBy}
            />

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {filteredDocuments?.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    onView={() => {
                      toast({
                        title: "Visualisation",
                        description: "Fonctionnalité de visualisation à implémenter",
                      });
                    }}
                    onEdit={() => setEditingDocument(document)}
                    onDelete={() => handleDelete(document.id)}
                  />
                ))}
              </div>
            )}

            {filteredDocuments?.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                Aucun document ne correspond à vos critères de recherche
              </div>
            )}
          </div>

          <div className="space-y-6">
            <CategoryManager />
          </div>
        </div>

        <Dialog open={!!editingDocument} onOpenChange={() => setEditingDocument(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le document</DialogTitle>
              <DialogDescription>
                Modifiez les informations du document
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nom
                </label>
                <Input
                  id="name"
                  value={editingDocument?.name ?? ""}
                  onChange={(e) =>
                    setEditingDocument(
                      (prev) => prev && { ...prev, name: e.target.value }
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Catégorie
                </label>
                <Select
                  value={editingDocument?.category}
                  onValueChange={(value) =>
                    setEditingDocument(
                      (prev) => prev && { ...prev, category: value }
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingDocument(null)}>
                  Annuler
                </Button>
                <Button onClick={handleEdit}>Enregistrer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}