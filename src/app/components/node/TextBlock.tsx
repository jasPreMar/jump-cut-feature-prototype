import { useState } from "react";
import { motion } from "motion/react";
import { Type } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { CLIP_COLORS } from "@/app/types/nodeEffects";

interface TextBlockProps {
  title: string;
  color: "blue" | "purple" | "green" | "orange" | "teal";
  onHover?: (hovered: boolean) => void;
  isHovered?: boolean;
  onTitleChange?: (newTitle: string) => void;
}

export function TextBlock({
  title,
  color,
  onHover,
  isHovered = false,
  onTitleChange,
}: TextBlockProps) {
  const [localHovered, setLocalHovered] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);
  const hovered = isHovered || localHovered;
  const colors = CLIP_COLORS[color];

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
      {/* Color accent bar */}
      <div
        className="h-[3px] w-full"
        style={{ backgroundColor: colors.accent }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <input
          type="text"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onBlur={() => onTitleChange?.(localTitle)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onTitleChange?.(localTitle);
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="text-[13px] font-medium text-white/90 truncate flex-1 mr-2 bg-transparent outline-none border border-transparent focus:border-white/20 rounded px-1 -ml-1"
        />
        <div className="flex items-center gap-1.5 text-[11px] text-white/40 shrink-0">
          <Type className="size-3" />
          <span>Title</span>
        </div>
      </div>
    </motion.div>
  );
}
