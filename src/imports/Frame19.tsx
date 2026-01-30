import svgPaths from "./svg-6x4m2z1e2j";

function Frame2() {
  return (
    <div className="absolute bg-[#1f1f1f] h-[21px] left-[3px] rounded-[4px] top-[3.5px] w-[29px]">
      <div aria-hidden="true" className="absolute border border-[#353535] border-solid inset-[-0.5px] pointer-events-none rounded-[4.5px]" />
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Frame">
          <path d={svgPaths.p127a4d00} id="Vector" stroke="var(--stroke-0, #639BEC)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.06 4.06L6 6" id="Vector_2" stroke="var(--stroke-0, #639BEC)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 2L4.06 7.94" id="Vector_3" stroke="var(--stroke-0, #639BEC)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p3fc39080} id="Vector_4" stroke="var(--stroke-0, #639BEC)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.4 7.4L10 10" id="Vector_5" stroke="var(--stroke-0, #639BEC)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

export default function Frame1() {
  return (
    <div className="bg-[#323436] content-stretch flex gap-[6px] items-center overflow-clip pl-[6px] pr-[12px] py-[3px] relative rounded-[4px] size-full">
      <Frame2 />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic opacity-80 overflow-hidden relative shrink-0 text-[12px] text-ellipsis text-white tracking-[-0.24px]">TAB</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic opacity-80 overflow-hidden relative shrink-0 text-[12px] text-ellipsis text-white">to jump cut</p>
      <Frame />
      <div className="absolute bottom-[3px] flex items-center justify-center right-[6px] top-[3px] w-0">
        <div className="flex-none h-px rotate-90 w-[22px]">
          <div className="relative size-full">
            <div className="absolute inset-[-3px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 3">
                <line id="Line 3" stroke="var(--stroke-0, #639BEC)" strokeLinecap="round" strokeWidth="3" x1="1.5" x2="20.5" y1="1.5" y2="1.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}