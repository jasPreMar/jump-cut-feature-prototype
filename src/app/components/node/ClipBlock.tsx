import { useState, useRef, useEffect, useMemo, useLayoutEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Film } from "lucide-react";
import { cn } from "@/app/components/ui/utils";

interface ClipBlockProps {
  clipId: number;
  title: string;
  color?: "blue" | "purple" | "green" | "orange" | "teal";
  videoSrc: string;
  trimStart: number;
  trimEnd: number;
  /** Seconds within the clip segment to show (0 = first frame). */
  previewTime: number;
  onHover?: (hovered: boolean) => void;
  onHoverMove?: (fraction: number) => void;
  onSeekAndPlay?: () => void;
  isHovered?: boolean;
  /** This clip is the one currently at the main playhead. */
  isActiveClip?: boolean;
  /** Time (sec) within this clip segment for the main playhead marker. */
  activePlayheadTimeInClip?: number;
  /** Time (sec) within this clip segment for the ghost playhead when hovering. */
  hoverPreviewTimeInClip?: number;
  layoutId?: string;
  transcript?: string;
  titleOverlay?: string;
}

export function ClipBlock({
  title,
  color,
  videoSrc,
  trimStart,
  trimEnd,
  previewTime,
  onHover,
  onHoverMove,
  onSeekAndPlay,
  isHovered = false,
  isActiveClip = false,
  activePlayheadTimeInClip,
  hoverPreviewTimeInClip,
  layoutId,
  transcript,
  titleOverlay,
}: ClipBlockProps) {
  const [localHovered, setLocalHovered] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const wordEls = useRef<Map<number, HTMLSpanElement>>(new Map());
  const hovered = isHovered || localHovered;

  const segmentDuration = Math.max(0, trimEnd - trimStart);
  const currentTime = segmentDuration > 0 ? trimStart + Math.min(previewTime, segmentDuration) : trimStart;

  const playheadLeftPercent =
    segmentDuration > 0 && isActiveClip && activePlayheadTimeInClip != null
      ? Math.min(100, Math.max(0, (activePlayheadTimeInClip / segmentDuration) * 100))
      : null;
  const ghostLeftPercent =
    segmentDuration > 0 && hovered && hoverPreviewTimeInClip != null
      ? Math.min(100, Math.max(0, (hoverPreviewTimeInClip / segmentDuration) * 100))
      : null;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.readyState >= 2) video.currentTime = currentTime;
  }, [currentTime]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = previewRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onHoverMove?.(fraction);
  };

  const handleClick = () => {
    onSeekAndPlay?.();
  };

  // Word-highlighting logic
  const words = useMemo(() => transcript?.split(" ") ?? [], [transcript]);
  const wordPositions = useMemo(() => {
    if (!transcript) return [];
    const totalChars = transcript.length;
    let charOffset = 0;
    return words.map((word) => {
      const wordStart = charOffset;
      const wordEnd = charOffset + word.length;
      charOffset = wordEnd + 1;
      return { fracMid: (wordStart + wordEnd) / 2 / totalChars };
    });
  }, [words, transcript]);

  const scrubFraction =
    segmentDuration > 0 && hoverPreviewTimeInClip != null
      ? hoverPreviewTimeInClip / segmentDuration
      : -1;

  const highlightedWordIndex = useMemo(() => {
    if (scrubFraction < 0 || wordPositions.length === 0) return -1;
    let closest = 0;
    let closestDist = Infinity;
    for (let i = 0; i < wordPositions.length; i++) {
      const dist = Math.abs(scrubFraction - wordPositions[i].fracMid);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    }
    return closest;
  }, [scrubFraction, wordPositions]);

  const setWordRef = useCallback(
    (index: number) => (el: HTMLSpanElement | null) => {
      if (el) wordEls.current.set(index, el);
      else wordEls.current.delete(index);
    },
    []
  );

  // Scroll to keep highlighted word centered
  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    const stripEl = stripRef.current;
    if (!scrollEl || !stripEl || highlightedWordIndex < 0) {
      if (scrollEl) scrollEl.style.transform = "translateX(0)";
      return;
    }
    const available = stripEl.clientWidth;
    const contentWidth = scrollEl.scrollWidth;
    const wordEl = wordEls.current.get(highlightedWordIndex);
    if (!wordEl) return;

    const wordCenter = wordEl.offsetLeft + wordEl.offsetWidth / 2;
    let target = available / 2 - wordCenter;
    if (contentWidth <= available) {
      target = 0;
    } else {
      const minTranslate = -(contentWidth - available);
      target = Math.max(minTranslate, Math.min(0, target));
    }
    scrollEl.style.transform = `translateX(${target}px)`;
  }, [highlightedWordIndex]);

  const hasTranscript = transcript && words.length > 0;

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

      {/* 16:9 Preview: video frame, hover = scrub, click = seek & play */}
      <div
        ref={previewRef}
        className="mx-3 mb-2 rounded-lg overflow-hidden aspect-video bg-[#111] relative cursor-pointer"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-cover pointer-events-none"
          muted
          playsInline
          preload="metadata"
          onLoadedData={() => {
            const v = videoRef.current;
            if (v && v.readyState >= 2) v.currentTime = currentTime;
          }}
        />
        {hovered && (
          <div className="absolute inset-0 pointer-events-none border-2 border-white/50 rounded-lg" />
        )}
        {/* Ghost playhead: faint line following cursor when hovering */}
        {ghostLeftPercent != null && (
          <div
            className="absolute inset-y-0 w-0.5 bg-white/40 pointer-events-none z-10"
            style={{ left: `${ghostLeftPercent}%`, transform: "translateX(-50%)" }}
          />
        )}
        {/* Playhead: solid marker on the clip that is currently playing */}
        {playheadLeftPercent != null && (
          <div
            className="absolute inset-y-0 w-0.5 bg-white pointer-events-none z-20 shadow-[0_0_6px_rgba(255,255,255,0.8)]"
            style={{ left: `${playheadLeftPercent}%`, transform: "translateX(-50%)" }}
          />
        )}
        {/* Title overlay — lower-third card */}
        {titleOverlay && (
          <div className="absolute bottom-3 left-3 max-w-[75%] pointer-events-none z-10">
            <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <span className="text-[14px] font-semibold text-white leading-tight">
                {titleOverlay}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Word-highlighting script strip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {hasTranscript ? (
              <div
                ref={stripRef}
                className="mx-3 mb-3 mt-1 h-[34px] overflow-hidden rounded border border-[#353535] bg-[#2a2a2e] flex items-center px-2"
              >
                <div
                  ref={scrollRef}
                  className="flex items-center gap-[0.35em] whitespace-nowrap"
                  style={{ transition: "transform 120ms ease-out" }}
                >
                  {words.map((word, i) => {
                    const isActive = i === highlightedWordIndex;
                    const content = (
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "13px",
                          color: isActive ? "#fff" : "#888",
                          fontWeight: isActive ? 500 : 400,
                          transition: "color 100ms",
                        }}
                      >
                        {word}
                      </span>
                    );
                    return isActive ? (
                      <span
                        key={i}
                        ref={setWordRef(i)}
                        className="rounded px-1.5 py-0.5 border transition-colors"
                        style={{ backgroundColor: "#1f1f1f", borderColor: "#353535" }}
                      >
                        {content}
                      </span>
                    ) : (
                      <span key={i} ref={setWordRef(i)}>
                        {content}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="px-4 pb-3 pt-1">
                <p className="text-[11px] text-white/30 mb-1">Source clip</p>
                <p className="text-[12px] text-white/50 italic">
                  Hover to scrub · Click to play from here
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
