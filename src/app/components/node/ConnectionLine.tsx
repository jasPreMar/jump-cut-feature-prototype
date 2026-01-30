import { cn } from "@/app/components/ui/utils";

interface ConnectionLineProps {
  isHovered?: boolean;
}

export function ConnectionLine({ isHovered = false }: ConnectionLineProps) {
  return (
    <div className="flex justify-center w-[320px] h-[48px]">
      <svg
        width="24"
        height="48"
        viewBox="0 0 24 48"
        fill="none"
        className="overflow-visible"
      >
        {/* Top port circle */}
        <circle
          cx="12"
          cy="4"
          r="4"
          className={cn(
            "transition-colors duration-200",
            isHovered ? "fill-[#6298ec]" : "fill-[#3a3a3a]"
          )}
          stroke={isHovered ? "#6298ec" : "#4a4a4a"}
          strokeWidth="1.5"
        />

        {/* Curved connector */}
        <path
          d="M12 8 C12 20, 12 28, 12 40"
          className={cn(
            "transition-colors duration-200",
            isHovered ? "stroke-[#6298ec]" : "stroke-[#3a3a3a]"
          )}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Bottom port circle */}
        <circle
          cx="12"
          cy="44"
          r="4"
          className={cn(
            "transition-colors duration-200",
            isHovered ? "fill-[#6298ec]" : "fill-[#3a3a3a]"
          )}
          stroke={isHovered ? "#6298ec" : "#4a4a4a"}
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
