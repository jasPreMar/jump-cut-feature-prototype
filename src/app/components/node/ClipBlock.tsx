import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Film } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { CLIP_COLORS } from "@/app/types/nodeEffects";

interface ClipBlockProps {
  clipId: number;
  title: string;
  color: "blue" | "purple" | "green" | "orange";
  imageSrc: string;
  onHover?: (hovered: boolean) => void;
  isHovered?: boolean;
  layoutId?: string;
}

export function ClipBlock({
  title,
  color,
  imageSrc,
  onHover,
  isHovered = false,
  layoutId,
}: ClipBlockProps) {
  const [localHovered, setLocalHovered] = useState(false);
  const hovered = isHovered || localHovered;
  const colors = CLIP_COLORS[color];

  return (
    <motion.div
      layoutId={layoutId}
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
    >
      {/* Color accent bar */}
      <div
        className="h-[3px] w-full"
        style={{ backgroundColor: colors.accent }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <p className="text-[13px] font-medium text-white/90 truncate flex-1 mr-2">
          {title}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-white/40 shrink-0">
          <Film className="size-3" />
          <span>Clip</span>
        </div>
      </div>

      {/* 16:9 Preview thumbnail */}
      <div className="mx-3 mb-2 rounded-lg overflow-hidden aspect-video bg-[#111]">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Hover prompt area */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-1">
              <p className="text-[11px] text-white/30 mb-1">Source clip</p>
              <p className="text-[12px] text-white/50 italic">
                Original footage
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
