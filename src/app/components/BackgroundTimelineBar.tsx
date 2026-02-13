import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Square, ChevronDown } from "lucide-react";

// ── Progress step names (~12 entries, cycling every ~10s) ───────────
const STEPS = [
  "Analyzing clips", "Detecting scenes", "Finding cut points",
  "Evaluating transitions", "Optimizing timing", "Refining edits",
  "Processing audio", "Matching beats", "Adjusting pacing",
  "Polishing cuts", "Finalizing sequence", "Rendering preview",
];
const DURATION_MS = 120_000; // 2 minutes total
const STEP_INTERVAL_MS = 10_000; // change step every 10s
const TICK_MS = 60; // progress tick interval

// ── Clip colors (matches JumpCutTimeline.tsx:716-721) ──────────────
const CLIP_COLORS = {
  blue:   { bg: '#1c77e9', border: '#6298ec' },
  purple: { bg: '#564aac', border: '#9287e2' },
  green:  { bg: '#2d8659', border: '#5fb885' },
  orange: { bg: '#d97706', border: '#fbbf24' },
  teal:   { bg: '#0d9488', border: '#5eead4' },
} as const;

type ClipColor = keyof typeof CLIP_COLORS;

// ── Layout constants (matches JumpCutTimeline.tsx:21-22) ───────────
const MARGIN = 16;
const GAP = 10;

// Grey clip colors for the diff timeline (muted so diff stripes pop)
const GREY_BG = '#2e2e30';
const GREY_BORDER = '#444446';

// ── Diff region types ──────────────────────────────────────────────
interface DiffRegion {
  type: 'addition' | 'deletion';
  startFraction: number; // 0–1 within clip
  endFraction: number;
}

interface DiffClip {
  id: number;
  title: string;
  color: ClipColor;
  width: number; // px
  diffs: DiffRegion[];
}

// ── Mock diff data ─────────────────────────────────────────────────
export const MOCK_DIFF_CLIPS: DiffClip[] = [
  { id: 0, title: "Clip 1", color: "blue",   width: 168, diffs: [{ type: 'deletion', startFraction: 0.6, endFraction: 0.85 }] },
  { id: 1, title: "Clip 2", color: "purple", width: 440, diffs: [{ type: 'addition', startFraction: 0.1, endFraction: 0.3 }, { type: 'deletion', startFraction: 0.7, endFraction: 0.9 }] },
  { id: 2, title: "Clip 3", color: "green",  width: 560, diffs: [{ type: 'addition', startFraction: 0.4, endFraction: 0.55 }] },
  { id: 3, title: "Clip 4", color: "orange", width: 400, diffs: [] },
  { id: 4, title: "Clip 5", color: "teal",   width: 360, diffs: [{ type: 'deletion', startFraction: 0.0, endFraction: 0.15 }, { type: 'addition', startFraction: 0.8, endFraction: 1.0 }] },
  { id: 5, title: "Clip 6", color: "blue",   width: 320, diffs: [{ type: 'addition', startFraction: 0.2, endFraction: 0.5 }] },
  { id: 6, title: "Clip 7", color: "purple", width: 320, diffs: [{ type: 'deletion', startFraction: 0.3, endFraction: 0.6 }] },
  { id: 7, title: "Clip 8", color: "green",  width: 320, diffs: [{ type: 'addition', startFraction: 0.05, endFraction: 0.25 }, { type: 'deletion', startFraction: 0.6, endFraction: 0.8 }] },
];

