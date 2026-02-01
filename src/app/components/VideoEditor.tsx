import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Type, Voicemail, Maximize, Pause, EllipsisVertical } from "lucide-react";
import svgPaths from "@/imports/svg-mbvhuxpq3m";
import image1 from "../../assets/4ade86ef9dac706bb3957bd6282d330df1e57c89.png";
import image2 from "../../assets/c4945bd878c904a44e42b756d4a58bd0d542132d.png";
import image3 from "../../assets/7633c3f223e4bc39f692ecfd0b163fb92cb5ad4e.png";
import image4 from "../../assets/fdac420adeb4e37cb6c0fc58ae2eaac15892ec6c.png";
import { VIDEO_SOURCES } from "@/app/constants/videos";

export function VideoEditor({
  completedCuts,
  playheadTime,
  onPlayheadTimeChange,
  hoverPreviewTime = null,
  durations,
  onDurationsChange,
  clipTrimStart,
  clipTrimEnd,
  isPlaying,
  onPlayPause,
}: {
  completedCuts: number[];
  playheadTime: number;
  onPlayheadTimeChange: (timeSeconds: number) => void;
  hoverPreviewTime?: number | null;
  durations: number[];
  onDurationsChange: (durations: number[]) => void;
  clipTrimStart: number[];
  clipTrimEnd: number[];
  isPlaying: boolean;
  onPlayPause: () => void;
}) {
  return (
    <div className="flex h-full items-stretch gap-3 p-3 overflow-hidden">
      <ChatPanel />
      <VideoPreview
        completedCuts={completedCuts}
        playheadTime={playheadTime}
        onPlayheadTimeChange={onPlayheadTimeChange}
        hoverPreviewTime={hoverPreviewTime}
        durations={durations}
        onDurationsChange={onDurationsChange}
        clipTrimStart={clipTrimStart}
        clipTrimEnd={clipTrimEnd}
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
      />
    </div>
  );
}

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  actions?: { label: string }[];
}

