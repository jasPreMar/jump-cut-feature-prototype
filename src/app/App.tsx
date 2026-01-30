import { useState } from "react";
import { VideoEditor } from "@/app/components/VideoEditor";
import { JumpCutTimeline } from "@/app/components/JumpCutTimeline";

export default function App() {
  const [completedCuts, setCompletedCuts] = useState<number[]>([]);

  return (
    <div className="bg-[#0e1015] flex flex-col h-screen w-full overflow-hidden">
      <div className="flex-1 min-h-0">
        <VideoEditor completedCuts={completedCuts} />
      </div>
      <div className="h-[200px] shrink-0 relative w-full overflow-y-clip">
        <JumpCutTimeline onCutsChange={setCompletedCuts} />
      </div>
    </div>
  );
}