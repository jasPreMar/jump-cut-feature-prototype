import { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from 'react';
import { motion } from 'motion/react';
import svgPaths from "@/imports/svg-mbvhuxpq3m";
import scissorsSvgPaths from "@/imports/svg-6x4m2z1e2j";

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
}

export function JumpCutTimeline({ onCutsChange, durations, clipTrimStart, clipTrimEnd, onTrimChange, playheadTime, onPlayheadTimeChange, isNodeViewOpen = false }: JumpCutTimelineProps) {
  const [currentCutIndex, setCurrentCutIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [completedCuts, setCompletedCuts] = useState<number[]>([]);
  const [customCutPositions, setCustomCutPositions] = useState<Record<number, number>>({});
  const [clipStartPositions, setClipStartPositions] = useState<Record<number, number>>({});
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null);
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

  // Define clips with base configuration (originalWidth kept for jump-cut proportions)
  const baseClips: Clip[] = [
    { id: 0, title: "Introducing Log Explorer", color: "blue", originalWidth: 210, transcript: "Log explorer lets you query logs, traces and sessions from all your apps in one place. You can search by any attribute, filter by severity level, and correlate logs with traces to debug issues faster than ever before." },
    { id: 1, title: "Google Chrome Log Explorer Demo", color: "purple", originalWidth: 550, transcript: "Let's take a look at how this works in Google Chrome. First, we'll open the Log Explorer and search for shopping cart events." },
    { id: 2, title: "Analytics Dashboard", color: "green", originalWidth: 700, transcript: "Then we can switch to the analytics dashboard to see the heatmap visualizations and explore the data patterns across our entire monitoring infrastructure." },
    { id: 3, title: "User Engagement Metrics", color: "orange", originalWidth: 500, transcript: "Here we can see the full user engagement metrics, results across the totality of data streams and monitoring endpoints across all platforms." },
    { id: 4, title: "Summary & Next Steps", color: "teal", originalWidth: 450, transcript: "We can explore the data patterns across our entire monitoring infrastructure and plan next steps for your team." },
  ];

  const jumpCuts: JumpCut[] = [
    { id: 1, clipIndex: 0, endCutPosition: 190, nextClipStartPosition: 120 },
    { id: 2, clipIndex: 1, endCutPosition: 320, nextClipStartPosition: 150 },
    { id: 3, clipIndex: 2, endCutPosition: 250, nextClipStartPosition: 180 },
  ];

  // Full durations (for converting cut positions to seconds)
  const fullDurations = useMemo(() => {
    const d = durations.length === 5 ? durations : [1, 1, 1, 1, 1];
    if (d.every((x) => x <= 0)) return [1, 1, 1, 1, 1];
    return d.map((x) => (x > 0 ? x : 1));
  }, [durations]);

  // Trimmed durations for layout (actual in/out points)
  const effectiveDurations = useMemo(() => {
    const trimsOk = clipTrimStart.length === 5 && clipTrimEnd.length === 5;
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
    const widthAtZoom1 = 2 * MARGIN + totalDurationSec * BASE_PIXELS_PER_SECOND + 4 * GAP;
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
    for (let i = 0; i < 5; i++) s.push(s[i] + effectiveDurations[i]);
    return s;
  }, [effectiveDurations]);

  const timeToPixel = useCallback((t: number) => {
    for (let i = 0; i < 5; i++) {
      const start = startTimesSec[i];
      const end = startTimesSec[i + 1];
      const dur = effectiveDurations[i];
      if (t >= start && t < end && dur > 0) {
        const clip = clips[i];
        const frac = (t - start) / dur;
        return (clip as { left: number; fullWidth?: number }).left + frac * ((clip as { fullWidth?: number }).fullWidth ?? clip.width);
      }
    }
    return clips[4] ? (clips[4] as { left: number; fullWidth?: number }).left + ((clips[4] as { fullWidth?: number }).fullWidth ?? clips[4].width) : MARGIN;
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

  const isComplete = currentCutIndex >= jumpCuts.length;
  const currentCut = jumpCuts[currentCutIndex];

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
    
    if (!showPreview) {
      // First Tab: Jump to the cut and show preview
      setShowPreview(true);
      
      // Scroll to the cut position
      if (scrollContainerRef.current && currentCutPosition) {
        const scrollPosition = currentCutPosition - 400;
        scrollContainerRef.current.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });
      }
    } else {
      // Second Tab: Make the cut (apply trim so playback actually cuts)
      const ci = currentCut.clipIndex;
      const nextIdx = ci + 1;
      const endSec = (currentCut.endCutPosition / baseClips[ci].originalWidth) * fullDurations[ci];
      const nextStartSec = nextIdx < baseClips.length
        ? (currentCut.nextClipStartPosition / baseClips[nextIdx].originalWidth) * fullDurations[nextIdx]
        : 0;
      const newTrimStart = [...clipTrimStart];
      const newTrimEnd = [...clipTrimEnd];
      newTrimEnd[ci] = endSec;
      if (nextIdx < 5) newTrimStart[nextIdx] = nextStartSec;

      const newCompletedCuts = [...completedCuts, ci];
      const newCurrentCutIndex = currentCutIndex + 1;
      const newClipStartPositions = { ...clipStartPositions };
      if (nextIdx < baseClips.length) {
        newClipStartPositions[nextIdx] = currentCut.nextClipStartPosition / baseClips[nextIdx].originalWidth;
      }

      // Push state BEFORE cut so undo restores it
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
    }
  };

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
  }, [currentCutIndex, showPreview, completedCuts, currentCut, isComplete, currentCutPosition, history, historyIndex, hoveredPosition, clips, playheadPosition]);

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
      <div className="relative h-full" style={{ minWidth: totalWidthPx }} ref={timelineRef}>
        {/* Timeline rulers – actual time */}
        <TimelineRulers totalDurationSec={totalDurationSec} timeToPixel={timeToPixel} />
        
        {/* Track backgrounds */}
        <div className="absolute bg-[#201f22] border border-[#282829] border-solid bottom-[22px] h-[36px] left-[16px] right-[16px]" />
        <div className="absolute bg-[#201f22] border border-[#282829] border-solid bottom-[107px] h-[36px] left-[16px] right-[16px]" />
        <div className="absolute bg-[#201f22] border border-[#282829] border-solid bottom-[65px] h-[36px] left-[16px] right-[16px]" />
        
        {/* Video clips: 1st, 3rd, 5th on top reel; 2nd, 4th on middle reel */}
        {clips.map((clip, index) => {
          const isCurrentCutClip = showPreview && currentCut?.clipIndex === index;
          const isNextCutClip = showPreview && currentCut?.clipIndex === index - 1;
          const reel = index % 2;
          const fullW = (clip as { fullWidth?: number }).fullWidth ?? clip.width;
          const endCutPx = isCurrentCutClip ? (currentCut.endCutPosition / baseClips[index].originalWidth) * fullW : undefined;
          const startCutPx = isNextCutClip ? (currentCut.nextClipStartPosition / baseClips[index].originalWidth) * fullW : undefined;
          return (
            <VideoClip
              key={clip.id}
              clipId={clip.id}
              left={clip.left}
              width={clip.width}
              title={clip.title}
              color={clip.color}
              showEndCutPreview={isCurrentCutClip}
              endCutPosition={endCutPx}
              showStartCutPreview={isNextCutClip}
              startCutPosition={startCutPx}
              isNodeViewOpen={isNodeViewOpen}
              reel={reel}
            />
          );
        })}
        
        {/* Script/dialogue track */}
        <ScriptTrack clips={clips} hoveredPosition={hoveredPosition} />
        
        {/* Playhead */}
        <Playhead position={playheadPosition} />
        
        {/* Hover ghost playhead */}
        {hoveredPosition !== null && (
          <Playhead position={hoveredPosition} ghost />
        )}
        
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
            if (hoveredPosition !== null) onPlayheadTimeChange(pixelToTime(hoveredPosition));
          }}
        />
      </div>
      
      {/* Jump cut indicator - fixed position when out of view */}
      {!isComplete && currentCutPosition && scrollContainerRef.current && (
        <JumpCutIndicator 
          position={currentCutPosition}
          scrollLeft={scrollLeft}
          viewportWidth={scrollContainerRef.current.clientWidth}
          showPreview={showPreview}
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
  showEndCutPreview?: boolean;
  endCutPosition?: number;
  showStartCutPreview?: boolean;
  startCutPosition?: number;
  isNodeViewOpen?: boolean;
  reel?: number; // 0 = top track, 1 = middle track
}

function VideoClip({ clipId, left, width, title, color, showEndCutPreview, endCutPosition, showStartCutPreview, startCutPosition, isNodeViewOpen = false, reel = 0 }: VideoClipProps) {
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

          {/* Preview: Dashed line and ghosted cut-off section */}
          {showEndCutPreview && endCutPosition && (
            <>
              {/* Dashed cut line */}
              <div
                className="absolute bottom-0 top-0 w-[2px]"
                style={{
                  left: `${endCutPosition}px`,
                  background: 'repeating-linear-gradient(to bottom, #fff 0px, #fff 4px, transparent 4px, transparent 8px)'
                }}
              />
              {/* Ghosted section to be cut */}
              <div
                className="absolute bottom-0 top-0 bg-black/40"
                style={{
                  left: `${endCutPosition}px`,
                  right: 0
                }}
              />
            </>
          )}
          {showStartCutPreview && startCutPosition && (
            <>
              {/* Dashed cut line */}
              <div
                className="absolute bottom-0 top-0 w-[2px]"
                style={{
                  left: `${startCutPosition}px`,
                  background: 'repeating-linear-gradient(to bottom, #fff 0px, #fff 4px, transparent 4px, transparent 8px)'
                }}
              />
              {/* Ghosted section to be cut */}
              <div
                className="absolute bottom-0 top-0 bg-black/40"
                style={{
                  left: 0,
                  width: `${startCutPosition}px`
                }}
              />
            </>
          )}
        </motion.div>
      </div>
    </>
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

function JumpCutIndicator({ position, scrollLeft, viewportWidth, showPreview, onTabAction }: { position: number; scrollLeft: number; viewportWidth: number; showPreview: boolean; onTabAction: () => void }) {
  // Determine if the cut position is out of view
  const isOffscreenRight = position > scrollLeft + viewportWidth - 200;
  const isOffscreenLeft = position < scrollLeft + 100;
  
  const text = showPreview ? 'to cut' : 'to jump cut';
  
  // Calculate the actual display position (relative to timeline, not viewport)
  let displayPosition: number;
  
  if (isOffscreenRight) {
    // Position at right edge of visible area (leave more margin)
    displayPosition = scrollLeft + viewportWidth - 170;
  } else if (isOffscreenLeft) {
    // Position at left edge of visible area
    displayPosition = scrollLeft + 20;
  } else {
    // Normal position - centered at the actual cut location
    // For "to cut" state, adjust for smaller width (~55px half)
    // For "to jump cut" state, adjust for larger width (~70px half)
    displayPosition = position - (showPreview ? 55 : 70);
  }
  
  return (
    <div 
      className="absolute bottom-[110px] h-[28px] flex items-center justify-center pointer-events-auto z-30 cursor-pointer hover:opacity-90 transition-opacity"
      style={{ 
        left: `${displayPosition}px`,
        animation: 'bounce-horizontal 2s ease-in-out infinite',
        width: showPreview ? 'auto' : '140px'
      }}
      onClick={onTabAction}
    >
      {/* Indicator box - based on Figma design */}
      <div className="bg-[#323436] content-stretch flex gap-[6px] items-center overflow-clip pl-[6px] py-[3px] relative rounded-[4px] h-full" style={{ paddingRight: showPreview ? '6px' : '12px' }}>
        {/* TAB key background */}
        <div className="relative bg-[#1f1f1f] h-[21px] rounded-[4px] w-[29px] flex items-center justify-center">
          <div aria-hidden="true" className="absolute border border-[#353535] border-solid inset-[-0.5px] pointer-events-none rounded-[4.5px]" />
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic opacity-80 relative text-[12px] text-white tracking-[-0.24px]">TAB</p>
        </div>
        
        {/* Text */}
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic opacity-80 overflow-hidden relative shrink-0 text-[12px] text-ellipsis text-white whitespace-nowrap">{text}</p>
        
        {/* Scissors icon */}
        <div className="relative shrink-0 size-[12px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
            <path d={scissorsSvgPaths.p127a4d00} stroke="#639BEC" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4.06 4.06L6 6" stroke="#639BEC" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 2L4.06 7.94" stroke="#639BEC" strokeLinecap="round" strokeLinejoin="round" />
            <path d={scissorsSvgPaths.p3fc39080} stroke="#639BEC" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7.4 7.4L10 10" stroke="#639BEC" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        
        {/* Blue vertical bar on the right - only show when NOT in preview mode */}
        {!showPreview && (
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
      
      <style>{`
        @keyframes bounce-horizontal {
          0%, 100% {
            transform: translateX(0px);
          }
          50% {
            transform: translateX(4px);
          }
        }
      `}</style>
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

function ScriptTrack({ clips, hoveredPosition }: { clips: ClipWithLayout[]; hoveredPosition: number | null }) {
  return (
    <>
      {/* Track background */}
      <div className="absolute bg-[#1c1c20] bottom-[23px] h-[36px] left-[16px] right-[16px]">
        <div className="absolute border border-[#2a2a2e] border-solid inset-[-0.5px] pointer-events-none" />
      </div>

      {/* Transcript segments per clip */}
      {clips.map((clip) => (
        <ScriptSegment
          key={clip.id}
          left={clip.left}
          width={clip.width}
          text={clip.transcript}
          hoveredPosition={hoveredPosition}
        />
      ))}
    </>
  );
}

function ScriptSegment({ left, width, text, hoveredPosition }: { left: number; width: number; text: string; hoveredPosition: number | null }) {
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

  const isHovered = hoveredPosition !== null && hoveredPosition >= left && hoveredPosition < left + width;

  const hoveredWordIndex = useMemo(() => {
    if (!isHovered || hoveredPosition === null) return -1;
    const frac = (hoveredPosition - left) / width;
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
  }, [isHovered, hoveredPosition, left, width, wordPositions]);

  // Measure container width
  useLayoutEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }
  }, [width]);

  // Position highlighted word just to the right of the ghost playhead
  const contentPadding = 8; // px-2 on the inner div
  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    const containerEl = containerRef.current;
    if (!scrollEl || !containerEl || hoveredWordIndex < 0 || hoveredPosition === null) {
      if (scrollEl) scrollEl.style.transform = 'translateX(0)';
      return;
    }

    const available = containerEl.clientWidth - contentPadding * 2;
    const contentWidth = scrollEl.scrollWidth;

    // If all words fit, position word to the right of playhead (no scroll)
    const wordEl = wordEls.current.get(hoveredWordIndex);
    if (!wordEl) return;

    // Ghost playhead position in segment-local coords; content area starts at contentPadding
    const playheadInContent = hoveredPosition - left - contentPadding;
    const gap = 6; // space between playhead and highlighted word
    const targetWordLeft = playheadInContent + gap;

    let target: number;
    if (contentWidth <= available) {
      target = 0;
    } else {
      // translateX so the word's left edge is at targetWordLeft in the visible area
      target = targetWordLeft - wordEl.offsetLeft;
      const minTranslate = -(contentWidth - available);
      target = Math.max(minTranslate, Math.min(0, target));
    }

    scrollEl.style.transform = `translateX(${target}px)`;
  }, [hoveredWordIndex, hoveredPosition, left]);

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

  const showWords = isHovered && hoveredWordIndex >= 0;

  return (
    <div
      ref={containerRef}
      className="absolute bottom-[24px] h-[34px] overflow-hidden rounded border border-[#353535] bg-[#2a2a2e]"
      style={{ left: `${left}px`, width: `${width}px` }}
    >
      <div className="flex items-center h-full px-2 overflow-hidden rounded-[inherit]">
        {showWords ? (
          <div
            ref={scrollRef}
            className="flex items-center gap-[0.35em] whitespace-nowrap"
            style={{ transition: 'transform 120ms ease-out' }}
          >
            {words.map((word, i) => {
              const isHighlighted = i === hoveredWordIndex;
              const setRef = (el: HTMLSpanElement | null) => {
                if (el) wordEls.current.set(i, el);
                else wordEls.current.delete(i);
              };
              const wordContent = (
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    color: isHighlighted ? '#fff' : '#888',
                    fontWeight: isHighlighted ? 500 : 400,
                    transition: 'color 100ms',
                  }}
                >
                  {word}
                </span>
              );
              return isHighlighted ? (
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