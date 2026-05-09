export type UserStickerProgress = {
  id?: string;
  user_id: string;
  sticker_number: string;
  owned: boolean;
  repeated: boolean;
  updated_at?: string;
};
