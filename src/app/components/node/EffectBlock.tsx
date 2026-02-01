import { useState } from "react";
import { motion } from "motion/react";
import {
  Type,
  ImageIcon,
  Film,
  Send,
  Trash2,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";

const ICON_MAP: Record<string, React.ReactNode> = {
  "Text": <Type className="size-4" />,
  "Image": <ImageIcon className="size-4" />,
  "Video": <Film className="size-4" />,
};

interface EffectBlockProps {
  id: string;
  effectType: string;
  prompt: string;
  onPromptChange: (id: string, prompt: string) => void;
  onRemove: (id: string) => void;
  onHover?: (hovered: boolean) => void;
  isHovered?: boolean;
  isGenerating?: boolean;
  /** URL of generated result image shown after generating finishes */
  generatedImageUrl?: string;
}

export function EffectBlock({
  id,
  effectType,
  prompt,
  onPromptChange,
  onRemove,
  onHover,
  isHovered = false,
  isGenerating = false,
  generatedImageUrl,
}: EffectBlockProps) {
  const [localHovered, setLocalHovered] = useState(false);
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const hovered = isHovered || localHovered;

  return (
    <motion.div
      className={cn(
        "w-[320px] rounded-xl overflow-hidden bg-[#1e1e1e] border transition-all duration-200",
        hovered ? "border-[#444] shadow-lg shadow-black/30" : "border-[#2a2a2a]"
      )}
      onMouseEnter={() => {
        setLocalHovered(true);
        onHover?.(true);
      }}
      onMouseLeave={() => {
        setLocalHovered(false);
        onHover?.(false);
      }}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header with effect type */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2 text-white/80">
          {ICON_MAP[effectType]}
          <span className="text-[13px] font-medium">{effectType}</span>
        </div>
        <button
          onClick={() => onRemove(id)}
          className="text-white/20 hover:text-red-400 transition-colors p-1 rounded cursor-pointer"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {/* Preview: pulsing (generating), then generated image, else empty */}
      <div className="mx-3 mb-2 rounded-lg overflow-hidden aspect-video bg-[#111]">
        {isGenerating ? (
          <div
            className="w-full h-full rounded-lg"
            style={{
              animation: "subtle-pulse 2s ease-in-out infinite",
              background: "#2a2a2a",
            }}
          />
        ) : generatedImageUrl ? (
          <img
            src={generatedImageUrl}
            alt="Generated"
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-[#2a2a2a] rounded-lg" />
        )}
      </div>

      {/* Prompt input */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 bg-[#141414] border border-[#2a2a2a] rounded-lg px-3 py-2">
          <input
            type="text"
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            placeholder={`Describe ${effectType.toLowerCase()} style...`}
            className="flex-1 bg-transparent text-[12px] text-white/70 placeholder:text-white/25 outline-none"
          />
          <button
            onClick={() => onPromptChange(id, localPrompt)}
            className="text-white/30 hover:text-[#6298ec] transition-colors shrink-0 cursor-pointer"
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
