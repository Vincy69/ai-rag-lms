import { ArrowRight, Key } from "lucide-react";

interface Column {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
}

interface TableDescriptionProps {
  name: string;
  description: string;
  columns: Column[];
}

export function TableDescription({ name, description, columns }: TableDescriptionProps) {
  return (
    <li className="doc-list-item">
      <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
      <div>
        <span className="doc-link">{name}</span>
        <span className="ml-2">{description}</span>
        <ul className="mt-2 space-y-1.5 text-sm">
          <li className="flex items-start gap-2">
            <Key className="h-4 w-4 text-primary mt-0.5" />
            <span className="font-medium">id</span>
            <span className="text-muted-foreground">(uuid, PK, auto-généré)</span>
          </li>
          {columns.map((column) => (
            <li key={column.name}>
              • {column.name}{" "}
              <span className="text-muted-foreground">
                ({column.type}
                {column.required ? ", obligatoire" : ", optionnel"})
                {column.description && ` - ${column.description}`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}