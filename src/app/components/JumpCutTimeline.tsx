import { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
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

interface JumpCutTimelineProps {
  onCutsChange: (cuts: number[]) => void;
  playheadPosition: number;
  onPlayheadChange: (position: number) => void;
  isNodeViewOpen?: boolean;
}

export function JumpCutTimeline({ onCutsChange, playheadPosition, onPlayheadChange, isNodeViewOpen = false }: JumpCutTimelineProps) {
  const [currentCutIndex, setCurrentCutIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [completedCuts, setCompletedCuts] = useState<number[]>([]);
  const [customCutPositions, setCustomCutPositions] = useState<Record<number, number>>({});
  const [clipStartPositions, setClipStartPositions] = useState<Record<number, number>>({});
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [manualSplits, setManualSplits] = useState<number[]>([]);
  const [history, setHistory] = useState<Array<{
    completedCuts: number[];
    currentCutIndex: number;
    customCutPositions: Record<number, number>;
    clipStartPositions: Record<number, number>;
    manualSplits: number[];
  }>>([
    { completedCuts: [], currentCutIndex: 0, customCutPositions: {}, clipStartPositions: {}, manualSplits: [] }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Define clips with base configuration
  const baseClips: Clip[] = [
    { id: 0, title: "Introducing Log Explorer", color: "blue", originalWidth: 210, transcript: "Log explorer lets you query logs, traces and sessions from all your apps in one place. You can search by any attribute, filter by severity level, and correlate logs with traces to debug issues faster than ever before." },
    { id: 1, title: "Google Chrome Log Explorer Demo", color: "purple", originalWidth: 550, transcript: "Let's take a look at how this works in Google Chrome. First, we'll open the Log Explorer and search for shopping cart events." },
    { id: 2, title: "Analytics Dashboard", color: "green", originalWidth: 700, transcript: "Then we can switch to the analytics dashboard to see the heatmap visualizations and explore the data patterns across our entire monitoring infrastructure." },
    { id: 3, title: "User Engagement Metrics", color: "orange", originalWidth: 500, transcript: "Here we can see the full user engagement metrics, results across the totality of data streams and monitoring endpoints across all platforms." },
    { id: 4, title: "Summary & Next Steps", color: "teal", originalWidth: 450, transcript: "We can explore the data patterns across our entire monitoring infrastructure and plan next steps for your team." },
  ];

  // Define 3 jump cut predictions
  const jumpCuts: JumpCut[] = [
    { id: 1, clipIndex: 0, endCutPosition: 190, nextClipStartPosition: 120 },
    { id: 2, clipIndex: 1, endCutPosition: 320, nextClipStartPosition: 150 },
    { id: 3, clipIndex: 2, endCutPosition: 250, nextClipStartPosition: 180 },
  ];

  // Calculate actual clip positions and widths based on completed cuts
  const clips = useMemo(() => {
    let currentLeft = 16;
    const gap = 10;

    return baseClips.map((clip, index) => {
      // Check if this clip has had its end cut
      const isEndCut = completedCuts.includes(index);
      
      // Check if this clip has had its beginning trimmed (from a previous clip's cut)
      const startPosition = clipStartPositions[index] || 0;
      
      // Get cut position from either jump cuts or custom cuts
      let endCutPosition: number | undefined;
      if (isEndCut) {
        // Check if it's a custom cut
        if (customCutPositions[index] !== undefined) {
          endCutPosition = customCutPositions[index];
        } else {
          // Check if it's a jump cut
          const jumpCut = jumpCuts.find(jc => jc.clipIndex === index);
          if (jumpCut) {
            endCutPosition = jumpCut.endCutPosition;
          }
        }
      }
      
      // Calculate the width:
      // If end is cut, width = endCutPosition - startPosition
      // If only start is trimmed, width = originalWidth - startPosition
      // If neither, width = originalWidth
      let width: number;
      if (endCutPosition !== undefined) {
        width = endCutPosition - startPosition;
      } else {
        width = clip.originalWidth - startPosition;
      }
      
      const clipData = {
        ...clip,
        left: currentLeft,
        width,
        isCut: isEndCut,
      };

      currentLeft += width + gap;
      return clipData;
    });
  }, [completedCuts, customCutPositions, clipStartPositions]);

  // Calculate the position of the current jump cut indicator
  const currentCutPosition = useMemo(() => {
    if (currentCutIndex >= jumpCuts.length) return null;
    
    const cut = jumpCuts[currentCutIndex];
    const clip = clips[cut.clipIndex];
    const nextClip = clips[cut.clipIndex + 1];
    
    if (!nextClip) return null;
    
    // Calculate the midpoint between the end of current clip cut and start of next clip cut
    const endCutAbsolutePosition = clip.left + cut.endCutPosition;
    const nextClipStartAbsolutePosition = nextClip.left + cut.nextClipStartPosition;
    const midpoint = (endCutAbsolutePosition + nextClipStartAbsolutePosition) / 2;
    
    return midpoint;
  }, [currentCutIndex, clips]);

  const isComplete = currentCutIndex >= jumpCuts.length;
  const currentCut = jumpCuts[currentCutIndex];

  // Helper to save state to history
  const saveToHistory = (newCompletedCuts: number[], newCurrentCutIndex: number, newCustomCutPositions: Record<number, number>, newClipStartPositions: Record<number, number>, newManualSplits: number[]) => {
    const newState = { completedCuts: newCompletedCuts, currentCutIndex: newCurrentCutIndex, customCutPositions: newCustomCutPositions, clipStartPositions: newClipStartPositions, manualSplits: newManualSplits };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCompletedCuts(newCompletedCuts);
    setCurrentCutIndex(newCurrentCutIndex);
    setCustomCutPositions(newCustomCutPositions);
    setClipStartPositions(newClipStartPositions);
    setManualSplits(newManualSplits);
    onCutsChange(newCompletedCuts);
  };

  // Helper to find which clip contains a position
  const findClipAtPosition = (position: number): { clipIndex: number; positionInClip: number } | null => {
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      if (position >= clip.left && position < clip.left + clip.width) {
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
      // Second Tab: Make the cut and move to next
      const newCompletedCuts = [...completedCuts, currentCut.clipIndex];
      const newCurrentCutIndex = currentCutIndex + 1;
      
      // Record the start position for the next clip
      const newClipStartPositions = { ...clipStartPositions };
      const nextClipIndex = currentCut.clipIndex + 1;
      if (nextClipIndex < baseClips.length) {
        newClipStartPositions[nextClipIndex] = currentCut.nextClipStartPosition;
      }
      
      saveToHistory(newCompletedCuts, newCurrentCutIndex, customCutPositions, newClipStartPositions, manualSplits);
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
          saveToHistory(completedCuts, currentCutIndex, customCutPositions, clipStartPositions, newManualSplits);
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
  }, [currentCutIndex, showPreview, completedCuts, currentCut, isComplete, currentCutPosition, history, historyIndex, hoveredPosition, clips]);

  return (
    <div
      className="absolute bg-[#171717] border-[#25272b] border-solid border-t inset-0 overflow-x-auto overflow-y-clip"
      ref={scrollContainerRef}
      onScroll={(e) => {
        setScrollLeft(e.currentTarget.scrollLeft);
      }}
    >
      <div className="relative h-full min-w-[2800px]" ref={timelineRef}>
        {/* Timeline rulers */}
        <TimelineRulers />
        
        {/* Track backgrounds */}
        <div className="absolute bg-[#201f22] border border-[#282829] border-solid bottom-[22px] h-[36px] left-[16px] right-[16px]" />
        <div className="absolute bg-[#201f22] border border-[#282829] border-solid bottom-[107px] h-[36px] left-[16px] right-[16px]" />
        <div className="absolute bg-[#201f22] border border-[#282829] border-solid bottom-[65px] h-[36px] left-[16px] right-[16px]" />
        
        {/* Video clips: 1st, 3rd, 5th on top reel; 2nd, 4th on middle reel */}
        {clips.map((clip, index) => {
          const isCurrentCutClip = showPreview && currentCut?.clipIndex === index;
          const isNextCutClip = showPreview && currentCut?.clipIndex === index - 1;
          const reel = index % 2;
          return (
            <VideoClip
              key={clip.id}
              clipId={clip.id}
              left={clip.left}
              width={clip.width}
              title={clip.title}
              color={clip.color}
              showEndCutPreview={isCurrentCutClip}
              endCutPosition={isCurrentCutClip ? currentCut.endCutPosition : undefined}
              showStartCutPreview={isNextCutClip}
              startCutPosition={isNextCutClip ? currentCut.nextClipStartPosition : undefined}
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
        
        {/* Hover detection zones */}
        <div 
          className="absolute h-[192px] left-0 top-0 right-0 z-20"
          onMouseMove={(e) => {
            if (!timelineRef.current) return;
            const timelineRect = timelineRef.current.getBoundingClientRect();
            const x = e.clientX - timelineRect.left;
            setHoveredPosition(Math.floor(x / 11) * 11 + 5);
          }}
          onMouseLeave={() => setHoveredPosition(null)}
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

function TimelineRulers() {
  return (
    <div className="absolute bottom-[161px] content-stretch flex gap-[44px] items-center left-[15px]">
      {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((num, i) => (
        <div key={i} className="flex items-center gap-[44px]">
          <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic text-[#777] text-[11px] text-center tracking-[0.11px] w-[14px]">
            <p className="leading-[normal] whitespace-pre-wrap">{num.toString().padStart(2, '0')}</p>
          </div>
          {i < 10 && (
            <>
              <TimelineTick />
              <TimelineTick />
              <TimelineTick />
              <TimelineTick />
            </>
          )}
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