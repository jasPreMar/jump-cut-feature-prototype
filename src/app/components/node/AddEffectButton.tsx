import { Plus, Palette, Gauge, Droplets, ArrowRightLeft, Maximize2, Anchor } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/app/components/ui/dropdown-menu";
import { EFFECT_TYPES } from "@/app/types/nodeEffects";

const ICON_MAP: Record<string, React.ReactNode> = {
  "Color Grade": <Palette className="size-4" />,
  "Speed Ramp": <Gauge className="size-4" />,
  "Blur": <Droplets className="size-4" />,
  "Transition": <ArrowRightLeft className="size-4" />,
  "Crop & Zoom": <Maximize2 className="size-4" />,
  "Stabilize": <Anchor className="size-4" />,
};

interface AddEffectButtonProps {
  onAddEffect: (effectType: string) => void;
}

export function AddEffectButton({ onAddEffect }: AddEffectButtonProps) {
  return (
    <div className="flex justify-center w-[320px]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] text-[#888] hover:text-white hover:border-[#444] transition-all duration-200 text-sm font-medium cursor-pointer">
            <Plus className="size-4" />
            Add Effect
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="bg-[#1e1e1e] border-[#2a2a2a] min-w-[200px]"
          side="bottom"
          align="center"
        >
          {EFFECT_TYPES.map((type) => (
            <DropdownMenuItem
              key={type}
              className="text-[#ccc] hover:text-white focus:bg-[#2a2a2a] focus:text-white cursor-pointer gap-3 py-2"
              onSelect={() => onAddEffect(type)}
            >
              {ICON_MAP[type]}
              {type}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