// ── DiffClipBlock sub-component ────────────────────────────────────
function DiffClipBlock({ clip, left }: { clip: DiffClip; left: number }) {
  return (
    <div
      className="absolute h-[36px]"
      style={{ left: `${left}px`, width: `${clip.width}px`, bottom: '22px' }}
    >
      <div
        className="size-full overflow-hidden relative"
        style={{ backgroundColor: GREY_BG }}
      >
        {/* Title */}
        <div className="flex items-center px-[9px] py-[3px] size-full">
          <p className="font-medium text-[13px] text-white/50 whitespace-nowrap overflow-hidden text-ellipsis">
            {clip.title}
          </p>
        </div>

        {/* Diff overlays */}
        {clip.diffs.map((diff, i) => {
          const leftPct = diff.startFraction * 100;
          const widthPct = (diff.endFraction - diff.startFraction) * 100;
          const isDeletion = diff.type === 'deletion';

          return (
            <div
              key={i}
              className="absolute inset-y-0"
              style={{
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                backgroundColor: isDeletion
                  ? 'rgba(239,68,68,0.15)'
                  : 'rgba(34,197,94,0.15)',
                backgroundImage: isDeletion
                  ? 'repeating-linear-gradient(-45deg, transparent 0px 3px, rgba(239,68,68,0.35) 3px 6px)'
                  : 'repeating-linear-gradient(-45deg, transparent 0px 3px, rgba(34,197,94,0.35) 3px 6px)',
              }}
            />
          );
        })}

        {/* Border */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ border: `0.5px solid ${GREY_BORDER}` }}
        />
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────
interface BackgroundTimelineBarProps {
  isActive: boolean;
  stepName: string;
  onStop: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  /** Whether the main timeline below is currently hovered */
  isTimelineHovered?: boolean;
  /** Hover position as fraction (0–1) of main timeline content width */
  hoverFraction?: number | null;
}

export function BackgroundTimelineBar({
  isActive,
  stepName: _stepName,
  onStop,
  onAccept,
  onReject,
  isTimelineHovered = false,
  hoverFraction = null,
}: BackgroundTimelineBarProps) {
  const [isBarHovered, setIsBarHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);

  // Timer: drive progress and step cycling
  useEffect(() => {
    if (!isActive) {
      // Reset when deactivated
      setProgress(0);
      setStepIndex(0);
      setIsDone(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const p = Math.min(elapsed / DURATION_MS, 1);
      setProgress(p);
      setStepIndex(Math.min(Math.floor(elapsed / STEP_INTERVAL_MS), STEPS.length - 1));
      if (p >= 1) {
        setIsDone(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, TICK_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  // Expand when hovering either this bar or the main timeline below
  const isExpanded = isBarHovered || isTimelineHovered;

  // Compute left positions for each clip (same logic as JumpCutTimeline.tsx:154-167)
  const clipLayouts = useMemo(() => {
    let currentLeft = MARGIN;
    return MOCK_DIFF_CLIPS.map((clip) => {
      const left = currentLeft;
      currentLeft += clip.width + GAP;
      return { ...clip, left };
    });
  }, []);

  const totalWidth = useMemo(() => {
    if (clipLayouts.length === 0) return 0;
    const last = clipLayouts[clipLayouts.length - 1];
    return last.left + last.width + MARGIN;
  }, [clipLayouts]);

  // Map main-timeline hover fraction → pixel position on diff timeline
  const playheadX = hoverFraction != null ? hoverFraction * totalWidth : null;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="shrink-0 w-full"
          initial={{ height: 0 }}
          animate={{ height: isExpanded ? 200 : 32 }}
          exit={{ height: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          onMouseEnter={() => setIsBarHovered(true)}
          onMouseLeave={() => setIsBarHovered(false)}
        >
          <div
            className="mx-3 h-full rounded-t-lg flex flex-col justify-end"
            style={{
              backgroundColor: "#1e1e1e",
              transform: isExpanded ? "scale(0.99)" : "scale(0.985)",
              transformOrigin: "bottom center",
              boxShadow: "0 -2px 8px rgba(0,0,0,0.3)",
              transition: "transform 0.3s ease",
            }}
          >
            {/* Top area: diff timeline (only when expanded) */}
            {isExpanded && (
              <div
                className="flex-1 overflow-x-auto overflow-y-clip"
                style={{
                  backgroundColor: '#171717',
                  borderBottom: '1px solid #25272b',
                }}
              >
                <div
                  className="relative h-full"
                  style={{ minWidth: `${totalWidth}px` }}
                >
                  {/* 3 track backgrounds */}
                  {[22, 65, 107].map((bottom) => (
                    <div
                      key={bottom}
                      className="absolute left-0 right-0 h-[36px]"
                      style={{
                        bottom: `${bottom}px`,
                        backgroundColor: '#201f22',
                        border: '1px solid #282829',
                      }}
                    />
                  ))}

                  {/* Clips on bottom track */}
                  {clipLayouts.map((clip) => (
                    <DiffClipBlock key={clip.id} clip={clip} left={clip.left} />
                  ))}

                  {/* Ghost playhead mirrored from main timeline */}
                  {playheadX != null && (
                    <div
                      className="absolute bottom-0 top-0 w-0.5 bg-white/30 pointer-events-none z-10"
                      style={{ left: `${playheadX}px`, transform: 'translateX(-50%)' }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Bottom row: header (32px) — stays pinned at bottom */}
            <div
              className="flex items-center gap-2 px-3 shrink-0"
              style={{ height: '32px' }}
            >
              {/* Left: icon + step name */}
              <Sparkles size={12} className="text-neutral-500 shrink-0" />
              <span className="text-[11px] text-neutral-500 shrink-0 select-none">
                {isDone ? "Done" : STEPS[stepIndex]}
              </span>

              {/* Center: progress bar */}
              <div className="flex-1 h-1 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress * 100}%`,
                    backgroundColor: isDone ? "#22c55e" : "#3b82f6",
                    transition: "background-color 0.4s",
                    ...(isDone
                      ? {}
                      : {
                          backgroundImage:
                            "repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255,255,255,0.15) 3px, rgba(255,255,255,0.15) 6px)",
                          backgroundSize: "12px 12px",
                          animation: "aqua-stripe-scroll 0.4s linear infinite",
                        }),
                  }}
                />
              </div>

              {/* Right: collapse chevron (when expanded) + stop/accept-reject buttons */}
              {isExpanded && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsBarHovered(false);
                  }}
                  className="shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-700 transition-colors"
                >
                  <ChevronDown size={14} className="text-neutral-400" />
                </button>
              )}
              {isDone ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReject?.();
                    }}
                    className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAccept?.();
                    }}
                    className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-[11px] font-medium px-3 h-5 rounded-full transition-colors"
                  >
                    Accept
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStop();
                  }}
                  className="shrink-0 w-4 h-4 rounded-full border border-neutral-600 flex items-center justify-center hover:border-neutral-400 transition-colors"
                  style={{ backgroundColor: "transparent" }}
                >
                  <Square size={7} className="text-neutral-500 fill-neutral-500" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
