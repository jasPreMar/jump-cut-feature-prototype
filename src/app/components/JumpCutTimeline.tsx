import { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from 'react';
import { motion } from 'motion/react';
import { Workflow } from 'lucide-react';
import svgPaths from "@/imports/svg-mbvhuxpq3m";
interface Clip {
  id: number;
  title: string;
  color: 'blue' | 'purple' | 'green' | 'orange' | 'teal';
  originalWidth: number;
  transcript: string;
}

interface JumpCut {
  id: number;
  clipIndex: number;
  endCutPosition: number;
  nextClipStartPosition: number;
}

const BASE_PIXELS_PER_SECOND = 80;
const GAP = 10;
const MARGIN = 16;
const MAX_ZOOM = 4;

interface JumpCutTimelineProps {
  onCutsChange: (cuts: number[]) => void;
  durations: number[];
  clipTrimStart: number[];
  clipTrimEnd: number[];
  onTrimChange: (trimStart: number[], trimEnd: number[]) => void;
  playheadTime: number;
  onPlayheadTimeChange: (timeSeconds: number) => void;
  isNodeViewOpen?: boolean;
  onToggleNodeView?: () => void;
}

export function JumpCutTimeline({ onCutsChange, durations, clipTrimStart, clipTrimEnd, onTrimChange, playheadTime, onPlayheadTimeChange, isNodeViewOpen = false, onToggleNodeView }: JumpCutTimelineProps) {
  const [currentCutIndex, setCurrentCutIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [completedCuts, setCompletedCuts] = useState<number[]>([]);
  const [customCutPositions, setCustomCutPositions] = useState<Record<number, number>>({});
  const [clipStartPositions, setClipStartPositions] = useState<Record<number, number>>({});
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null);
  const [timelineClickedOnce, setTimelineClickedOnce] = useState(false);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [zoom, setZoom] = useState(0.01);
  const [containerWidth, setContainerWidth] = useState(0);
  const pinchStartRef = useRef<{ distance: number; zoom: number } | null>(null);
  const initialZoomSetRef = useRef(false);
  const prevMinZoomRef = useRef<number | null>(null);
  const [manualSplits, setManualSplits] = useState<number[]>([]);
  const [history, setHistory] = useState<Array<{
    completedCuts: number[];
    currentCutIndex: number;
    customCutPositions: Record<number, number>;
    clipStartPositions: Record<number, number>;
    manualSplits: number[];
    trimStart: number[];
    trimEnd: number[];
  }>>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const applyCurrentCutRef = useRef<() => void>(() => {});

  // Cut transition: split → fade removed (150ms) → collapse gap (150ms) → apply cut
  const [cutTransition, setCutTransition] = useState<{
    left: number;
    right: number;
    clipIndex: number;
    phase: 'fade' | 'collapse';
  } | null>(null);
  const cutTransitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Define clips with base configuration (originalWidth kept for jump-cut proportions)
  const baseClips: Clip[] = [
    { id: 0, title: "Clip 1", color: "blue", originalWidth: 210, transcript: "Debug mode is actually an agent that can help you with the most challenging parts of this process. And go to demo." },
    { id: 1, title: "Clip 2", color: "purple", originalWidth: 550, transcript: "" },
    { id: 2, title: "Clip 3", color: "green", originalWidth: 700, transcript: "I'm Albert, and before joining Cursor, I spent time doing kernel development work, including Linux optimizations and working on low-level USB drivers" },
    { id: 3, title: "Clip 4", color: "orange", originalWidth: 500, transcript: "I'm Alexey. Before Cursor" },
    { id: 4, title: "Clip 5", color: "teal", originalWidth: 450, transcript: "I was working on Chrome DevTools JavaScript debugging, and here at Cursor, my team usually deals with most challenging bugs." },
    { id: 5, title: "Clip 6", color: "blue", originalWidth: 400, transcript: "And today, we're excited to show you debug mode." },
    { id: 6, title: "Clip 7", color: "purple", originalWidth: 400, transcript: "A new way to interact with the agent to systematically approach" },
    { id: 7, title: "Clip 8", color: "green", originalWidth: 400, transcript: "the most complex bugs. First, you need to define an issue to an agent. You need to select debug mode, and you need to submit your prompt. The agent will then" },
  ];

  const jumpCuts: JumpCut[] = [];

  // Full durations (for converting cut positions to seconds)
  const fullDurations = useMemo(() => {
    const d = durations.length === 8 ? durations : Array(8).fill(1);
    if (d.every((x) => x <= 0)) return Array(8).fill(1);
    return d.map((x) => (x > 0 ? x : 1));
  }, [durations]);

  // Trimmed durations for layout (actual in/out points)
  const effectiveDurations = useMemo(() => {
    const trimsOk = clipTrimStart.length === 8 && clipTrimEnd.length === 8;
    return fullDurations.map((full, i) => {
      if (!trimsOk || clipTrimEnd[i] <= clipTrimStart[i]) return full;
      return Math.max(0, clipTrimEnd[i] - clipTrimStart[i]);
    });
  }, [fullDurations, clipTrimStart, clipTrimEnd]);

  const pps = BASE_PIXELS_PER_SECOND * zoom;
  const totalDurationSec = effectiveDurations.reduce((a, b) => a + b, 0);

  // Min zoom = zoom out until full timeline fits in viewport (same width formula as clips)
  const minZoom = useMemo(() => {
    if (totalDurationSec <= 0 || containerWidth <= 0) return 0.25;
    const widthAtZoom1 = 2 * MARGIN + totalDurationSec * BASE_PIXELS_PER_SECOND + (baseClips.length - 1) * GAP;
    return Math.max(0.01, containerWidth / widthAtZoom1);
  }, [totalDurationSec, containerWidth]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerWidth(el.clientWidth));
    ro.observe(el);
    setContainerWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Clamp zoom to minZoom, but only after we have real container size. On first run, cap at 1 so we
  // never start zoomed in (avoids jump when default durations make minZoom > 1). When minZoom later
  // decreases (e.g. real durations load), set zoom to new minZoom so we stay fitted. Never clamp
  // upward past 1 (so we don't "zoom in" on load when timeline is shorter than viewport).
  useEffect(() => {
    if (containerWidth <= 0) return;
    const prevMin = prevMinZoomRef.current;
    prevMinZoomRef.current = minZoom;

    if (!initialZoomSetRef.current) {
      setZoom(Math.min(minZoom, 1));
      initialZoomSetRef.current = true;
      return;
    }
    if (prevMin !== null && minZoom < prevMin) {
      setZoom(minZoom);
      return;
    }
    if (zoom < minZoom) {
      if (minZoom <= 1) setZoom(minZoom);
      // when minZoom > 1 (short timeline), don't clamp so we stay at 1 and don't jump zoomed in
    }
  }, [minZoom, containerWidth, zoom]);

  // Clip layout: widths = trimmed duration (actual in/out from cuts)
  const clips = useMemo(() => {
    let currentLeft = MARGIN;
    return baseClips.map((clip, index) => {
      const dur = effectiveDurations[index];
      const fullWidth = dur * pps;
      const isEndCut = completedCuts.includes(index);
      const clipData = {
        ...clip,
        left: currentLeft,
        width: fullWidth,
        fullWidth,
        isCut: isEndCut,
      };
      currentLeft += fullWidth + GAP;
      return clipData;
    });
  }, [effectiveDurations, pps, completedCuts]);

  const totalWidthPx = useMemo(() => {
    if (clips.length === 0) return 2800;
    const last = clips[clips.length - 1];
    return last.left + (last as { fullWidth?: number }).fullWidth! + MARGIN;
  }, [clips]);

  // Time <-> pixel conversion
  const startTimesSec = useMemo(() => {
    const s: number[] = [0];
    for (let i = 0; i < effectiveDurations.length; i++) s.push(s[i] + effectiveDurations[i]);
    return s;
  }, [effectiveDurations]);

  const timeToPixel = useCallback((t: number) => {
    for (let i = 0; i < clips.length; i++) {
      const start = startTimesSec[i];
      const end = startTimesSec[i + 1];
      const dur = effectiveDurations[i];
      if (t >= start && t < end && dur > 0) {
        const clip = clips[i];
        const frac = (t - start) / dur;
        return (clip as { left: number; fullWidth?: number }).left + frac * ((clip as { fullWidth?: number }).fullWidth ?? clip.width);
      }
    }
    const last = clips[clips.length - 1];
    return last ? (last as { left: number; fullWidth?: number }).left + ((last as { fullWidth?: number }).fullWidth ?? last.width) : MARGIN;
  }, [startTimesSec, effectiveDurations, clips]);

  const pixelToTime = useCallback((px: number) => {
    for (let i = 0; i < clips.length; i++) {
      const c = clips[i] as { left: number; width: number; fullWidth?: number };
      const fullW = c.fullWidth ?? c.width;
      const end = c.left + fullW;
      if (px >= c.left && px < end) {
        const frac = fullW > 0 ? (px - c.left) / fullW : 0;
        return startTimesSec[i] + frac * effectiveDurations[i];
      }
    }
    return Math.min(playheadTime, totalDurationSec);
  }, [clips, startTimesSec, effectiveDurations, totalDurationSec, playheadTime]);

  const playheadPosition = timeToPixel(playheadTime);

  // Calculate the position of the current jump cut indicator (proportion-based in new layout)
  const currentCutPosition = useMemo(() => {
    if (currentCutIndex >= jumpCuts.length) return null;
    const cut = jumpCuts[currentCutIndex];
    const clip = clips[cut.clipIndex] as { left: number; fullWidth?: number };
    const nextClip = clips[cut.clipIndex + 1] as { left: number; fullWidth?: number } | undefined;
    if (!nextClip) return null;
    const fullW = clip.fullWidth ?? 0;
    const nextFullW = nextClip.fullWidth ?? 0;
    const endCutAbsolutePosition = clip.left + (cut.endCutPosition / baseClips[cut.clipIndex].originalWidth) * fullW;
    const nextClipStartAbsolutePosition = nextClip.left + (cut.nextClipStartPosition / baseClips[cut.clipIndex + 1].originalWidth) * nextFullW;
    return (endCutAbsolutePosition + nextClipStartAbsolutePosition) / 2;
  }, [currentCutIndex, clips]);

  // Left/right boundaries of the cut region (for dashed playheads and darkened strip)
  const cutBoundaryPositions = useMemo(() => {
    if (currentCutIndex >= jumpCuts.length) return null;
    const cut = jumpCuts[currentCutIndex];
    const clip = clips[cut.clipIndex] as { left: number; fullWidth?: number };
    const nextClip = clips[cut.clipIndex + 1] as { left: number; fullWidth?: number } | undefined;
    if (!nextClip) return null;
    const fullW = clip.fullWidth ?? 0;
    const nextFullW = nextClip.fullWidth ?? 0;
    const left = clip.left + (cut.endCutPosition / baseClips[cut.clipIndex].originalWidth) * fullW;
    const right = nextClip.left + (cut.nextClipStartPosition / baseClips[cut.clipIndex + 1].originalWidth) * nextFullW;
    return { left, right };
  }, [currentCutIndex, clips]);

  const isComplete = currentCutIndex >= jumpCuts.length;
  const currentCut = jumpCuts[currentCutIndex];

  // Cut is "on screen" if it's within the visible viewport (with margins)
  const cutIsOnScreen = useMemo(() => {
    if (currentCutPosition == null || containerWidth <= 0) return false;
    return currentCutPosition >= scrollLeft + 100 && currentCutPosition <= scrollLeft + containerWidth - 200;
  }, [currentCutPosition, scrollLeft, containerWidth]);

  // When cut is on screen, skip "to jump" and show "to cut" directly; otherwise jump then cut
  const showCutPhase = cutIsOnScreen || showPreview;

  // Helper to save state to history (for C-key split; trim passed through)
  const saveToHistory = (
    newCompletedCuts: number[],
    newCurrentCutIndex: number,
    newCustomCutPositions: Record<number, number>,
    newClipStartPositions: Record<number, number>,
    newManualSplits: number[],
    newTrimStart: number[],
    newTrimEnd: number[]
  ) => {
    const newState = {
      completedCuts: newCompletedCuts,
      currentCutIndex: newCurrentCutIndex,
      customCutPositions: newCustomCutPositions,
      clipStartPositions: newClipStartPositions,
      manualSplits: newManualSplits,
      trimStart: newTrimStart,
      trimEnd: newTrimEnd,
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCompletedCuts(newCompletedCuts);
    setCurrentCutIndex(newCurrentCutIndex);
    setCustomCutPositions(newCustomCutPositions);
    setClipStartPositions(newClipStartPositions);
    setManualSplits(newManualSplits);
    onTrimChange(newTrimStart, newTrimEnd);
    onCutsChange(newCompletedCuts);
  };

  // Helper to find which clip contains a position (use full clip width for hit area)
  const findClipAtPosition = (position: number): { clipIndex: number; positionInClip: number } | null => {
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i] as { left: number; width: number; fullWidth?: number };
      const fullW = clip.fullWidth ?? clip.width;
      if (position >= clip.left && position < clip.left + fullW) {
        return {
          clipIndex: i,
          positionInClip: position - clip.left
        };
      }
    }
    return null;
  };

  // Helper to handle Tab action (jump or cut)
  const handleTabAction = () => {
    if (isComplete) return;
    
    // If cut is already on screen, first Tab does the cut; otherwise first Tab jumps, second Tab cuts
    if (cutIsOnScreen) {
      // Cut is visible: start transition then apply cut
      if (cutBoundaryPositions) {
        setCutTransition({ left: cutBoundaryPositions.left, right: cutBoundaryPositions.right, clipIndex: currentCut!.clipIndex, phase: 'fade' });
      } else {
        applyCurrentCut();
      }
      return;
    }
    if (!showPreview) {
      // Cut is off screen: First Tab jumps to the cut and shows preview
      setShowPreview(true);
      if (scrollContainerRef.current && currentCutPosition) {
        const scrollPosition = currentCutPosition - 400;
        scrollContainerRef.current.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });
      }
      return;
    }
    // Second Tab (cut was off screen, we jumped, now cut)
    if (cutBoundaryPositions) {
      setCutTransition({ left: cutBoundaryPositions.left, right: cutBoundaryPositions.right, clipIndex: currentCut!.clipIndex, phase: 'fade' });
    } else {
      applyCurrentCut();
    }
  };

  const applyCurrentCut = () => {
    if (currentCutIndex >= jumpCuts.length) return;
    const cut = jumpCuts[currentCutIndex];
    const ci = cut.clipIndex;
    const nextIdx = ci + 1;
    const endSec = (cut.endCutPosition / baseClips[ci].originalWidth) * fullDurations[ci];
    const nextStartSec = nextIdx < baseClips.length
      ? (cut.nextClipStartPosition / baseClips[nextIdx].originalWidth) * fullDurations[nextIdx]
      : 0;
    const newTrimStart = [...clipTrimStart];
    const newTrimEnd = [...clipTrimEnd];
    newTrimEnd[ci] = endSec;
    if (nextIdx < baseClips.length) newTrimStart[nextIdx] = nextStartSec;

    const newCompletedCuts = [...completedCuts, ci];
    const newCurrentCutIndex = currentCutIndex + 1;
    const newClipStartPositions = { ...clipStartPositions };
    if (nextIdx < baseClips.length) {
      newClipStartPositions[nextIdx] = cut.nextClipStartPosition / baseClips[nextIdx].originalWidth;
    }

    const beforeState = {
      completedCuts,
      currentCutIndex,
      customCutPositions,
      clipStartPositions,
      manualSplits,
      trimStart: clipTrimStart,
      trimEnd: clipTrimEnd,
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(beforeState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCompletedCuts(newCompletedCuts);
    setCurrentCutIndex(newCurrentCutIndex);
    setClipStartPositions(newClipStartPositions);
    onTrimChange(newTrimStart, newTrimEnd);
    onCutsChange(newCompletedCuts);
    setShowPreview(false);
  };

  // Keep ref updated so transition timeout can call it
  applyCurrentCutRef.current = applyCurrentCut;

  // Cut transition timers: 150ms fade, then 150ms collapse, then apply cut
  useEffect(() => {
    if (!cutTransition) return;
    if (cutTransitionTimeoutRef.current) clearTimeout(cutTransitionTimeoutRef.current);
    if (cutTransition.phase === 'fade') {
      cutTransitionTimeoutRef.current = setTimeout(() => {
        setCutTransition((prev) => prev ? { ...prev, phase: 'collapse' } : null);
      }, 150);
    } else {
      cutTransitionTimeoutRef.current = setTimeout(() => {
        applyCurrentCutRef.current();
        setCutTransition(null);
        setShowPreview(false);
      }, 150);
    }
    return () => {
      if (cutTransitionTimeoutRef.current) clearTimeout(cutTransitionTimeoutRef.current);
    };
  }, [cutTransition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          const state = history[newIndex];
          setHistoryIndex(newIndex);
          setCompletedCuts(state.completedCuts);
          setCurrentCutIndex(state.currentCutIndex);
          setCustomCutPositions(state.customCutPositions);
          setClipStartPositions(state.clipStartPositions);
          setManualSplits(state.manualSplits);
          setShowPreview(false);
          if (state.trimStart && state.trimEnd) onTrimChange(state.trimStart, state.trimEnd);
          onCutsChange(state.completedCuts);
        }
        return;
      }

      // Redo
      if ((e.metaKey || e.ctrlKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          const state = history[newIndex];
          setHistoryIndex(newIndex);
          setCompletedCuts(state.completedCuts);
          setCurrentCutIndex(state.currentCutIndex);
          setCustomCutPositions(state.customCutPositions);
          setClipStartPositions(state.clipStartPositions);
          setManualSplits(state.manualSplits);
          setShowPreview(false);
          if (state.trimStart && state.trimEnd) onTrimChange(state.trimStart, state.trimEnd);
          onCutsChange(state.completedCuts);
        }
        return;
      }

      // Split clip with 'C' key at hover position, or playhead if not hovering
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const cutPos = hoveredPosition ?? playheadPosition;
        const clipInfo = findClipAtPosition(cutPos);
        if (clipInfo && clipInfo.positionInClip > 4 && clipInfo.positionInClip < clips[clipInfo.clipIndex].width - 4) {
          const newManualSplits = [...manualSplits, cutPos];
          saveToHistory(completedCuts, currentCutIndex, customCutPositions, clipStartPositions, newManualSplits, clipTrimStart, clipTrimEnd);
        }
        return;
      }

      // Tab navigation
      if (e.key === 'Tab' && !isComplete) {
        e.preventDefault();
        handleTabAction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCutIndex, showPreview, cutIsOnScreen, completedCuts, currentCut, isComplete, currentCutPosition, history, historyIndex, hoveredPosition, clips, playheadPosition]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(minZoom, z + delta)));
  }, [minZoom]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
      pinchStartRef.current = { distance: d, zoom };
    }
  }, [zoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartRef.current) {
      e.preventDefault();
      const d = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
      const scale = d / pinchStartRef.current.distance;
      const newZoom = Math.min(MAX_ZOOM, Math.max(minZoom, pinchStartRef.current.zoom * scale));
      pinchStartRef.current = { distance: d, zoom: newZoom };
      setZoom(newZoom);
    }
  }, [minZoom]);

  const handleTouchEnd = useCallback(() => {
    if (pinchStartRef.current && scrollContainerRef.current) pinchStartRef.current = null;
  }, []);

  return (
    <div
      className="absolute bg-[#171717] border-[#25272b] border-solid border-t inset-0 overflow-x-auto overflow-y-clip"
      ref={scrollContainerRef}
      onScroll={(e) => setScrollLeft(e.currentTarget.scrollLeft)}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{ touchAction: 'pan-x pinch-zoom' }}
    >
      {/* Canvas / workflow view button – top-right of timeline */}
      {onToggleNodeView && (
        <button
          onClick={onToggleNodeView}
          className="absolute top-2 right-2 z-40 w-8 h-8 flex items-center justify-center rounded bg-[#25252a] hover:bg-[#323436] transition-colors text-[#bcbcbe] hover:text-white cursor-pointer"
          title="Workflow / Canvas view"
        >
          <Workflow className="size-4" />
        </button>
      )}

      <div className="relative h-full" style={{ minWidth: totalWidthPx }} ref={timelineRef}>
        {/* Timeline rulers – actual time */}
        <TimelineRulers totalDurationSec={totalDurationSec} timeToPixel={timeToPixel} />
        
        {/* Track backgrounds */}
        <div className="absolute bg-[#201f22] border border-[#282829] border-solid bottom-[22px] h-[36px] left-[16px] right-[16px]" />
        <div className="absolute bg-[#201f22] border border-[#282829] border-solid bottom-[107px] h-[36px] left-[16px] right-[16px]" />
        <div className="absolute bg-[#201f22] border border-[#282829] border-solid bottom-[65px] h-[36px] left-[16px] right-[16px]" />
        
        {/* Video clip blocks removed — top two tracks are empty backgrounds */}
        
        {/* Script/dialogue track – split into 4 segments during cut transition (same 1–2–3 flow as video tracks) */}
        <ScriptTrack
          clips={clips}
          hoveredPosition={hoveredPosition}
          cutPreviews={[]}
          cutHighlightPositions={timelineClickedOnce && showCutPhase && cutBoundaryPositions && !cutTransition ? { left: cutBoundaryPositions.left, right: cutBoundaryPositions.right } : null}
          cutTransition={cutTransition}
        />
        {/* Script track split segments during cut transition: keep0, remove0 (fade), remove1 (fade), keep1 (collapse) */}
        {cutTransition && (() => {
          const ci = cutTransition.clipIndex;
          const nextIdx = ci + 1;
          const clip0 = clips[ci] as { left: number; fullWidth?: number; width: number };
          const clip1 = clips[nextIdx] as { left: number; fullWidth?: number; width: number } | undefined;
          if (!clip1) return null;
          const fullW0 = clip0.fullWidth ?? clip0.width;
          const fullW1 = clip1.fullWidth ?? clip1.width;
          const SLICE_GAP_PX = 2;
          const keep0Left = clip0.left;
          const keep0Width = cutTransition.left - clip0.left;
          const remove0Left = cutTransition.left + SLICE_GAP_PX;
          const remove0Width = clip0.left + fullW0 - cutTransition.left - SLICE_GAP_PX;
          const remove1Left = clip1.left;
          const remove1Width = cutTransition.right - clip1.left - SLICE_GAP_PX;
          const keep1Left = cutTransition.right + SLICE_GAP_PX;
          const keep1Width = clip1.left + fullW1 - cutTransition.right - SLICE_GAP_PX;
          const collapseTargetLeft = keep0Left + keep0Width + GAP;
          return (
            <>
              <ScriptTrackSegmentBlock left={keep0Left} width={keep0Width} />
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ position: 'absolute', bottom: 0, height: '184px', pointerEvents: 'none' }}
              >
                <ScriptTrackSegmentBlock left={remove0Left} width={remove0Width} />
              </motion.div>
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ position: 'absolute', bottom: 0, height: '184px', pointerEvents: 'none' }}
              >
                <ScriptTrackSegmentBlock left={remove1Left} width={remove1Width} />
              </motion.div>
              <motion.div
                initial={{ left: keep1Left }}
                animate={{ left: cutTransition.phase === 'collapse' ? collapseTargetLeft : keep1Left }}
                transition={{ duration: 0.15 }}
                style={{ position: 'absolute', bottom: 0, height: '184px', pointerEvents: 'none' }}
              >
                <ScriptTrackSegmentBlock left={0} width={keep1Width} />
              </motion.div>
            </>
          );
        })()}
        
        {/* Playhead */}
        <Playhead position={playheadPosition} />
        
        {/* Hover ghost playhead */}
        {hoveredPosition !== null && (
          <Playhead position={hoveredPosition} ghost />
        )}

        {/* Cut preview: darkened strip + dashed lines (during preview or cut transition phase 'fade') */}
        {((timelineClickedOnce && showCutPhase && cutBoundaryPositions) || (cutTransition && cutTransition.phase === 'fade')) && (() => {
          const left = cutTransition ? cutTransition.left : cutBoundaryPositions!.left;
          const right = cutTransition ? cutTransition.right : cutBoundaryPositions!.right;
          return (
            <>
              <div
                className="absolute bottom-0 pointer-events-none z-10"
                style={{
                  left: `${left}px`,
                  width: `${right - left}px`,
                  height: '184px',
                  backgroundColor: 'rgba(0,0,0,0.4)'
                }}
              />
              <DashedGhostPlayhead position={left} />
              <DashedGhostPlayhead position={right} />
            </>
          );
        })()}
        
        {/* Hover detection zones + click to seek (content coords = scrollLeft + viewport x) */}
        <div 
          className="absolute h-[192px] left-0 top-0 right-0 z-20 cursor-pointer"
          onMouseMove={(e) => {
            const container = scrollContainerRef.current;
            if (!container) return;
            const rect = container.getBoundingClientRect();
            const x = scrollLeft + (e.clientX - rect.left);
            setHoveredPosition(Math.round(x));
          }}
          onMouseLeave={() => setHoveredPosition(null)}
          onClick={() => {
            setTimelineClickedOnce(true);
            if (hoveredPosition !== null) onPlayheadTimeChange(pixelToTime(hoveredPosition));
          }}
        />
      </div>
      
      {/* Jump cut indicator - only after first timeline click; hidden during cut transition */}
      {timelineClickedOnce && !isComplete && !cutTransition && currentCutPosition && scrollContainerRef.current && (
        <JumpCutIndicator 
          position={currentCutPosition}
          scrollLeft={scrollLeft}
          viewportWidth={scrollContainerRef.current.clientWidth}
          showCutPhase={showCutPhase}
          onTabAction={handleTabAction}
        />
      )}
    </div>
  );
}

function formatRulerTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m > 0) return `${m}:${s.toString().padStart(2, '0')}`;
  return s.toString();
}

function TimelineRulers({ totalDurationSec, timeToPixel }: { totalDurationSec: number; timeToPixel: (t: number) => number }) {
  const tickInterval = useMemo(() => {
    if (totalDurationSec <= 0) return 5;
    const candidates = [1, 2, 5, 10, 15, 30, 60, 120];
    const targetTicks = 8;
    const ideal = totalDurationSec / targetTicks;
    let best = candidates[0];
    for (const c of candidates) {
      if (Math.abs(c - ideal) <= Math.abs(best - ideal)) best = c;
    }
    return best;
  }, [totalDurationSec]);

  const ticks = useMemo(() => {
    const out: number[] = [];
    for (let t = 0; t <= totalDurationSec; t += tickInterval) out.push(t);
    if (out[out.length - 1] !== totalDurationSec) out.push(totalDurationSec);
    return out;
  }, [totalDurationSec, tickInterval]);

  return (
    <div className="absolute bottom-[161px] left-0 right-0 h-[7px]" style={{ minWidth: '100%' }}>
      {ticks.map((t) => (
        <div
          key={t}
          className="absolute flex flex-col items-center font-['Inter:Regular',sans-serif] font-normal text-[#777] text-[11px] tracking-[0.11px]"
          style={{ left: timeToPixel(t) - 7 }}
        >
          <p className="leading-[normal] whitespace-nowrap">{formatRulerTime(t)}</p>
          <div className="mt-0.5 h-[5px] w-px bg-[#2C2C2C] rounded-full" />
        </div>
      ))}
    </div>
  );
}

