import { useEffect, useRef } from "react";
import { Type, ImageIcon, Film } from "lucide-react";
import { EFFECT_TYPES } from "@/app/types/nodeEffects";

const ICON_MAP: Record<string, React.ReactNode> = {
  Text: <Type className="size-4" />,
  Image: <ImageIcon className="size-4" />,
  Video: <Film className="size-4" />,
};

interface QuickAddMenuProps {
  position: { x: number; y: number };
  onSelect: (effectType: string) => void;
  onClose: () => void;
}

export function QuickAddMenu({ position, onSelect, onClose }: QuickAddMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] shadow-xl shadow-black/40 py-1 min-w-[180px] z-50"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="px-3 py-1.5 text-[11px] text-white/40 font-medium">
        Add Effect
      </div>
      {EFFECT_TYPES.map((type) => (
        <button
          key={type}
          className="flex items-center gap-3 w-full px-3 py-2 text-[#ccc] hover:bg-[#2a2a2a] hover:text-white transition-colors text-sm cursor-pointer"
          onClick={() => onSelect(type)}
        >
          {ICON_MAP[type]}
          {type}
        </button>
      ))}
    </div>
  );
}
