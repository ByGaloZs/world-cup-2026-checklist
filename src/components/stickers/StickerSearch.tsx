import { Input } from "../ui/Input";

type StickerSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function StickerSearch({ value, onChange }: StickerSearchProps) {
  return (
    <Input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search number, name, or team"
      aria-label="Search stickers"
    />
  );
}
