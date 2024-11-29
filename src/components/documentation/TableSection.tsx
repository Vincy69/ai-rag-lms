import { TableDescription } from "./TableDescription";

interface TableSectionProps {
  title: string;
  tables: Array<{
    name: string;
    description: string;
    columns: Array<{
      name: string;
      type: string;
      required?: boolean;
      description?: string;
    }>;
  }>;
}

export function TableSection({ title, tables }: TableSectionProps) {
  return (
    <>
      <h4 className="text-foreground/90 font-medium mt-6 mb-3">{title}</h4>
      <ul className="doc-list">
        {tables.map((table) => (
          <TableDescription
            key={table.name}
            name={table.name}
            description={table.description}
            columns={table.columns}
          />
        ))}
      </ul>
    </>
  );
}