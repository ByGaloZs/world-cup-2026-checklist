export type Sticker = {
  number: string;
  name: string;
  team: string;
  category?: string;
};

export type StickerFilter = "all" | "missing" | "owned" | "repeated";
