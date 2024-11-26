import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DocumentFiltersProps {
  search: string;
  category: string;
  sortBy: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export function DocumentFilters({
  search,
  category,
  sortBy,
  onSearchChange,
  onCategoryChange,
  onSortChange,
}: DocumentFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Input
        placeholder="Rechercher un document..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="md:w-64"
      />
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="md:w-48">
          <SelectValue placeholder="Catégorie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les catégories</SelectItem>
          <SelectItem value="documentation">Documentation technique</SelectItem>
          <SelectItem value="procedures">Procédures internes</SelectItem>
          <SelectItem value="reports">Rapports</SelectItem>
          <SelectItem value="other">Autres</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="md:w-48">
          <SelectValue placeholder="Trier par" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date-desc">Plus récents</SelectItem>
          <SelectItem value="date-asc">Plus anciens</SelectItem>
          <SelectItem value="name-asc">Nom (A-Z)</SelectItem>
          <SelectItem value="name-desc">Nom (Z-A)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}