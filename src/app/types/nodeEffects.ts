export interface EffectBlock {
  id: string;
  clipId: number;
  effectType: string;
  prompt: string;
  order: number;
}

export const EFFECT_TYPES = [
  "Text",
  "Image",
  "Video",
] as const;

export type EffectType = (typeof EFFECT_TYPES)[number];

export const EFFECT_FILTERS: Record<string, string> = {
  "Text": "none",
  "Image": "none",
  "Video": "none",
};

export const EFFECT_ICONS: Record<string, string> = {
  "Text": "Type",
  "Image": "ImageIcon",
  "Video": "Film",
};

export const CLIP_COLORS: Record<string, { accent: string; border: string }> = {
  blue: { accent: "#1c77e9", border: "#6298ec" },
  purple: { accent: "#564aac", border: "#9287e2" },
  green: { accent: "#2d8659", border: "#5fb885" },
  orange: { accent: "#d97706", border: "#fbbf24" },
};