function TimelineTick() {
  return (
    <div className="h-[7px] relative shrink-0 w-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7">
        <line stroke="#2C2C2C" strokeLinecap="round" strokeWidth="1.5" x1="7.75" x2="7.75" y1="0.75" y2="6.25" />
      </svg>
    </div>
  );
}

interface VideoClipProps {
  clipId: number;
  left: number;
  width: number;
  title: string;
  color: 'blue' | 'purple' | 'green' | 'orange' | 'teal';
  isNodeViewOpen?: boolean;
  reel?: number; // 0 = top track, 1 = middle track
}

function VideoClip({ clipId, left, width, title, color, isNodeViewOpen = false, reel = 0 }: VideoClipProps) {
  const colors = {
    blue: { bg: '#1c77e9', border: '#6298ec' },
    purple: { bg: '#564aac', border: '#9287e2' },
    green: { bg: '#2d8659', border: '#5fb885' },
    orange: { bg: '#d97706', border: '#fbbf24' },
    teal: { bg: '#0d9488', border: '#5eead4' },
  };

  const { bg, border } = colors[color];

  const bottom = reel === 1 ? 65 : 107;
  return (
    <>
      <div
        className="absolute h-[36px]"
        style={{
          left: `${left}px`,
          width: `${width}px`,
          bottom: `${bottom}px`,
        }}
      >
        <motion.div
          layoutId={`clip-${clipId}`}
          className="size-full"
          style={{ backgroundColor: bg }}
          transition={{ layout: { duration: isNodeViewOpen ? 1 : 0 } }}
        >
          <div className="content-stretch flex gap-[7px] items-center overflow-clip px-[9px] py-[3px] relative size-full">
            <div className="content-stretch flex flex-[1_0_0] gap-[5px] items-center min-h-px min-w-px relative">
              <div className="h-[14px] relative shrink-0 w-[18px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 14">
                  <path d={svgPaths.pf137a80} fill="#93BCFC" />
                  <path d={svgPaths.p251fcf80} fill="#93BCFC" />
                </svg>
              </div>
              <p className="flex-[1_0_0] font-['Inter:Medium',sans-serif] font-medium leading-[18px] min-h-px min-w-px not-italic opacity-80 overflow-hidden relative text-[14px] text-ellipsis text-white tracking-[-0.14px] whitespace-nowrap">
                {title}
              </p>
            </div>
          </div>
          <div className="absolute border border-solid inset-0 pointer-events-none" style={{ borderColor: border, borderWidth: '0.5px' }} />
        </motion.div>
      </div>
    </>
  );
}

