export interface EffectBlock {
  id: string;
  clipId: number;
  effectType: string;
  prompt: string;
  order: number;
}

export const EFFECT_TYPES = [
  "Color Grade",
  "Speed Ramp",
  "Blur",
  "Transition",
  "Crop & Zoom",
  "Stabilize",
] as const;

export type EffectType = (typeof EFFECT_TYPES)[number];

export const EFFECT_FILTERS: Record<string, string> = {
  "Color Grade": "saturate(1.4) contrast(1.1) sepia(0.15)",
  "Speed Ramp": "brightness(1.1) blur(1px)",
  "Blur": "blur(4px)",
  "Transition": "opacity(0.7) brightness(1.3)",
  "Crop & Zoom": "none",
  "Stabilize": "contrast(1.05)",
};

export const EFFECT_ICONS: Record<string, string> = {
  "Color Grade": "Palette",
  "Speed Ramp": "Gauge",
  "Blur": "Droplets",
  "Transition": "ArrowRightLeft",
  "Crop & Zoom": "Maximize2",
  "Stabilize": "Anchor",
};

export const CLIP_COLORS: Record<string, { accent: string; border: string }> = {
  blue: { accent: "#1c77e9", border: "#6298ec" },
  purple: { accent: "#564aac", border: "#9287e2" },
  green: { accent: "#2d8659", border: "#5fb885" },
  orange: { accent: "#d97706", border: "#fbbf24" },
};
