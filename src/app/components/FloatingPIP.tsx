import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import { motion, useSpring } from "motion/react";
import { Play, Pause } from "lucide-react";
import { VIDEO_SOURCES } from "@/app/constants/videos";

const MARGIN = 16;
const DEFAULT_WIDTH = 480;
const MIN_WIDTH = 160;
const MAX_WIDTH = 480;
const ASPECT_RATIO = 16 / 9;
const SPRING_CONFIG = { stiffness: 300, damping: 25 };
const VELOCITY_PROJECTION = 0.2;

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

function getCornerPosition(
  corner: Corner,
  containerW: number,
  containerH: number,
  pipW: number,
  pipH: number
) {
  switch (corner) {
    case "top-left":
      return { x: MARGIN, y: MARGIN };
    case "top-right":
      return { x: containerW - pipW - MARGIN, y: MARGIN };
    case "bottom-left":
      return { x: MARGIN, y: containerH - pipH - MARGIN };
    case "bottom-right":
      return { x: containerW - pipW - MARGIN, y: containerH - pipH - MARGIN };
  }
}

function nearestCorner(
  x: number,
  y: number,
  containerW: number,
  containerH: number,
  pipW: number,
  pipH: number
): Corner {
  const corners: Corner[] = ["top-left", "top-right", "bottom-left", "bottom-right"];
  let best: Corner = "bottom-right";
  let bestDist = Infinity;

  for (const corner of corners) {
    const pos = getCornerPosition(corner, containerW, containerH, pipW, pipH);
    const dist = Math.hypot(x - pos.x, y - pos.y);
    if (dist < bestDist) {
      bestDist = dist;
      best = corner;
    }
  }

  return best;
}

interface FloatingPIPProps {
  completedCuts: number[];
  playheadTime?: number;
  durations?: number[];
  clipTrimStart?: number[];
  clipTrimEnd?: number[];
  isPlaying?: boolean;
  onPlayPause?: () => void;
}