/** Segment of a clip for cut transition (same look as VideoClip, fixed left/width) */
function VideoClipSegment({ left, width, title, color, reel }: { left: number; width: number; title: string; color: VideoClipProps['color']; reel: number }) {
  const colors = {
    blue: { bg: '#1c77e9', border: '#6298ec' },
    purple: { bg: '#564aac', border: '#9287e2' },
    green: { bg: '#2d8659', border: '#5fb885' },
    orange: { bg: '#d97706', border: '#fbbf24' },
    teal: { bg: '#0d9488', border: '#5eead4' },
  };
  const { bg, border } = colors[color];
  const bottom = reel === 1 ? 65 : 107;
  return (
    <div
      className="absolute h-[36px]"
      style={{ left: `${left}px`, width: `${width}px`, bottom: `${bottom}px` }}
    >
      <div className="size-full" style={{ backgroundColor: bg }}>
        <div className="content-stretch flex gap-[7px] items-center overflow-clip px-[9px] py-[3px] relative size-full">
          <div className="content-stretch flex flex-[1_0_0] gap-[5px] items-center min-h-px min-w-px relative">
            <div className="h-[14px] relative shrink-0 w-[18px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 14">
                <path d={svgPaths.pf137a80} fill="#93BCFC" />
                <path d={svgPaths.p251fcf80} fill="#93BCFC" />
              </svg>
            </div>
            <p className="flex-[1_0_0] font-['Inter:Medium',sans-serif] font-medium leading-[18px] min-h-px min-w-px not-italic opacity-80 overflow-hidden relative text-[14px] text-ellipsis text-white tracking-[-0.14px] whitespace-nowrap">
              {title}
            </p>
          </div>
        </div>
        <div className="absolute border border-solid inset-0 pointer-events-none" style={{ borderColor: border, borderWidth: '0.5px' }} />
      </div>
    </div>
  );
}