function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "user",
      content: "can you add the latest log explorer demo",
    },
    {
      id: 2,
      role: "assistant",
      content:
        "Perfect! I've added the latest Log Explorer demo to your project. It shows searching for shopping cart events and switching between bar and heatmap visualizations. The demo starts right after your intro slide at 3.95 seconds.",
      actions: [
        { label: "Search team library" },
        { label: "Add from team library" },
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [chatVisible, setChatVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "I'll work on that for you. Let me process your request and update the project accordingly.",
      },
    ]);
    setInputValue("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  if (!chatVisible) {
    return (
      <div className="w-10 shrink-0 flex flex-col items-center pt-2">
        <button
          onClick={() => setChatVisible(true)}
          className="text-[#888] hover:text-white transition-colors p-1"
          title="Show chat"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4.16667 10H15.8333" />
            <path d="M10 4.16667V15.8333" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-[340px] xl:w-[388px] shrink-0 flex flex-col bg-[#1a1a1a] rounded-md border border-[#222426] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 shrink-0">
        <p className="text-[#eee] text-sm tracking-tight truncate">
          Add Latest Log Explorer Demo
        </p>
        <div className="flex gap-3 items-center shrink-0 ml-2">
          <button
            className="text-[#888] hover:text-white transition-colors"
            title="New chat"
          >
            <PlusIcon />
          </button>
          <button
            className="text-[#888] hover:text-white transition-colors"
            title="History"
          >
            <HistoryIcon />
          </button>
          <button
            onClick={() => setChatVisible(false)}
            className="text-[#888] hover:text-white transition-colors text-[13px] font-medium"
          >
            Hide
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 pb-2">
        <div className="flex flex-col gap-3 justify-end min-h-full">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-2">
              {msg.role === "user" ? (
                <div className="bg-[#212121] rounded-lg px-3 py-2 flex items-center gap-1">
                  <p className="text-white text-sm tracking-tight flex-1">
                    {msg.content}
                  </p>
                  <button className="shrink-0 text-[#545454] hover:text-[#888] transition-colors">
                    <RotateIcon />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 px-2.5">
                  {msg.actions?.map((action, i) => (
                    <button
                      key={i}
                      className="bg-[#1f1f1f] border border-[#353535] rounded px-1.5 py-0.5 text-[#888] text-[13px] font-medium hover:text-white hover:border-[#555] transition-colors self-start cursor-pointer"
                    >
                      {action.label}
                    </button>
                  ))}
                  <p className="text-white text-sm tracking-tight leading-[18px]">
                    {msg.content}
                  </p>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 px-3 pb-3">
        <div className="bg-[#2c2e30] rounded border border-[#718bd1] relative">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask, edit, or make something..."
            rows={1}
            className="w-full bg-transparent text-white text-sm tracking-tight placeholder-[#777] px-3 pt-2 pb-8 resize-none outline-none min-h-[72px] max-h-[140px]"
          />
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <div className="bg-[#323436] flex gap-1 items-center px-1.5 py-0.5 rounded">
              <AgentIcon />
              <span className="text-white text-xs font-medium opacity-80">
                Agent
              </span>
            </div>
            <button
              onClick={handleSend}
              className="w-5 h-5 rounded-full bg-[#535556] hover:bg-[#6a6b6c] transition-colors flex items-center justify-center cursor-pointer"
              title="Send message"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 19 19"
                fill="none"
                className="block"
              >
                <path
                  d={svgPaths.p31fea780}
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
                <path
                  d="M9.5 13.5833V5.41667"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
}

function VideoPreview({
  completedCuts,
  playheadTime,
  onPlayheadTimeChange,
  hoverPreviewTime = null,
  durations,
  onDurationsChange,
  clipTrimStart,
  clipTrimEnd,
  isPlaying,
  onPlayPause,
}: {
  completedCuts: number[];
  playheadTime: number;
  onPlayheadTimeChange: (timeSeconds: number) => void;
  hoverPreviewTime?: number | null;
  durations: number[];
  onDurationsChange: (durations: number[]) => void;
  clipTrimStart: number[];
  clipTrimEnd: number[];
  isPlaying: boolean;
  onPlayPause: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [localDurations, setLocalDurations] = useState<number[]>(Array(8).fill(0));
  const currentClipIndexRef = useRef(0);
  const loadingClipIndexRef = useRef(0);
  const currentTimeInClipRef = useRef(0);

  // Report durations to parent when loaded
  useEffect(() => {
    if (localDurations.some((d) => d > 0)) onDurationsChange(localDurations);
  }, [localDurations, onDurationsChange]);

  // Trimmed durations and start times (playback uses trim in/out)
  const trimmedDurations = useMemo(() => {
    const d = localDurations;
    const ok = clipTrimStart.length === 8 && clipTrimEnd.length === 8;
    return d.map((full, i) => {
      if (!ok || clipTrimEnd[i] <= clipTrimStart[i]) return full || 0;
      return Math.max(0, clipTrimEnd[i] - clipTrimStart[i]);
    });
  }, [localDurations, clipTrimStart, clipTrimEnd]);

  const startTimes = useMemo(() => {
    const s: number[] = [0];
    for (let i = 0; i < trimmedDurations.length; i++) s.push(s[i] + trimmedDurations[i]);
    return s;
  }, [trimmedDurations]);

  const totalDuration = useMemo(() => startTimes[startTimes.length - 1] || 0, [startTimes]);

  // Map playhead time to clip index and time within trimmed segment (for playback)
  const { clipIndex, timeInClip } = useMemo(() => {
    const numClips = trimmedDurations.length;
    const totalSec = startTimes[numClips] || 0;
    if (totalSec <= 0) return { clipIndex: 0, timeInClip: 0 };
    for (let i = 0; i < numClips; i++) {
      const start = startTimes[i];
      const end = startTimes[i + 1];
      const dur = trimmedDurations[i] || 0;
      if (dur > 0 && playheadTime >= start && playheadTime < end) {
        return { clipIndex: i, timeInClip: Math.min(playheadTime - start, dur) };
      }
    }
    if (playheadTime >= totalSec) return { clipIndex: numClips - 1, timeInClip: trimmedDurations[numClips - 1] || 0 };
    return { clipIndex: 0, timeInClip: 0 };
  }, [playheadTime, startTimes, trimmedDurations]);

  // Display time: hover over script track scrubs the video preview (same as node canvas hover)
  const displayTime = hoverPreviewTime ?? playheadTime;
  const { clipIndex: displayClipIndex, timeInClip: displayTimeInClip } = useMemo(() => {
    const numClips = trimmedDurations.length;
    const totalSec = startTimes[numClips] || 0;
    if (totalSec <= 0) return { clipIndex: 0, timeInClip: 0 };
    for (let i = 0; i < numClips; i++) {
      const start = startTimes[i];
      const end = startTimes[i + 1];
      const dur = trimmedDurations[i] || 0;
      if (dur > 0 && displayTime >= start && displayTime < end) {
        return { clipIndex: i, timeInClip: Math.min(displayTime - start, dur) };
      }
    }
    if (displayTime >= totalSec) return { clipIndex: numClips - 1, timeInClip: trimmedDurations[numClips - 1] || 0 };
    return { clipIndex: 0, timeInClip: 0 };
  }, [displayTime, startTimes, trimmedDurations]);

  currentClipIndexRef.current = clipIndex;
  currentTimeInClipRef.current = timeInClip;
  loadingClipIndexRef.current = displayClipIndex; // video src is display clip (hover scrub or playhead)

  const trimStartRef = useRef(clipTrimStart);
  const trimEndRef = useRef(clipTrimEnd);
  trimStartRef.current = clipTrimStart;
  trimEndRef.current = clipTrimEnd;

  const onVideoLoadedData = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause(); // always pause on load to prevent autoplay
    if (hoverPreviewTime != null) {
      const i = displayClipIndex;
      const start = trimStartRef.current[i] ?? 0;
      const end = trimEndRef.current[i] ?? video.duration;
      const t = Math.max(start, Math.min(end, start + displayTimeInClip));
      video.currentTime = t;
    } else {
      const i = currentClipIndexRef.current;
      const start = trimStartRef.current[i] ?? 0;
      const end = trimEndRef.current[i] ?? video.duration;
      const t = Math.max(start, Math.min(end, start + currentTimeInClipRef.current));
      video.currentTime = t;
      if (isPlaying) video.play().catch(() => {});
    }
  }, [isPlaying, hoverPreviewTime, displayClipIndex, displayTimeInClip]);

  // Sync video to playhead; when hovering script track, scrub to hover time and pause (same as node canvas hover scrub).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.readyState >= 2) {
      if (hoverPreviewTime != null) {
        const i = displayClipIndex;
        const start = clipTrimStart[i] ?? 0;
        const end = clipTrimEnd[i] ?? video.duration;
        const t = Math.max(start, Math.min(end, start + displayTimeInClip));
        video.currentTime = t;
        video.pause();
      } else {
        // Not hovering: keep video at actual playhead (so leaving hover doesn't jump playhead or start playing from wrong place)
        const i = currentClipIndexRef.current;
        const start = clipTrimStart[i] ?? 0;
        const end = clipTrimEnd[i] ?? video.duration;
        const t = Math.max(start, Math.min(end, start + currentTimeInClipRef.current));
        video.currentTime = t;
        if (isPlaying) video.play().catch(() => {});
        else video.pause();
      }
    }
  }, [hoverPreviewTime, displayClipIndex, displayTimeInClip, clipIndex, isPlaying, timeInClip, clipTrimStart, clipTrimEnd]);

  // Throttle playhead updates so we don't re-render the whole tree on every timeupdate (smoother playback)
  const playheadThrottleRef = useRef<number | null>(null);
  const lastPlayheadUpdateRef = useRef(0);
  const THROTTLE_MS = 50; // ~20 fps for timeline scrubber
  const startTimesRef = useRef(startTimes);
  startTimesRef.current = startTimes;

  const onTimeUpdate = useCallback(() => {
    if (hoverPreviewTime != null) return; // scrub-only: don't move the real playhead
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) return; // when paused (including after hover scrub), playhead is only moved by click—not by video currentTime
    const i = currentClipIndexRef.current;
    const starts = startTimesRef.current;
    const trimStart = trimStartRef.current[i] ?? 0;
    const trimEnd = trimEndRef.current[i] ?? video.duration;
    const ct = video.currentTime;
    if (ct >= trimEnd - 0.05) {
      if (i < VIDEO_SOURCES.length - 1) onPlayheadTimeChange(starts[i + 1]);
      else onPlayPause();
      return;
    }
    const timeInClipSec = Math.max(0, ct - trimStart);
    const currentTimeSec = starts[i] + timeInClipSec;

    const now = performance.now();
    if (now - lastPlayheadUpdateRef.current >= THROTTLE_MS) {
      lastPlayheadUpdateRef.current = now;
      onPlayheadTimeChange(currentTimeSec);
    } else if (playheadThrottleRef.current === null) {
      playheadThrottleRef.current = window.setTimeout(() => {
        playheadThrottleRef.current = null;
        lastPlayheadUpdateRef.current = performance.now();
        const v = videoRef.current;
        if (!v || v.paused) return; // don't push playhead when paused (e.g. after hover scrub)
        const idx = currentClipIndexRef.current;
        const ts = trimStartRef.current[idx] ?? 0;
        const te = trimEndRef.current[idx] ?? v.duration;
        const t = v.currentTime;
        if (t >= te - 0.05) {
          if (idx < VIDEO_SOURCES.length - 1) onPlayheadTimeChange(startTimesRef.current[idx + 1]);
          else onPlayPause();
          return;
        }
        onPlayheadTimeChange(startTimesRef.current[idx] + Math.max(0, t - ts));
      }, THROTTLE_MS);
    }
  }, [onPlayheadTimeChange, onPlayPause, hoverPreviewTime]);

  useEffect(() => {
    return () => {
      if (playheadThrottleRef.current !== null) {
        window.clearTimeout(playheadThrottleRef.current);
        playheadThrottleRef.current = null;
      }
    };
  }, []);

  const onLoadedMetadata = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const idx = loadingClipIndexRef.current;
    if (idx >= 0 && idx < VIDEO_SOURCES.length && Number.isFinite(video.duration)) {
      setLocalDurations((prev) => {
        const next = [...prev];
        next[idx] = video.duration;
        return next;
      });
    }
  }, []);

  const onPreloadMetadata = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const index = Number((video as HTMLVideoElement & { dataset: { index?: string } }).dataset.index);
    if (index >= 0 && index < VIDEO_SOURCES.length && Number.isFinite(video.duration) && video.duration > 0) {
      setLocalDurations((prev) => {
        const next = [...prev];
        next[index] = video.duration;
        return next;
      });
    }
  }, []);

  const onEnded = useCallback(() => {
    if (hoverPreviewTime != null) return; // scrub-only: don't move the real playhead
    const i = currentClipIndexRef.current;
    const st = startTimesRef.current;
    if (i < VIDEO_SOURCES.length - 1) onPlayheadTimeChange(st[i + 1]);
    else onPlayPause();
  }, [onPlayheadTimeChange, onPlayPause, hoverPreviewTime]);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden min-h-0">
      {/* Video frame - 16:9 aspect ratio at all times */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-0">
        <div className="w-full max-h-full aspect-video rounded-sm overflow-hidden bg-black relative shrink-0">
          {/* Hidden preload: durations come from each file’s loadedmetadata, so swapping clip files in src/assets updates timeline widths automatically */}
          {VIDEO_SOURCES.map((src, i) => (
            <video
              key={i}
              data-index={i}
              src={src}
              preload="metadata"
              onLoadedMetadata={onPreloadMetadata}
              className="hidden"
              aria-hidden
            />
          ))}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain bg-black"
            src={VIDEO_SOURCES[displayClipIndex]}
            onLoadedData={onVideoLoadedData}
            onLoadedMetadata={onLoadedMetadata}
            onTimeUpdate={onTimeUpdate}
            onEnded={onEnded}
            playsInline
            muted={false}
          />
        </div>
      </div>

      {/* Controls bar: Play + time on left, three icon buttons in center */}
      <div className="shrink-0 flex items-center gap-3 pt-2 px-1">
        {/* Left: Play button + time right next to it */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPlayPause}
            className="bg-[#25252a] hover:bg-[#35353a] transition-colors rounded-sm p-2 cursor-pointer text-[#f0f0f3] flex items-center justify-center"
            title="Play/Pause (Space)"
          >
            {isPlaying ? (
              <Pause className="size-5 shrink-0" />
            ) : (
              /* Filled play triangle – viewBox fits path bounds so it fills the icon */
              <svg width="20" height="20" viewBox="19.5 5.5 15 17" fill="none" className="block shrink-0">
                <path d={svgPaths.pd0a8b00} fill="currentColor" />
              </svg>
            )}
          </button>
          <div className="flex items-center gap-0.5 text-sm tracking-wide font-mono">
            <span className="text-[#ddd]">{formatTime(timeInClip)}</span>
            <span className="text-[#777]">/ {formatTime(totalDuration)}</span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Center: three icon buttons (Type, Voicemail, Maximize) */}
        <div className="flex items-center gap-1">
          <button
            className="w-8 h-8 flex items-center justify-center rounded bg-[#25252a] hover:bg-[#323436] transition-colors text-[#bcbcbe] hover:text-white cursor-pointer"
            title="Text"
          >
            <Type className="size-4" />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded bg-[#25252a] hover:bg-[#323436] transition-colors text-[#bcbcbe] hover:text-white cursor-pointer"
            title="Voicemail"
          >
            <Voicemail className="size-4" />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded bg-[#25252a] hover:bg-[#323436] transition-colors text-[#bcbcbe] hover:text-white cursor-pointer"
            title="Fullscreen"
          >
            <Maximize className="size-4" />
          </button>
        </div>

        <div className="flex-1" />

        {/* Right: ellipsis vertical */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded bg-[#25252a] hover:bg-[#323436] transition-colors text-[#bcbcbe] hover:text-white cursor-pointer"
          title="More options"
        >
          <EllipsisVertical className="size-4" />
        </button>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="block"
    >
      <path d="M4.16667 10H15.8333" />
      <path d="M10 4.16667V15.8333" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="block"
    >
      <path d="M8 4V8H5.33333" />
      <path d={svgPaths.p39ee6532} />
    </svg>
  );
}

function RotateIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="block"
    >
      <path d={svgPaths.p117ac380} />
      <path d={svgPaths.p1a36fd80} />
    </svg>
  );
}

function AgentIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="block"
    >
      <path
        d={svgPaths.p1c08d800}
        stroke="#8F9192"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="block shrink-0"
    >
      <path
        d="M8.75 2.91667H12.25"
        stroke="#BCBCBE"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M8.75 7H12.25"
        stroke="#BCBCBE"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M1.75 11.0833H12.25"
        stroke="#BCBCBE"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d={svgPaths.pe94f680}
        stroke="#BCBCBE"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M2.28667 5.83333H5.88"
        stroke="#BCBCBE"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function AIIcon() {
  return (
    <div className="h-[18px] w-[24px] relative rounded-sm overflow-hidden border-[1.5px] border-current">
      <svg
        width="15"
        height="9"
        viewBox="0 0 16.3335 9.50019"
        fill="none"
        className="absolute inset-0 m-auto"
      >
        <path
          d={svgPaths.p3c5ef800}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d={svgPaths.p1163aa0}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M1.66686 6.75H7.16687"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

function CaptureIcon() {
  return (
    <svg
      width="24"
      height="18"
      viewBox="0 0 24 18"
      fill="none"
      className="block"
    >
      <rect
        height="16.5"
        rx="1.25"
        stroke="currentColor"
        strokeWidth="1.5"
        width="22.5"
        x="0.75"
        y="0.75"
      />
      <circle cx="12" cy="9" fill="currentColor" r="5" />
    </svg>
  );
}

function ScreenIcon() {
  return (
    <svg
      width="20"
      height="17"
      viewBox="0 0 21.5 18.5"
      fill="none"
      className="block"
    >
      <path
        d={svgPaths.p381d1b80}
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d={svgPaths.p2482fc00}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className="block"
    >
      <path
        d={svgPaths.p3f4e600}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d={svgPaths.p27cf2000}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d={svgPaths.p38a06840}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
