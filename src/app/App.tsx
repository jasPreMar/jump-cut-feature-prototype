import { useState, useCallback, useEffect } from "react";
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
  const [playheadTime, setPlayheadTime] = useState(0); // seconds along timeline
  const [durations, setDurations] = useState<number[]>(Array(8).fill(0)); // video clip durations in seconds
  const [clipTrimStart, setClipTrimStart] = useState<number[]>(Array(8).fill(0)); // start time (sec) within each clip
  const [clipTrimEnd, setClipTrimEnd] = useState<number[]>(Array(8).fill(0)); // end time (sec) within each clip
  const [isPlaying, setIsPlaying] = useState(false);

  // When durations load, set trim end to duration only when not yet set (don’t overwrite user cuts)
  useEffect(() => {
    if (durations.length !== 8) return;
    setClipTrimEnd((prev) => {
      const next = [...prev];
      let changed = false;
      for (let i = 0; i < 8; i++) if (durations[i] > 0 && (prev[i] === 0 || prev[i] === undefined)) { next[i] = durations[i]; changed = true; }
      return changed ? next : prev;
    });
  }, [durations]);

  const handleTrimChange = useCallback((trimStart: number[], trimEnd: number[]) => {
    setClipTrimStart(trimStart);
    setClipTrimEnd(trimEnd);
  }, []);

  const handleSeekAndPlay = useCallback((timeSeconds: number) => {
    setPlayheadTime(timeSeconds);
    setIsPlaying(true);
  }, []);

  const handleToggleNodeView = useCallback(() => {
    setIsNodeViewOpen((prev) => !prev);
  }, []);

  const handleCloseNodeView = useCallback(() => {
    setIsNodeViewOpen(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== " " || e.repeat) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      e.preventDefault();
      handlePlayPause();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlePlayPause]);

  return (
    <LayoutGroup>
      <div className="bg-[#0e1015] flex flex-col h-screen w-full overflow-hidden">
        <div className="flex-1 min-h-0">
          <VideoEditor
            completedCuts={completedCuts}
            playheadTime={playheadTime}
            onPlayheadTimeChange={setPlayheadTime}
            durations={durations}
            onDurationsChange={setDurations}
            clipTrimStart={clipTrimStart}
            clipTrimEnd={clipTrimEnd}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
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
                  playheadTime={playheadTime}
                  durations={durations}
                  clipTrimStart={clipTrimStart}
                  clipTrimEnd={clipTrimEnd}
                  onSeekAndPlay={handleSeekAndPlay}
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
                    <FloatingPIP
                      completedCuts={completedCuts}
                      playheadTime={playheadTime}
                      durations={durations}
                      clipTrimStart={clipTrimStart}
                      clipTrimEnd={clipTrimEnd}
                      isPlaying={isPlaying}
                      onPlayPause={handlePlayPause}
                    />
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
                  durations={durations}
                  clipTrimStart={clipTrimStart}
                  clipTrimEnd={clipTrimEnd}
                  onTrimChange={handleTrimChange}
                  playheadTime={playheadTime}
                  onPlayheadTimeChange={setPlayheadTime}
                  isNodeViewOpen={isNodeViewOpen}
                  onToggleNodeView={handleToggleNodeView}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </LayoutGroup>
  );
}
