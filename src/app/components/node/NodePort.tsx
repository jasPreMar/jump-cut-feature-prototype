import { useRef, useEffect, useCallback } from "react";

export interface PortRegistryEntry {
  nodeId: string;
  type: "input" | "output";
  getRect: () => DOMRect | null;
}

export type PortRegistry = Map<string, PortRegistryEntry>;

interface NodePortProps {
  nodeId: string;
  type: "input" | "output";
  portRegistry: PortRegistry;
  isActive?: boolean;
  isConnected?: boolean;
  onDragStart?: (nodeId: string, position: { x: number; y: number }) => void;
}

export function NodePort({
  nodeId,
  type,
  portRegistry,
  isActive = false,
  isConnected = false,
  onDragStart,
}: NodePortProps) {
  const ref = useRef<HTMLDivElement>(null);
  const portId = `${nodeId}-${type}`;

  useEffect(() => {
    portRegistry.set(portId, {
      nodeId,
      type,
      getRect: () => ref.current?.getBoundingClientRect() ?? null,
    });
    return () => {
      portRegistry.delete(portId);
    };
  }, [portId, nodeId, type, portRegistry]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (type !== "output" || !onDragStart) return;
      e.preventDefault();
      e.stopPropagation();
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      onDragStart(nodeId, {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    },
    [type, nodeId, onDragStart]
  );

  const fillColor = isActive ? "#6298ec" : isConnected ? "#5a5a5a" : "#3a3a3a";
  const strokeColor = isActive ? "#6298ec" : "#4a4a4a";

  return (
    <div
      ref={ref}
      data-port
      className="flex items-center justify-center"
      style={{
        width: 24,
        height: 24,
        cursor: type === "output" ? "crosshair" : "default",
        position: "relative",
        zIndex: 10,
      }}
      onPointerDown={handlePointerDown}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" className="overflow-visible">
        <circle
          cx="8"
          cy="8"
          r="4"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="1.5"
          style={{ transition: "fill 200ms, stroke 200ms" }}
        />
      </svg>
    </div>
  );
}
