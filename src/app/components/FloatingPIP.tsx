import { useRef, useCallback, useEffect, useState } from "react";
import { motion, useSpring } from "motion/react";

import image1 from "../../assets/4ade86ef9dac706bb3957bd6282d330df1e57c89.png";
import image2 from "../../assets/c4945bd878c904a44e42b756d4a58bd0d542132d.png";
import image3 from "../../assets/7633c3f223e4bc39f692ecfd0b163fb92cb5ad4e.png";
import image4 from "../../assets/fdac420adeb4e37cb6c0fc58ae2eaac15892ec6c.png";

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
}

export function FloatingPIP({ completedCuts }: FloatingPIPProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pipRef = useRef<HTMLDivElement>(null);
  const [pipWidth, setPipWidth] = useState(DEFAULT_WIDTH);
  const pipHeight = pipWidth / ASPECT_RATIO;

  const springX = useSpring(0, SPRING_CONFIG);
  const springY = useSpring(0, SPRING_CONFIG);

  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0, t: 0 });
  const velocity = useRef({ vx: 0, vy: 0 });

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

  let currentImage = image1;
  const cutCount = completedCuts.length;
  if (cutCount >= 3) {
    currentImage = image4;
  } else if (cutCount === 2) {
    currentImage = image3;
  } else if (cutCount === 1) {
    currentImage = image2;
  }

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
      >
        <img
          src={currentImage}
          alt="Video preview"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </motion.div>
    </div>
  );
}
