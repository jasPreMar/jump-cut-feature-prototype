import { useState, useRef, useEffect } from "react";
import svgPaths from "@/imports/svg-mbvhuxpq3m";
import image1 from "../../assets/4ade86ef9dac706bb3957bd6282d330df1e57c89.png";
import image2 from "../../assets/c4945bd878c904a44e42b756d4a58bd0d542132d.png";
import image3 from "../../assets/7633c3f223e4bc39f692ecfd0b163fb92cb5ad4e.png";
import image4 from "../../assets/fdac420adeb4e37cb6c0fc58ae2eaac15892ec6c.png";

export function VideoEditor({ completedCuts }: { completedCuts: number[] }) {
  return (
    <div className="flex h-full items-stretch gap-3 p-3 overflow-hidden">
      <ChatPanel />
      <VideoPreview completedCuts={completedCuts} />
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

function VideoPreview({ completedCuts }: { completedCuts: number[] }) {
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
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden min-h-0">
      {/* Video frame - 16:9 aspect ratio at all times */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-0">
        <div className="w-full max-h-full aspect-video rounded-sm overflow-hidden bg-black relative shrink-0">
          <img
            alt="Video preview"
            className="absolute inset-0 w-full h-full object-cover"
            src={currentImage}
          />
          {/* Drop zone for future video file */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30 pointer-events-auto">
            <p className="text-white/60 text-sm font-medium">
              Drop a video file here
            </p>
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div className="shrink-0 flex items-center gap-3 pt-2 px-1">
        {/* Shuffle button */}
        <button className="bg-[#181a1f] hover:bg-[#22242a] transition-colors rounded px-3 py-1 flex items-center gap-1.5 cursor-pointer">
          <ShuffleIcon />
          <span className="text-[#f2f3f7] text-sm tracking-tight">
            Shuffle Content
          </span>
        </button>

        <div className="flex-1" />

        {/* Playhead time */}
        <div className="flex items-center gap-0.5 text-sm tracking-wide font-mono">
          <span className="text-[#ddd]">00:00:56</span>
          <span className="text-[#777]">/ 00:21:43</span>
        </div>

        <div className="flex-1" />

        {/* Right controls */}
        <div className="flex items-center gap-4">
          {/* Play/Pause button */}
          <button
            className="bg-[#25252a] hover:bg-[#35353a] transition-colors rounded-sm px-3 py-1 cursor-pointer"
            title="Play/Pause"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 54 28"
              fill="none"
              className="block"
            >
              <path d={svgPaths.pd0a8b00} fill="#F0F0F3" />
            </svg>
          </button>

          <button
            className="text-[#bcbcbe] hover:text-white transition-colors cursor-pointer"
            title="AI Assist"
          >
            <AIIcon />
          </button>
          <button
            className="text-[#bcbcbe] hover:text-white transition-colors cursor-pointer"
            title="Capture"
          >
            <CaptureIcon />
          </button>
          <button
            className="text-[#bcbcbe] hover:text-white transition-colors cursor-pointer"
            title="Screen"
          >
            <ScreenIcon />
          </button>
          <button
            className="text-[#bdbdbf] hover:text-white transition-colors cursor-pointer"
            title="More options"
          >
            <MoreIcon />
          </button>
        </div>
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
