import { useEffect, useState, useCallback } from "react";
import { X, LayoutGrid } from "lucide-react";
import { ClipBlock } from "@/app/components/node/ClipBlock";
import { EffectBlock as EffectBlockComponent } from "@/app/components/node/EffectBlock";
import { ConnectionLine } from "@/app/components/node/ConnectionLine";
import { AddEffectButton } from "@/app/components/node/AddEffectButton";
import type { EffectBlock } from "@/app/types/nodeEffects";

import image1 from "../../assets/4ade86ef9dac706bb3957bd6282d330df1e57c89.png";
import image2 from "../../assets/c4945bd878c904a44e42b756d4a58bd0d542132d.png";
import image3 from "../../assets/7633c3f223e4bc39f692ecfd0b163fb92cb5ad4e.png";
import image4 from "../../assets/fdac420adeb4e37cb6c0fc58ae2eaac15892ec6c.png";

const CLIP_IMAGES = [image1, image2, image3, image4];

const CLIPS = [
  { id: 0, title: "Introducing Log Explorer", color: "blue" as const },
  { id: 1, title: "Google Chrome Log Explorer Demo", color: "purple" as const },
  { id: 2, title: "Analytics Dashboard", color: "green" as const },
  { id: 3, title: "User Engagement Metrics", color: "orange" as const },
];

interface NodeCanvasProps {
  onClose: () => void;
  effectChains: Record<number, EffectBlock[]>;
  onEffectChainsChange: (chains: Record<number, EffectBlock[]>) => void;
}

export function NodeCanvas({
  onClose,
  effectChains,
  onEffectChainsChange,
}: NodeCanvasProps) {
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);

  // Escape key handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleAddEffect = useCallback(
    (clipId: number, effectType: string) => {
      const existing = effectChains[clipId] || [];
      const newEffect: EffectBlock = {
        id: `${clipId}-${Date.now()}`,
        clipId,
        effectType,
        prompt: "",
        order: existing.length,
      };
      onEffectChainsChange({
        ...effectChains,
        [clipId]: [...existing, newEffect],
      });
    },
    [effectChains, onEffectChainsChange]
  );

  const handleRemoveEffect = useCallback(
    (clipId: number, effectId: string) => {
      const existing = effectChains[clipId] || [];
      const updated = existing
        .filter((e) => e.id !== effectId)
        .map((e, i) => ({ ...e, order: i }));
      onEffectChainsChange({
        ...effectChains,
        [clipId]: updated,
      });
    },
    [effectChains, onEffectChainsChange]
  );

  const handlePromptChange = useCallback(
    (clipId: number, effectId: string, prompt: string) => {
      const existing = effectChains[clipId] || [];
      const updated = existing.map((e) =>
        e.id === effectId ? { ...e, prompt } : e
      );
      onEffectChainsChange({
        ...effectChains,
        [clipId]: updated,
      });
    },
    [effectChains, onEffectChainsChange]
  );

  return (
    <div className="absolute inset-0 bg-[#0e1015] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#25272b] shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-[#888] hover:text-white transition-colors cursor-pointer"
        >
          <X className="size-5" />
          <span className="text-sm font-medium">Close</span>
        </button>
        <div className="flex items-center gap-2 text-white/60">
          <LayoutGrid className="size-4" />
          <span className="text-sm font-medium">Node Effects</span>
        </div>
        <div className="w-[80px]" /> {/* Spacer for centering */}
      </div>

      {/* Scrollable canvas area */}
      <div className="flex-1 overflow-auto">
        <div className="flex gap-10 p-8 min-h-full items-start justify-center">
          {CLIPS.map((clip) => {
            const effects = effectChains[clip.id] || [];
            const clipBlockId = `clip-block-${clip.id}`;
            const isClipHovered = hoveredBlockId === clipBlockId;

            return (
              <div
                key={clip.id}
                className="flex flex-col items-center"
              >
                {/* Clip block */}
                <ClipBlock
                  clipId={clip.id}
                  layoutId={`clip-${clip.id}`}
                  title={clip.title}
                  color={clip.color}
                  imageSrc={CLIP_IMAGES[clip.id]}
                  isHovered={isClipHovered}
                  onHover={(h) =>
                    setHoveredBlockId(h ? clipBlockId : null)
                  }
                />

                {/* Effect chain */}
                {effects.map((effect) => {
                  const effectBlockId = `effect-${effect.id}`;
                  const isEffectHovered =
                    hoveredBlockId === effectBlockId;

                  return (
                    <div
                      key={effect.id}
                      className="flex flex-col items-center"
                    >
                      <ConnectionLine
                        isHovered={isEffectHovered || isClipHovered}
                      />
                      <EffectBlockComponent
                        id={effect.id}
                        effectType={effect.effectType}
                        prompt={effect.prompt}
                        imageSrc={CLIP_IMAGES[clip.id]}
                        onPromptChange={(id, prompt) =>
                          handlePromptChange(clip.id, id, prompt)
                        }
                        onRemove={(id) =>
                          handleRemoveEffect(clip.id, id)
                        }
                        isHovered={isEffectHovered}
                        onHover={(h) =>
                          setHoveredBlockId(
                            h ? effectBlockId : null
                          )
                        }
                      />
                    </div>
                  );
                })}

                {/* Connection line to add button */}
                <ConnectionLine
                  isHovered={false}
                />

                {/* Add effect button */}
                <AddEffectButton
                  onAddEffect={(type) =>
                    handleAddEffect(clip.id, type)
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