export function FloatingPIP({
  completedCuts: _completedCuts,
  playheadTime = 0,
  durations = [0, 0, 0, 0, 0],
  clipTrimStart = [0, 0, 0, 0, 0],
  clipTrimEnd = [0, 0, 0, 0, 0],
  isPlaying = false,
  onPlayPause,
}: FloatingPIPProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pipRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoCurrentTimeRef = useRef(0);
  const [pipWidth, setPipWidth] = useState(DEFAULT_WIDTH);
  const [pipHovered, setPipHovered] = useState(false);
  const pipHeight = pipWidth / ASPECT_RATIO;

  const springX = useSpring(0, SPRING_CONFIG);
  const springY = useSpring(0, SPRING_CONFIG);

  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0, t: 0 });
  const velocity = useRef({ vx: 0, vy: 0 });

  const trimmedDurations = useMemo(() => {
    const ok = clipTrimStart.length === 5 && clipTrimEnd.length === 5;
    return durations.map((full, i) => {
      if (!ok || clipTrimEnd[i] <= clipTrimStart[i]) return full || 0;
      return Math.max(0, clipTrimEnd[i] - clipTrimStart[i]);
    });
  }, [durations, clipTrimStart, clipTrimEnd]);

  const startTimes = useMemo(() => {
    const s: number[] = [0];
    for (let i = 0; i < 5; i++) s.push(s[i] + trimmedDurations[i]);
    return s;
  }, [trimmedDurations]);

  const { clipIndex, timeInClip } = useMemo(() => {
    const totalSec = startTimes[5] || 0;
    if (totalSec <= 0) return { clipIndex: 0, timeInClip: 0 };
    for (let i = 0; i < 5; i++) {
      const start = startTimes[i];
      const end = startTimes[i + 1];
      const dur = trimmedDurations[i] || 0;
      if (dur > 0 && playheadTime >= start && playheadTime < end) {
        return { clipIndex: i, timeInClip: Math.min(playheadTime - start, dur) };
      }
    }
    if (playheadTime >= totalSec) return { clipIndex: 4, timeInClip: trimmedDurations[4] || 0 };
    return { clipIndex: 0, timeInClip: 0 };
  }, [playheadTime, startTimes, trimmedDurations]);

  const videoCurrentTime = (clipTrimStart[clipIndex] ?? 0) + timeInClip;
  videoCurrentTimeRef.current = videoCurrentTime;

  // When paused: seek PIP to match playhead (smooth scrubbing). When playing: sync once per clip then let the PIP video play natively so it stays smooth like the main preview.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.readyState < 2) return;
    if (isPlaying) {
      video.currentTime = videoCurrentTime;
      video.play().catch(() => {});
    } else {
      video.currentTime = videoCurrentTime;
      video.pause();
    }
  }, [clipIndex, isPlaying]);

  // When paused, keep PIP in sync with scrubbed playhead
  useEffect(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || isPlaying) return;
    video.currentTime = videoCurrentTime;
  }, [isPlaying, videoCurrentTime]);

  // When playing and clip src just loaded (e.g. after clip change), seek and play
  const onPIPLoadedData = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isPlaying) return;
    video.currentTime = videoCurrentTime;
    video.play().catch(() => {});
  }, [isPlaying, videoCurrentTime]);

  // While playing, periodically sync PIP to main playhead to avoid drift (main drives time via onTimeUpdate)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;
      const target = videoCurrentTimeRef.current;
      if (Math.abs(video.currentTime - target) > 0.2) video.currentTime = target;
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Initialize position to top-right corner
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const pos = getCornerPosition("top-right", el.offsetWidth, el.offsetHeight, pipWidth, pipHeight);
    springX.jump(pos.x);
    springY.jump(pos.y);
  }, []);

  const snapToCorner = useCallback(
    (corner: Corner) => {
      const el = containerRef.current;
      if (!el) return;
      const pos = getCornerPosition(corner, el.offsetWidth, el.offsetHeight, pipWidth, pipHeight);
      springX.set(pos.x);
      springY.set(pos.y);
    },
    [pipWidth, pipHeight, springX, springY]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-pip-controls]")) return;
      e.preventDefault();
      isDragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY, t: performance.now() };
      velocity.current = { vx: 0, vy: 0 };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;

      const now = performance.now();
      const dt = Math.max(now - lastPointer.current.t, 1);
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;

      velocity.current = {
        vx: (dx / dt) * 1000,
        vy: (dy / dt) * 1000,
      };

      lastPointer.current = { x: e.clientX, y: e.clientY, t: now };

      springX.jump(springX.get() + dx);
      springY.jump(springY.get() + dy);
    },
    [springX, springY]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);

      const el = containerRef.current;
      if (!el) return;

      const currentX = springX.get();
      const currentY = springY.get();
      const projectedX = currentX + velocity.current.vx * VELOCITY_PROJECTION;
      const projectedY = currentY + velocity.current.vy * VELOCITY_PROJECTION;

      const corner = nearestCorner(projectedX, projectedY, el.offsetWidth, el.offsetHeight, pipWidth, pipHeight);
      snapToCorner(corner);
    },
    [springX, springY, pipWidth, pipHeight, snapToCorner]
  );

  // Pinch-to-resize via trackpad (wheel with ctrlKey)
  useEffect(() => {
    const el = pipRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();

      setPipWidth((prev) => {
        return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, prev - e.deltaY * 2));
      });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  // After resize, re-snap to nearest corner
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const currentX = springX.get();
    const currentY = springY.get();
    const corner = nearestCorner(currentX, currentY, el.offsetWidth, el.offsetHeight, pipWidth, pipHeight);
    const pos = getCornerPosition(corner, el.offsetWidth, el.offsetHeight, pipWidth, pipHeight);
    springX.set(pos.x);
    springY.set(pos.y);
  }, [pipWidth, pipHeight]);

  const videoSrc = VIDEO_SOURCES[clipIndex] ?? VIDEO_SOURCES[0];

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <motion.div
        ref={pipRef}
        className="absolute pointer-events-auto rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 cursor-grab active:cursor-grabbing select-none"
        style={{
          width: pipWidth,
          height: pipHeight,
          x: springX,
          y: springY,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onMouseEnter={() => setPipHovered(true)}
        onMouseLeave={() => setPipHovered(false)}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-cover pointer-events-none"
          muted
          playsInline
          preload="auto"
          onLoadedData={onPIPLoadedData}
        />
        {pipHovered && onPlayPause && (
          <div
            data-pip-controls
            className="absolute inset-x-0 bottom-0 bg-black/60 flex items-center justify-center gap-2 py-2 pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              onPlayPause();
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="size-5 text-white" />
              ) : (
                <Play className="size-5 text-white ml-0.5" />
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