function Playhead({ position, ghost = false }: { position: number; ghost?: boolean }) {
  return (
    <div 
      className="absolute bottom-0 h-[184px] pointer-events-none" 
      style={{ 
        left: `${position}px`,
        opacity: ghost ? 0.3 : 1 
      }}
    >
      <div className="absolute h-[17px] left-0 top-0 w-[11px]">
        <div className="absolute inset-[0_-9.09%_-9.33%_-9.09%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 18.5857">
            <g filter={ghost ? undefined : "url(#filter0_d_playhead)"}>
              <path d={svgPaths.pd0d8980} fill="#FAFAFA" />
            </g>
            {!ghost && (
              <defs>
                <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="18.5857" id="filter0_d_playhead" width="13" x="0" y="0">
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                  <feOffset dy="1" />
                  <feGaussianBlur stdDeviation="0.5" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                  <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow" />
                  <feBlend in="SourceGraphic" in2="effect1_dropShadow" mode="normal" result="shape" />
                </filter>
              </defs>
            )}
          </svg>
        </div>
      </div>
      <div className="absolute flex h-[168px] items-center justify-center left-[5px] top-[16px] w-0">
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[168px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 168 1">
                <line stroke="#FCFCFC" x2="168" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Dashed cut line (no head) for cut boundaries – spans all tracks. */
function DashedGhostPlayhead({ position }: { position: number }) {
  return (
    <div
      className="absolute bottom-0 h-[184px] w-0 flex items-center justify-center pointer-events-none z-10"
      style={{ left: `${position}px`, opacity: 0.3 }}
    >
      <div className="flex-none rotate-90 w-[184px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 184 1">
          <line stroke="#FCFCFC" strokeDasharray="4 4" x2="184" y1="0.5" y2="0.5" />
        </svg>
      </div>
    </div>
  );
}

function JumpCutIndicator({ position, scrollLeft, viewportWidth, showCutPhase, onTabAction }: { position: number; scrollLeft: number; viewportWidth: number; showCutPhase: boolean; onTabAction: () => void }) {
  // Determine if the cut position is out of view
  const isOffscreenRight = position > scrollLeft + viewportWidth - 200;
  const isOffscreenLeft = position < scrollLeft + 100;
  
  const text = showCutPhase ? 'to cut' : 'to jump';
  
  // Calculate the actual display position (relative to timeline, not viewport)
  let displayPosition: number;
  
  const isOnScreen = !isOffscreenRight && !isOffscreenLeft;
  if (isOffscreenRight) {
    displayPosition = scrollLeft + viewportWidth - 170;
  } else if (isOffscreenLeft) {
    displayPosition = scrollLeft + 20;
  } else {
    displayPosition = position; // center of pill will be at position via translateX(-50%)
  }
  
  return (
    <div 
      className="absolute bottom-[158px] h-[28px] flex items-center justify-center pointer-events-auto z-30 cursor-pointer hover:opacity-90 transition-opacity"
      style={{ 
        left: `${displayPosition}px`,
        width: showCutPhase ? 'auto' : '140px',
        ...(isOnScreen ? { transform: 'translateX(-50%)' } : {})
      }}
      onClick={onTabAction}
    >
      {/* Indicator box */}
      <div className="bg-[#323436] content-stretch flex gap-[6px] items-center overflow-clip pl-[6px] py-[3px] relative rounded-[4px] h-full" style={{ paddingRight: showCutPhase ? '6px' : '12px' }}>
        {/* TAB key background */}
        <div className="relative bg-[#1f1f1f] h-[21px] rounded-[4px] w-[29px] flex items-center justify-center">
          <div aria-hidden="true" className="absolute border border-[#353535] border-solid inset-[-0.5px] pointer-events-none rounded-[4.5px]" />
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic opacity-80 relative text-[12px] text-white tracking-[-0.24px]">TAB</p>
        </div>
        
        {/* Text */}
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic opacity-80 overflow-hidden relative shrink-0 text-[12px] text-ellipsis text-white whitespace-nowrap">{text}</p>
        
        {/* Blue vertical bar on the right - only show when in "to jump" mode */}
        {!showCutPhase && (
          <div className="absolute bottom-[3px] flex items-center justify-center right-[6px] top-[3px] w-0">
            <div className="flex-none h-px rotate-90 w-[22px]">
              <div className="relative size-full">
                <div className="absolute inset-[-3px_0_0_0]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 3">
                    <line stroke="#639BEC" strokeLinecap="round" strokeWidth="3" x1="1.5" x2="20.5" y1="1.5" y2="1.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Script/Dialogue Track ---

interface ClipWithLayout {
  id: number;
  title: string;
  color: string;
  originalWidth: number;
  transcript: string;
  left: number;
  width: number;
  isCut: boolean;
}

interface CutPreview {
  showEndCutPreview: boolean;
  endCutPosition?: number;
  showStartCutPreview: boolean;
  startCutPosition?: number;
}

function ScriptTrack({ clips, hoveredPosition, cutPreviews, cutHighlightPositions, cutTransition }: { clips: ClipWithLayout[]; hoveredPosition: number | null; cutPreviews: CutPreview[]; cutHighlightPositions: { left: number; right: number } | null; cutTransition: { left: number; right: number; clipIndex: number; phase: string } | null }) {
  return (
    <>
      {/* Track background */}
      <div className="absolute bg-[#1c1c20] bottom-[23px] h-[36px] left-[16px] right-[16px]">
        <div className="absolute border border-[#2a2a2e] border-solid inset-[-0.5px] pointer-events-none" />
      </div>

      {/* Transcript segments – hide the two affected when cut transition shows split script blocks instead */}
      {clips.map((clip, index) => {
        if (cutTransition && (index === cutTransition.clipIndex || index === cutTransition.clipIndex + 1)) return null;
        const segmentLeft = clip.left;
        const segmentRight = clip.left + clip.width;
        const highlightPosition =
          hoveredPosition !== null && hoveredPosition >= segmentLeft && hoveredPosition < segmentRight
            ? hoveredPosition
            : cutHighlightPositions && cutHighlightPositions.left >= segmentLeft && cutHighlightPositions.left < segmentRight
              ? cutHighlightPositions.left
              : cutHighlightPositions && cutHighlightPositions.right >= segmentLeft && cutHighlightPositions.right < segmentRight
                ? cutHighlightPositions.right
                : null;
        return (
          <ScriptSegment
            key={clip.id}
            left={segmentLeft}
            width={clip.width}
            text={clip.transcript}
            highlightPosition={highlightPosition}
            showEndCutPreview={cutPreviews[index]?.showEndCutPreview}
            endCutPosition={cutPreviews[index]?.endCutPosition}
            showStartCutPreview={cutPreviews[index]?.showStartCutPreview}
            startCutPosition={cutPreviews[index]?.startCutPosition}
          />
        );
      })}
    </>
  );
}

/** Grey block for script track during cut transition (same styling as script segment, no text). */
function ScriptTrackSegmentBlock({ left, width }: { left: number; width: number }) {
  return (
    <div
      className="absolute overflow-hidden rounded border border-[#353535] bg-[#2a2a2e]"
      style={{ left: `${left}px`, width: `${width}px`, bottom: '24px', height: '34px' }}
    />
  );
}

function ScriptSegment({ left, width, text, highlightPosition, showEndCutPreview, endCutPosition, showStartCutPreview, startCutPosition }: { left: number; width: number; text: string; highlightPosition: number | null; showEndCutPreview?: boolean; endCutPosition?: number; showStartCutPreview?: boolean; startCutPosition?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wordEls = useRef<Map<number, HTMLSpanElement>>(new Map());
  const [containerWidth, setContainerWidth] = useState(0);

  const words = useMemo(() => text.split(' '), [text]);

  const totalChars = text.length;
  const wordPositions = useMemo(() => {
    let charOffset = 0;
    return words.map((word) => {
      const wordStart = charOffset;
      const wordEnd = charOffset + word.length;
      charOffset = wordEnd + 1;
      return {
        fracStart: wordStart / totalChars,
        fracEnd: wordEnd / totalChars,
        fracMid: (wordStart + wordEnd) / 2 / totalChars,
      };
    });
  }, [words, totalChars]);

  const isHighlighted = highlightPosition !== null && highlightPosition >= left && highlightPosition < left + width;

  const highlightedWordIndex = useMemo(() => {
    if (!isHighlighted || highlightPosition === null) return -1;
    const frac = (highlightPosition - left) / width;
    let closest = 0;
    let closestDist = Infinity;
    for (let i = 0; i < wordPositions.length; i++) {
      const dist = Math.abs(frac - wordPositions[i].fracMid);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    }
    return closest;
  }, [isHighlighted, highlightPosition, left, width, wordPositions]);

  // Measure container width
  useLayoutEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }
  }, [width]);

  // Position highlighted word to the right of the playhead/cut line, or to the left when too close to the right edge
  const contentPadding = 8; // px-2 on the inner div
  const gap = 6;
  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    const containerEl = containerRef.current;
    if (!scrollEl || !containerEl || highlightedWordIndex < 0 || highlightPosition === null) {
      if (scrollEl) scrollEl.style.transform = 'translateX(0)';
      return;
    }

    const available = containerEl.clientWidth - contentPadding * 2;
    const contentWidth = scrollEl.scrollWidth;

    const wordEl = wordEls.current.get(highlightedWordIndex);
    if (!wordEl) return;

    const playheadInContent = highlightPosition - left - contentPadding;
    const wordWidth = wordEl.offsetWidth;
    const spaceToRightOfLine = width - (highlightPosition - left);

    const putWordOnLeft = spaceToRightOfLine < wordWidth + gap;
    const targetWordLeft = putWordOnLeft
      ? playheadInContent - gap - wordWidth
      : playheadInContent + gap;

    let target: number;
    if (contentWidth <= available) {
      target = 0;
    } else {
      target = targetWordLeft - wordEl.offsetLeft;
      const minTranslate = -(contentWidth - available);
      target = Math.max(minTranslate, Math.min(0, target));
    }

    scrollEl.style.transform = `translateX(${target}px)`;
  }, [highlightedWordIndex, highlightPosition, left, width]);

  // Center-ellipsis text for non-hovered state
  const centerEllipsisText = useMemo(() => {
    if (containerWidth <= 0) return text;

    const charWidth = 6.2;
    const padding = 16;
    const availableWidth = containerWidth - padding;
    const maxChars = Math.floor(availableWidth / charWidth);

    if (maxChars >= text.length) return text;
    if (maxChars <= 5) return text.substring(0, Math.max(2, maxChars - 1)) + '\u2026';

    const frontChars = Math.ceil((maxChars - 1) / 2);
    const backChars = Math.floor((maxChars - 1) / 2);
    return text.substring(0, frontChars) + '\u2026' + text.substring(text.length - backChars);
  }, [text, containerWidth]);

  const showWords = isHighlighted && highlightedWordIndex >= 0;

  return (
    <div
      ref={containerRef}
      className="absolute bottom-[24px] h-[34px] overflow-hidden rounded border border-[#353535] bg-[#2a2a2e]"
      style={{ left: `${left}px`, width: `${width}px` }}
    >
      {/* Cut preview: dotted line and ghosted section (script track = video clips) */}
      {showEndCutPreview && endCutPosition != null && (
        <>
          <div
            className="absolute bottom-0 top-0 w-[2px] pointer-events-none"
            style={{
              left: `${endCutPosition}px`,
              background: 'repeating-linear-gradient(to bottom, #fff 0px, #fff 4px, transparent 4px, transparent 8px)'
            }}
          />
          <div
            className="absolute bottom-0 top-0 bg-black/40 pointer-events-none"
            style={{ left: `${endCutPosition}px`, right: 0 }}
          />
        </>
      )}
      {showStartCutPreview && startCutPosition != null && (
        <>
          <div
            className="absolute bottom-0 top-0 w-[2px] pointer-events-none"
            style={{
              left: `${startCutPosition}px`,
              background: 'repeating-linear-gradient(to bottom, #fff 0px, #fff 4px, transparent 4px, transparent 8px)'
            }}
          />
          <div
            className="absolute bottom-0 top-0 bg-black/40 pointer-events-none"
            style={{ left: 0, width: `${startCutPosition}px` }}
          />
        </>
      )}
      <div className="flex items-center h-full px-2 overflow-hidden rounded-[inherit]">
        {showWords ? (
          <div
            ref={scrollRef}
            className="flex items-center gap-[0.35em] whitespace-nowrap"
            style={{ transition: 'transform 120ms ease-out' }}
          >
            {words.map((word, i) => {
              const isWordHighlighted = i === highlightedWordIndex;
              const setRef = (el: HTMLSpanElement | null) => {
                if (el) wordEls.current.set(i, el);
                else wordEls.current.delete(i);
              };
              const wordContent = (
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    color: isWordHighlighted ? '#fff' : '#888',
                    fontWeight: isWordHighlighted ? 500 : 400,
                    transition: 'color 100ms',
                  }}
                >
                  {word}
                </span>
              );
              return isWordHighlighted ? (
                <span
                  key={i}
                  ref={setRef}
                  className="rounded px-1.5 py-0.5 border transition-colors"
                  style={{
                    backgroundColor: '#1f1f1f',
                    borderColor: '#353535',
                  }}
                >
                  {wordContent}
                </span>
              ) : (
                <span key={i} ref={setRef}>
                  {wordContent}
                </span>
              );
            })}
          </div>
        ) : (
          <p
            className="whitespace-nowrap overflow-hidden w-full"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              color: '#999',
            }}
          >
            {centerEllipsisText}
          </p>
        )}
      </div>
    </div>
  );
}