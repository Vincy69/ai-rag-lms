import { useState } from "react";
import Layout from "@/components/Layout";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { DocumentFilters } from "@/components/documents/DocumentFilters";
import { useToast } from "@/components/ui/use-toast";
import { Document } from "@/types/document";

export default function Documents() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const { toast } = useToast();

  // Mock data - à remplacer par les vraies données de l'API
  const documents: Document[] = [
    {
      id: "1",
      name: "Documentation API",
      category: "documentation",
      uploadDate: "2024-02-20",
      type: "pdf",
      size: 1024576,
    },
    {
      id: "2",
      name: "Procédure de déploiement",
      category: "procedures",
      uploadDate: "2024-02-19",
      type: "docx",
      size: 512000,
    },
  ];

  const handleView = (id: string) => {
    toast({
      title: "Visualisation",
      description: "Fonctionnalité de visualisation à implémenter",
    });
  };

  const handleEdit = (id: string) => {
    toast({
      title: "Modification",
      description: "Fonctionnalité de modification à implémenter",
    });
  };

  const handleDelete = (id: string) => {
    toast({
      title: "Suppression",
      description: "Fonctionnalité de suppression à implémenter",
    });
  };

  const filteredDocuments = documents
    .filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || doc.category === category;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case "date-asc":
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
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

        <DocumentFilters
          search={search}
          category={category}
          sortBy={sortBy}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onSortChange={setSortBy}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucun document ne correspond à vos critères de recherche
          </div>
        )}
      </div>
    </Layout>
  );
}