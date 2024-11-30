import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Search } from "lucide-react";

interface Formation {
  id: string;
  name: string;
  description: string | null;
  category: string;
  created_at: string;
}

interface FormationsListProps {
  onFormationSelect: (formationId: string) => void;
}

export function FormationsList({ onFormationSelect }: FormationsListProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<{
    column: keyof Formation;
    direction: "asc" | "desc";
  }>({ column: "name", direction: "asc" });

  const { data: formations, isLoading } = useQuery({
    queryKey: ["formations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formations")
        .select("*")
        .order(sortBy.column, { ascending: sortBy.direction === "asc" });
      
      if (error) throw error;
      return data;
    },
  });

  const handleSort = (column: keyof Formation) => {
    setSortBy(prev => ({
      column,
      direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const filteredFormations = formations?.filter(formation =>
    formation.name.toLowerCase().includes(search.toLowerCase()) ||
    formation.description?.toLowerCase().includes(search.toLowerCase()) ||
    formation.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une formation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Nom
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSort("name")}>
                      Trier par nom
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Catégorie
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSort("category")}>
                      Trier par catégorie
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Date de création
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSort("created_at")}>
                      Trier par date
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFormations?.map((formation) => (
              <TableRow
                key={formation.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onFormationSelect(formation.id)}
              >
                <TableCell className="font-medium">{formation.name}</TableCell>
                <TableCell>{formation.category}</TableCell>
                <TableCell>{formation.description}</TableCell>
                <TableCell>
                  {new Date(formation.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}