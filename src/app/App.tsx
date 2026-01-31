import { useState, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { VideoEditor } from "@/app/components/VideoEditor";
import { JumpCutTimeline } from "@/app/components/JumpCutTimeline";
import { NodeCanvas } from "@/app/components/NodeCanvas";
import { FloatingPIP } from "@/app/components/FloatingPIP";
import type { EffectBlock } from "@/app/types/nodeEffects";

const sheetTransition = { duration: 1, ease: [0.42, 0, 0.58, 1] };

export default function App() {
  const [completedCuts, setCompletedCuts] = useState<number[]>([]);
  const [isNodeViewOpen, setIsNodeViewOpen] = useState(false);
  const [effectChains, setEffectChains] = useState<Record<number, EffectBlock[]>>({});
  const [playheadPosition, setPlayheadPosition] = useState(13);

  const handleToggleNodeView = useCallback(() => {
    setIsNodeViewOpen((prev) => !prev);
  }, []);

  const handleCloseNodeView = useCallback(() => {
    setIsNodeViewOpen(false);
  }, []);

  return (
    <LayoutGroup>
      <div className="bg-[#0e1015] flex flex-col h-screen w-full overflow-hidden">
        <div className="flex-1 min-h-0">
          <VideoEditor
            completedCuts={completedCuts}
            onToggleNodeView={handleToggleNodeView}
          />
        </div>
        <motion.div
          className="shrink-0 relative w-full overflow-hidden"
          initial={{ height: 200 }}
          animate={{ height: isNodeViewOpen ? "100dvh" : 200 }}
          transition={sheetTransition}
        >
          <AnimatePresence mode="popLayout">
            {isNodeViewOpen ? (
              <motion.div
                key="node-canvas"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <NodeCanvas
                  onClose={handleCloseNodeView}
                  effectChains={effectChains}
                  onEffectChainsChange={setEffectChains}
                  playheadPosition={playheadPosition}
                />
                <AnimatePresence>
                  <motion.div
                    key="floating-pip"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <FloatingPIP completedCuts={completedCuts} />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="timeline"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <JumpCutTimeline
                  onCutsChange={setCompletedCuts}
                  playheadPosition={playheadPosition}
                  onPlayheadChange={setPlayheadPosition}
                  isNodeViewOpen={isNodeViewOpen}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </LayoutGroup>
  );
}
