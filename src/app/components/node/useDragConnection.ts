import { useState, useCallback, useRef, useEffect } from "react";
import type { PortRegistry } from "./NodePort";

interface DragState {
  sourceNodeId: string;
  sourcePosition: { x: number; y: number };
  cursorPosition: { x: number; y: number };
  nearPortNodeId: string | null;
}

interface UseDragConnectionOptions {
  portRegistry: PortRegistry;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onConnect: (sourceNodeId: string, targetNodeId: string) => void;
  onDropOnCanvas: (sourceNodeId: string, position: { x: number; y: number }) => void;
}

const HIT_THRESHOLD = 24;

export function useDragConnection({
  portRegistry,
  canvasRef,
  onConnect,
  onDropOnCanvas,
}: UseDragConnectionOptions) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const cachedPortPositions = useRef<Map<string, { nodeId: string; type: string; cx: number; cy: number }>>(new Map());

  const cachePortPositions = useCallback(() => {
    cachedPortPositions.current.clear();
    portRegistry.forEach((entry, portId) => {
      const rect = entry.getRect();
      if (rect) {
        cachedPortPositions.current.set(portId, {
          nodeId: entry.nodeId,
          type: entry.type,
          cx: rect.left + rect.width / 2,
          cy: rect.top + rect.height / 2,
        });
      }
    });
  }, [portRegistry]);

  const findNearInputPort = useCallback(
    (x: number, y: number, sourceNodeId: string): string | null => {
      let closestId: string | null = null;
      let closestDist = HIT_THRESHOLD;

      cachedPortPositions.current.forEach((pos, _portId) => {
        if (pos.type !== "input" || pos.nodeId === sourceNodeId) return;
        const dist = Math.hypot(pos.cx - x, pos.cy - y);
        if (dist < closestDist) {
          closestDist = dist;
          closestId = pos.nodeId;
        }
      });

      return closestId;
    },
    []
  );

  const startDrag = useCallback(
    (sourceNodeId: string, position: { x: number; y: number }) => {
      cachePortPositions();
      setDragState({
        sourceNodeId,
        sourcePosition: position,
        cursorPosition: position,
        nearPortNodeId: null,
      });
    },
    [cachePortPositions]
  );

  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: PointerEvent) => {
      const nearPortNodeId = findNearInputPort(e.clientX, e.clientY, dragState.sourceNodeId);
      setDragState((prev) =>
        prev
          ? {
              ...prev,
              cursorPosition: { x: e.clientX, y: e.clientY },
              nearPortNodeId,
            }
          : null
      );
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!dragState) return;

      const nearPortNodeId = findNearInputPort(e.clientX, e.clientY, dragState.sourceNodeId);

      if (nearPortNodeId) {
        onConnect(dragState.sourceNodeId, nearPortNodeId);
      } else {
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (canvasRect) {
          onDropOnCanvas(dragState.sourceNodeId, {
            x: e.clientX - canvasRect.left,
            y: e.clientY - canvasRect.top,
          });
        }
      }

      setDragState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragState, findNearInputPort, onConnect, onDropOnCanvas, canvasRef]);

  return {
    dragState,
    startDrag,
    isDragging: dragState !== null,
  };
}
