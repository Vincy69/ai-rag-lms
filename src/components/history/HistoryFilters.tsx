import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HistoryFiltersProps {
  dateRange: [Date | undefined, Date | undefined];
  onDateRangeChange: (range: [Date | undefined, Date | undefined]) => void;
  scoreFilter: number | null;
  onScoreFilterChange: (score: number | null) => void;
}

export function HistoryFilters({
  dateRange,
  onDateRangeChange,
  scoreFilter,
  onScoreFilterChange,
}: HistoryFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <DateRangePicker
        value={dateRange}
        onChange={onDateRangeChange}
        placeholder="Sélectionner une période"
      />
      <Select
        value={scoreFilter?.toString() || ""}
        onValueChange={(value) => onScoreFilterChange(value ? Number(value) : null)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Score minimum" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tous les scores</SelectItem>
          <SelectItem value="0.7">70% et plus</SelectItem>
          <SelectItem value="0.8">80% et plus</SelectItem>
          <SelectItem value="0.9">90% et plus</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}