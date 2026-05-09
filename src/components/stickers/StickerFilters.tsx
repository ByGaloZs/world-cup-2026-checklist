import type { StickerFilter } from "../../types/sticker";
import { Button } from "../ui/Button";

const filters: StickerFilter[] = ["all", "missing", "owned", "repeated"];

type StickerFiltersProps = {
  value: StickerFilter;
  onChange: (filter: StickerFilter) => void;
};

export function StickerFilters({ value, onChange }: StickerFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Button
          key={filter}
          type="button"
          variant={value === filter ? "primary" : "secondary"}
          onClick={() => onChange(filter)}
          className="capitalize"
        >
          {filter}
        </Button>
      ))}
    </div>
  );
}
