import { Loader2 } from "lucide-react";
import { DocumentCard } from "./DocumentCard";
import { DocumentFilters } from "./DocumentFilters";
import { CategoryManager } from "./CategoryManager";
import { Document } from "@/types/document";

interface DocumentsContentProps {
  documents: Document[] | undefined;
  isLoading: boolean;
  search: string;
  category: string;
  sortBy: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DocumentsContent({
  documents,
  isLoading,
  search,
  category,
  sortBy,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onView,
  onEdit,
  onDelete,
}: DocumentsContentProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <DocumentFilters
          search={search}
          category={category}
          sortBy={sortBy}
          onSearchChange={onSearchChange}
          onCategoryChange={onCategoryChange}
          onSortChange={onSortChange}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            {documents?.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onView={() => onView(document.id)}
                onEdit={() => onEdit(document.id)}
                onDelete={() => onDelete(document.id)}
              />
            ))}
          </div>
        )}

        {documents?.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            Aucun document ne correspond à vos critères de recherche
          </div>
        )}
      </div>

      <div className="space-y-6">
        <CategoryManager />
      </div>
    </div>
  );
}