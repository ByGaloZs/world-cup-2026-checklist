import type { StickerFilter } from "../../types/sticker";
import { Button } from "../ui/Button";

const filters: StickerFilter[] = ["all", "missing", "owned", "repeated"];

type StickerFiltersProps = {
  value: StickerFilter;
  onChange: (filter: StickerFilter) => void;
};

export function StickerFilters({ value, onChange }: StickerFiltersProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
      {filters.map((filter) => (
        <Button
          key={filter}
          type="button"
          variant={value === filter ? "primary" : "secondary"}
          onClick={() => onChange(filter)}
          className="h-11 justify-center capitalize"
        >
          {filter}
        </Button>
      ))}
    </div>
  );
}
