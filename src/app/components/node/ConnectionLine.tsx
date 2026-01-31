interface CanvasConnectionProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isActive?: boolean;
  isHovered?: boolean;
}

export function CanvasConnection({
  from,
  to,
  isActive = false,
  isHovered = false,
}: CanvasConnectionProps) {
  const dy = to.y - from.y;
  const controlOffset = Math.min(Math.abs(dy) * 0.5, 120);

  const d = `M ${from.x} ${from.y} C ${from.x} ${from.y + controlOffset}, ${to.x} ${to.y - controlOffset}, ${to.x} ${to.y}`;

  const strokeColor = isHovered || isActive ? "#6298ec" : "#3a3a3a";

  return (
    <path
      d={d}
      stroke={strokeColor}
      strokeWidth={2}
      strokeLinecap="round"
      fill="none"
      strokeDasharray={isActive ? "6 4" : "none"}
      opacity={isActive ? 0.6 : 1}
      style={{ transition: isActive ? "none" : "stroke 200ms, opacity 200ms" }}
    />
  );
}
