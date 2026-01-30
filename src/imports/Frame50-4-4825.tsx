import svgPaths from "./svg-btbamcapbb";
import imgRectangle2 from "../assets/7b87221e4e0f043fc97c0e8324639f09109205ab.png";

function Frame() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Frame">
          <path d="M4.16667 10H15.8333" id="Vector" stroke="var(--stroke-0, #888888)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M10 4.16667V15.8333" id="Vector_2" stroke="var(--stroke-0, #888888)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_1_1948)" id="Frame">
          <path d="M8 4V8H5.33333" id="Vector" stroke="var(--stroke-0, #888888)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p39ee6532} id="Vector_2" stroke="var(--stroke-0, #888888)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
        <defs>
          <clipPath id="clip0_1_1948">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[20px]">
      <Frame1 />
    </div>
  );
}

function Frame51() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
      <Frame />
      <Frame12 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex gap-[14px] items-center relative shrink-0">
      <Frame51 />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#888] text-[13px] text-center w-[37px] whitespace-pre-wrap">Hide</p>
    </div>
  );
}

function Frame11() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pl-[2px] relative w-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#eee] text-[14px] tracking-[-0.14px]">Add Latest Log Explorer Demo</p>
          <Frame10 />
        </div>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Frame">
          <path d={svgPaths.p117ac380} id="Vector" stroke="var(--stroke-0, #545454)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
          <path d={svgPaths.p1a36fd80} id="Vector_2" stroke="var(--stroke-0, #545454)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
        </g>
      </svg>
    </div>
  );
}

function Frame5() {
  return (
    <div className="bg-[#212121] h-[34px] relative rounded-[8px] shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[4px] items-center pl-[12px] pr-[8px] py-[8px] relative size-full">
          <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[18px] min-h-px min-w-px not-italic relative text-[14px] text-white tracking-[-0.14px] whitespace-pre-wrap">can you add the latest log explorer demo</p>
          <Frame2 />
        </div>
      </div>
    </div>
  );
}

function Frame6() {
  return (
    <div className="bg-[#1f1f1f] content-stretch flex h-[21px] items-center justify-center px-[6px] py-px relative rounded-[4px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#353535] border-solid inset-[-0.5px] pointer-events-none rounded-[4.5px]" />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[#888] text-[13px]">Search team library</p>
    </div>
  );
}

function Frame7() {
  return (
    <div className="bg-[#1f1f1f] content-stretch flex h-[21px] items-center justify-center px-[6px] py-px relative rounded-[4px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#353535] border-solid inset-[-0.5px] pointer-events-none rounded-[4.5px]" />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[#888] text-[13px]">Add from team library</p>
    </div>
  );
}

function Frame8() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[13px] items-start px-[10px] relative w-full">
        <Frame6 />
        <Frame7 />
        <p className="font-['Inter:Regular',sans-serif] font-normal h-[99px] leading-[18px] not-italic relative shrink-0 text-[14px] text-white tracking-[-0.14px] w-full whitespace-pre-wrap">Perfect! I’ve added the latest Log Explorer demo to your project. It shows searching for shopping cart events and switching between bar and heatmap visualizations. The demo starts right after your intro slide at 3.95 seconds.</p>
      </div>
    </div>
  );
}

function Frame9() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full">
      <div className="flex flex-col items-center justify-end size-full">
        <div className="content-stretch flex flex-col gap-[13px] items-center justify-end pr-[6px] relative size-full">
          <Frame5 />
          <Frame8 />
        </div>
      </div>
    </div>
  );
}

function Frame14() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Frame">
          <path d={svgPaths.p1c08d800} id="Vector" stroke="var(--stroke-0, #8F9192)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Frame19() {
  return (
    <div className="absolute bg-[#323436] bottom-[8px] content-stretch flex gap-[4px] h-[28px] items-center left-[8.5px] overflow-clip pl-[6px] pr-[10px] py-[3px] rounded-[4px]">
      <Frame14 />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic opacity-80 overflow-hidden relative shrink-0 text-[12px] text-ellipsis text-white">Agent</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute bg-[#2c2e30] h-[80px] left-0 rounded-[4px] top-0 w-[364px]">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Frame19 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#718bd1] border-solid inset-[-0.5px] pointer-events-none rounded-[4.5px]" />
    </div>
  );
}

function Frame15() {
  return (
    <div className="absolute left-[337px] size-[19px] top-[53px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 19">
        <g id="Frame 3">
          <circle cx="9.5" cy="9.5" fill="var(--fill-0, #535556)" id="Ellipse 1" r="9.5" />
          <g id="Frame">
            <path d={svgPaths.p31fea780} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d="M9.5 13.5833V5.41667" id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame4() {
  return (
    <div className="h-[80px] relative shrink-0 w-[364px]">
      <Frame3 />
      <div className="absolute flex h-[16px] items-center justify-center left-[10px] top-[8px] w-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[16px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 1">
                <line id="Line 1" stroke="var(--stroke-0, #D1D3D4)" x2="16" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[11px] not-italic text-[#777] text-[14px] top-[7px] tracking-[-0.14px]">Ask, edit, or make something...</p>
      <Frame15 />
    </div>
  );
}

function Frame13() {
  return (
    <div className="absolute bg-[#1a1a1a] bottom-0 content-stretch flex flex-col gap-[16px] h-[533px] items-center p-[11px] right-0 rounded-[6px] w-[379px]">
      <div aria-hidden="true" className="absolute border border-[#222426] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <Frame11 />
      <Frame9 />
      <Frame4 />
    </div>
  );
}

function Frame47() {
  return (
    <div className="h-[540px] relative shrink-0 w-[388px]">
      <Frame13 />
    </div>
  );
}

function Frame16() {
  return (
    <div className="absolute left-0 size-[14px] top-[2px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Frame">
          <path d="M8.75 2.91667H12.25" id="Vector" stroke="var(--stroke-0, #BCBCBE)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M8.75 7H12.25" id="Vector_2" stroke="var(--stroke-0, #BCBCBE)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M1.75 11.0833H12.25" id="Vector_3" stroke="var(--stroke-0, #BCBCBE)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.pe94f680} id="Vector_4" stroke="var(--stroke-0, #BCBCBE)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M2.28667 5.83333H5.88" id="Vector_5" stroke="var(--stroke-0, #BCBCBE)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Frame41() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[18px] left-1/2 top-[calc(50%+0.5px)] w-[124px]">
      <Frame16 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-[21px] not-italic text-[#f2f3f7] text-[14px] top-0 tracking-[-0.14px]">Shuffle Content</p>
    </div>
  );
}

function Frame42() {
  return (
    <div className="-translate-x-1/2 absolute bg-[#181a1f] h-[27px] left-[calc(50%+0.5px)] rounded-[4px] top-[463px] w-[180px]">
      <Frame41 />
    </div>
  );
}

function Frame36() {
  return (
    <div className="absolute content-stretch flex font-['Inter:Regular',sans-serif] font-normal gap-px items-center leading-[0] left-[76px] not-italic text-[14px] text-ellipsis top-[5px] tracking-[0.14px] whitespace-nowrap">
      <div className="flex flex-col justify-center overflow-hidden relative shrink-0 text-[#ddd] w-[75px]">
        <p className="leading-[normal] overflow-hidden">00:00:56</p>
      </div>
      <div className="flex flex-col justify-center overflow-hidden relative shrink-0 text-[#777] w-[75px]">
        <p className="leading-[normal] overflow-hidden">00:21:43</p>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[8px] left-[calc(50%+0.08px)] top-1/2 w-[14.833px]">
      <div className="absolute inset-[-9.38%_-5.06%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.3335 9.50019">
          <g id="Group 2">
            <path d={svgPaths.p3c5ef800} id="Vector" stroke="var(--stroke-0, #BCBCBE)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <g id="Group 1">
              <path d={svgPaths.p1163aa0} id="Vector_2" stroke="var(--stroke-0, #BCBCBE)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              <path d="M1.66686 6.75H7.16687" id="Vector_3" stroke="var(--stroke-0, #BCBCBE)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame17() {
  return (
    <div className="h-[18px] relative rounded-[2px] shrink-0 w-[24px]" data-name="Frame">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Group />
      </div>
      <div aria-hidden="true" className="absolute border-[#bcbcbe] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[2px]" />
    </div>
  );
}

function Frame18() {
  return (
    <div className="col-1 h-[18px] ml-0 mt-0 relative row-1 w-[24px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 18">
        <g id="Frame">
          <rect height="16.5" rx="1.25" stroke="var(--stroke-0, #BCBCBE)" strokeWidth="1.5" width="22.5" x="0.75" y="0.75" />
          <circle cx="12" cy="9" fill="var(--fill-0, #BCBCBE)" id="Ellipse 2" r="5" />
        </g>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <Frame18 />
    </div>
  );
}

function Group3() {
  return (
    <div className="h-[17px] relative shrink-0 w-[20px]">
      <div className="absolute inset-[-4.41%_-3.75%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.5 18.5">
          <g id="Group 5">
            <path d={svgPaths.p381d1b80} id="Rectangle 3" stroke="var(--stroke-0, #BCBCBE)" strokeLinecap="round" strokeWidth="1.5" />
            <path d={svgPaths.p2482fc00} id="Vector" stroke="var(--stroke-0, #BCBCBE)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame35() {
  return (
    <div className="absolute content-stretch flex gap-[30px] items-end left-[344px] top-[4px]">
      <Frame17 />
      <Group1 />
      <Group3 />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-[344px] top-[4px]">
      <Frame35 />
    </div>
  );
}

function Frame40() {
  return (
    <div className="absolute h-[28px] left-0 top-0 w-[54px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 54 28">
        <g id="Frame 40">
          <rect fill="var(--fill-0, #25252A)" height="28" rx="2" width="54" />
          <path d={svgPaths.pd0a8b00} fill="var(--fill-0, #F0F0F3)" id="Vector 2" />
        </g>
      </svg>
    </div>
  );
}

function Frame20() {
  return (
    <div className="absolute left-[797px] size-[18px] top-[4px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Frame">
          <path d={svgPaths.p3f4e600} id="Vector" stroke="var(--stroke-0, #BDBDBF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p27cf2000} id="Vector_2" stroke="var(--stroke-0, #BDBDBF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p38a06840} id="Vector_3" stroke="var(--stroke-0, #BDBDBF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Frame43() {
  return (
    <div className="absolute h-[28px] left-0 top-[500px] w-[472px]">
      <Frame36 />
      <Group2 />
      <Frame40 />
      <Frame20 />
    </div>
  );
}

function Frame44() {
  return (
    <div className="absolute bottom-px h-[524px] right-[13px] w-[815px]">
      <div className="absolute h-[456px] left-[2px] rounded-[2px] top-0 w-[813px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[2px] size-full" src={imgRectangle2} />
      </div>
      <Frame42 />
      <Frame43 />
    </div>
  );
}

function Frame45() {
  return (
    <div className="h-[540px] relative shrink-0 w-[842px]">
      <Frame44 />
    </div>
  );
}

function Frame48() {
  return (
    <div className="content-stretch flex h-[546px] items-start justify-between relative shrink-0 w-full">
      <Frame47 />
      <Frame45 />
    </div>
  );
}

function Frame39() {
  return <div className="absolute bg-[#201f22] border border-[#282829] border-solid bottom-[22px] h-[36px] left-[16px] right-[-42px] rounded-[3px]" />;
}

function Frame37() {
  return <div className="absolute bg-[#201f22] border border-[#282829] border-solid bottom-[107px] h-[36px] left-[16px] right-[-42px] rounded-[3px]" />;
}

function Frame38() {
  return <div className="absolute bg-[#201f22] border border-[#282829] border-solid bottom-[65px] h-[36px] left-[16px] right-[-42px] rounded-[3px]" />;
}

function Frame23() {
  return (
    <div className="h-[7px] relative shrink-0 w-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7">
        <g id="Frame 17">
          <line id="Line 5" stroke="var(--stroke-0, #2C2C2C)" strokeLinecap="round" strokeWidth="1.5" x1="7.75" x2="7.75" y1="0.75" y2="6.25" />
        </g>
      </svg>
    </div>
  );
}

function Frame24() {
  return (
    <div className="h-[7px] relative shrink-0 w-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7">
        <g id="Frame 17">
          <line id="Line 5" stroke="var(--stroke-0, #2C2C2C)" strokeLinecap="round" strokeWidth="1.5" x1="7.75" x2="7.75" y1="0.75" y2="6.25" />
        </g>
      </svg>
    </div>
  );
}

function Frame25() {
  return (
    <div className="h-[7px] relative shrink-0 w-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7">
        <g id="Frame 17">
          <line id="Line 5" stroke="var(--stroke-0, #2C2C2C)" strokeLinecap="round" strokeWidth="1.5" x1="7.75" x2="7.75" y1="0.75" y2="6.25" />
        </g>
      </svg>
    </div>
  );
}

function Frame26() {
  return (
    <div className="h-[7px] relative shrink-0 w-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7">
        <g id="Frame 17">
          <line id="Line 5" stroke="var(--stroke-0, #2C2C2C)" strokeLinecap="round" strokeWidth="1.5" x1="7.75" x2="7.75" y1="0.75" y2="6.25" />
        </g>
      </svg>
    </div>
  );
}

function Frame27() {
  return (
    <div className="h-[7px] relative shrink-0 w-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7">
        <g id="Frame 17">
          <line id="Line 5" stroke="var(--stroke-0, #2C2C2C)" strokeLinecap="round" strokeWidth="1.5" x1="7.75" x2="7.75" y1="0.75" y2="6.25" />
        </g>
      </svg>
    </div>
  );
}

function Frame28() {
  return (
    <div className="h-[7px] relative shrink-0 w-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7">
        <g id="Frame 17">
          <line id="Line 5" stroke="var(--stroke-0, #2C2C2C)" strokeLinecap="round" strokeWidth="1.5" x1="7.75" x2="7.75" y1="0.75" y2="6.25" />
        </g>
      </svg>
    </div>
  );
}

function Frame29() {
  return (
    <div className="h-[7px] relative shrink-0 w-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7">
        <g id="Frame 17">
          <line id="Line 5" stroke="var(--stroke-0, #2C2C2C)" strokeLinecap="round" strokeWidth="1.5" x1="7.75" x2="7.75" y1="0.75" y2="6.25" />
        </g>
      </svg>
    </div>
  );
}

function Frame30() {
  return (
    <div className="h-[7px] relative shrink-0 w-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7">
        <g id="Frame 17">
          <line id="Line 5" stroke="var(--stroke-0, #2C2C2C)" strokeLinecap="round" strokeWidth="1.5" x1="7.75" x2="7.75" y1="0.75" y2="6.25" />
        </g>
      </svg>
    </div>
  );
}

function Frame31() {
  return (
    <div className="h-[7px] relative shrink-0 w-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7">
        <g id="Frame 17">
          <line id="Line 5" stroke="var(--stroke-0, #2C2C2C)" strokeLinecap="round" strokeWidth="1.5" x1="7.75" x2="7.75" y1="0.75" y2="6.25" />
        </g>
      </svg>
    </div>
  );
}

function Frame32() {
  return (
    <div className="h-[7px] relative shrink-0 w-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7">
        <g id="Frame 17">
          <line id="Line 5" stroke="var(--stroke-0, #2C2C2C)" strokeLinecap="round" strokeWidth="1.5" x1="7.75" x2="7.75" y1="0.75" y2="6.25" />
        </g>
      </svg>
    </div>
  );
}

function Frame33() {
  return (
    <div className="h-[7px] relative shrink-0 w-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7">
        <g id="Frame 17">
          <line id="Line 5" stroke="var(--stroke-0, #2C2C2C)" strokeLinecap="round" strokeWidth="1.5" x1="7.75" x2="7.75" y1="0.75" y2="6.25" />
        </g>
      </svg>
    </div>
  );
}

function Frame34() {
  return (
    <div className="h-[7px] relative shrink-0 w-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7">
        <g id="Frame 17">
          <line id="Line 5" stroke="var(--stroke-0, #2C2C2C)" strokeLinecap="round" strokeWidth="1.5" x1="7.75" x2="7.75" y1="0.75" y2="6.25" />
        </g>
      </svg>
    </div>
  );
}

function Frame52() {
  return (
    <div className="h-[7px] relative shrink-0 w-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7">
        <g id="Frame 17">
          <line id="Line 5" stroke="var(--stroke-0, #2C2C2C)" strokeLinecap="round" strokeWidth="1.5" x1="7.75" x2="7.75" y1="0.75" y2="6.25" />
        </g>
      </svg>
    </div>
  );
}

function Frame53() {
  return (
    <div className="h-[7px] relative shrink-0 w-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7">
        <g id="Frame 17">
          <line id="Line 5" stroke="var(--stroke-0, #2C2C2C)" strokeLinecap="round" strokeWidth="1.5" x1="7.75" x2="7.75" y1="0.75" y2="6.25" />
        </g>
      </svg>
    </div>
  );
}

function Frame54() {
  return (
    <div className="h-[7px] relative shrink-0 w-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7">
        <g id="Frame 17">
          <line id="Line 5" stroke="var(--stroke-0, #2C2C2C)" strokeLinecap="round" strokeWidth="1.5" x1="7.75" x2="7.75" y1="0.75" y2="6.25" />
        </g>
      </svg>
    </div>
  );
}

function Frame55() {
  return (
    <div className="h-[7px] relative shrink-0 w-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7">
        <g id="Frame 17">
          <line id="Line 5" stroke="var(--stroke-0, #2C2C2C)" strokeLinecap="round" strokeWidth="1.5" x1="7.75" x2="7.75" y1="0.75" y2="6.25" />
        </g>
      </svg>
    </div>
  );
}

function Frame22() {
  return (
    <div className="absolute bottom-[161px] content-stretch flex gap-[44px] items-center left-[15px] right-[41px]">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#777] text-[11px] text-center tracking-[0.11px] w-[14px]">
        <p className="leading-[normal] whitespace-pre-wrap">0</p>
      </div>
      <Frame23 />
      <Frame24 />
      <Frame25 />
      <Frame26 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#777] text-[11px] text-center tracking-[0.11px] w-[14px]">
        <p className="leading-[normal] whitespace-pre-wrap">05</p>
      </div>
      <Frame27 />
      <Frame28 />
      <Frame29 />
      <Frame30 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#777] text-[11px] text-center tracking-[0.11px] w-[14px]">
        <p className="leading-[normal] whitespace-pre-wrap">10</p>
      </div>
      <Frame31 />
      <Frame32 />
      <Frame33 />
      <Frame34 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#777] text-[11px] text-center tracking-[0.11px] w-[14px]">
        <p className="leading-[normal] whitespace-pre-wrap">15</p>
      </div>
      <Frame52 />
      <Frame53 />
      <Frame54 />
      <Frame55 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#777] text-[11px] text-center tracking-[0.11px] w-[14px]">
        <p className="leading-[normal] whitespace-pre-wrap">20</p>
      </div>
    </div>
  );
}

function Frame57() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[5px] items-center min-h-px min-w-px relative">
      <div className="h-[14px] relative shrink-0 w-[18px]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 14">
          <g id="Vector">
            <path d={svgPaths.pf137a80} fill="var(--fill-0, #93BCFC)" />
            <path d={svgPaths.p251fcf80} fill="var(--fill-0, #93BCFC)" />
          </g>
        </svg>
      </div>
      <p className="flex-[1_0_0] font-['Inter:Medium',sans-serif] font-medium leading-[18px] min-h-px min-w-px not-italic opacity-80 overflow-hidden relative text-[14px] text-ellipsis text-white tracking-[-0.14px] whitespace-nowrap">Introducing Log Explorer</p>
    </div>
  );
}

function Frame56() {
  return (
    <div className="absolute bg-[#1c77e9] bottom-[107px] h-[36px] left-[16px] right-[1426px] rounded-[3px]">
      <div className="content-stretch flex gap-[7px] items-center overflow-clip px-[9px] py-[3px] relative rounded-[inherit] size-full">
        <Frame57 />
        <div className="absolute bottom-[3px] flex items-center justify-center right-[6px] top-[3px] w-0">
          <div className="flex-none h-px rotate-90 w-[30px]">
            <div className="relative size-full">
              <div className="absolute inset-[-3px_0_0_0]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 3">
                  <line id="Line 3" stroke="var(--stroke-0, #639BEC)" strokeLinecap="round" strokeWidth="3" x1="1.5" x2="28.5" y1="1.5" y2="1.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-[3px] flex items-center justify-center left-[3px] top-[3px] w-0">
          <div className="flex-none h-px rotate-90 w-[30px]">
            <div className="relative size-full">
              <div className="absolute inset-[-3px_0_0_0]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 3">
                  <line id="Line 2" stroke="var(--stroke-0, #639BEC)" strokeLinecap="round" strokeWidth="3" x1="1.5" x2="28.5" y1="1.5" y2="1.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#6298ec] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[3px]" />
    </div>
  );
}

function Frame59() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[206px]">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic opacity-80 relative shrink-0 text-[14px] text-white tracking-[-0.14px]">Google Chrome Log Explorer Demo</p>
    </div>
  );
}

function Frame58() {
  return (
    <div className="absolute bg-[#564aac] bottom-[65px] h-[36px] left-[245px] right-[-42px] rounded-[3px]">
      <div className="content-stretch flex items-center overflow-clip px-[11px] py-[3px] relative rounded-[inherit] size-full">
        <Frame59 />
      </div>
      <div aria-hidden="true" className="absolute border-[#9287e2] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[3px]" />
    </div>
  );
}

function Frame61() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#1f1f1f] h-[21px] left-[109px] rounded-[4px] top-[calc(50%+0.5px)] w-[29px]">
      <div aria-hidden="true" className="absolute border border-[#353535] border-solid inset-[-0.5px] pointer-events-none rounded-[4.5px]" />
    </div>
  );
}

function Frame60() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative">
      <Frame61 />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[0] left-0 not-italic opacity-80 overflow-hidden text-[#888] text-[14px] text-ellipsis top-0 tracking-[-0.21px]">
        <span className="leading-[18px] text-[#67676b]">{`Log `}</span>
        <span className="leading-[18px] text-[#67676b]">explorer</span>
        <span className="leading-[18px] text-[#67676b]">{` `}</span>
        <span className="leading-[18px] text-[#67676b]">lets</span>
        <span className="leading-[18px] text-[#67676b]">{` `}</span>
        <span className="leading-[18px] text-white">you</span>
        <span className="leading-[18px] text-[#67676b]">{` query logs, traces, and ingested events from a single interface.`}</span>
      </p>
    </div>
  );
}

function Script() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#2d2c36] h-[28px] left-[2px] rounded-[1px] top-1/2 w-[259px]" data-name="Script 1">
      <div className="content-stretch flex items-center overflow-clip px-[4px] py-[3px] relative rounded-[inherit] size-full">
        <Frame60 />
      </div>
      <div aria-hidden="true" className="absolute border-[#36353f] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[1px]" />
    </div>
  );
}

function Frame62() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#2d2c36] h-[28px] left-[345px] rounded-[1px] top-1/2 w-[83px]">
      <div className="content-stretch flex items-center overflow-clip px-[4px] py-[3px] relative rounded-[inherit] size-full">
        <p className="flex-[1_0_0] font-['Inter:Medium',sans-serif] font-medium leading-[18px] min-h-px min-w-px not-italic opacity-80 overflow-hidden relative text-[14px] text-ellipsis text-white tracking-[-0.21px] whitespace-nowrap">{`Then "shopping card opened"`}</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#36353f] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[1px]" />
    </div>
  );
}

function Frame64() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px overflow-clip relative">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic opacity-80 overflow-hidden relative shrink-0 text-[14px] text-ellipsis text-white tracking-[-0.21px]">We can explore and try out different data visualizations…</p>
    </div>
  );
}

function Frame65() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-end min-h-px min-w-px overflow-clip relative">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic opacity-80 relative shrink-0 text-[14px] text-white tracking-[-0.21px]">We can explore and try out different data visualizations</p>
    </div>
  );
}

function Frame63() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#2d2c36] h-[28px] left-[443px] rounded-[1px] top-1/2 w-[153px]">
      <div className="content-stretch flex items-center overflow-clip px-[4px] py-[3px] relative rounded-[inherit] size-full">
        <Frame64 />
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic opacity-80 overflow-hidden relative shrink-0 text-[14px] text-ellipsis text-white tracking-[-0.21px]">…</p>
        <Frame65 />
      </div>
      <div aria-hidden="true" className="absolute border-[#36353f] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[1px]" />
    </div>
  );
}

function Frame66() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#2d2c36] h-[28px] left-[276px] rounded-[1px] top-1/2 w-[54px]">
      <div className="content-stretch flex items-center overflow-clip px-[4px] py-[3px] relative rounded-[inherit] size-full">
        <p className="flex-[1_0_0] font-['Inter:Medium',sans-serif] font-medium leading-[18px] min-h-px min-w-px not-italic opacity-80 overflow-hidden relative text-[14px] text-ellipsis text-white tracking-[-0.21px] whitespace-nowrap">{`Let's try out search...`}</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#36353f] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[1px]" />
    </div>
  );
}

function Frame67() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#2d2c36] h-[28px] left-[611px] rounded-[1px] top-1/2 w-[44px]">
      <div className="content-stretch flex items-center overflow-clip px-[4px] py-[3px] relative rounded-[inherit] size-full">
        <p className="flex-[1_0_0] font-['Inter:Medium',sans-serif] font-medium leading-[18px] min-h-px min-w-px not-italic opacity-80 overflow-hidden relative text-[14px] text-ellipsis text-white tracking-[-0.21px] whitespace-nowrap">Here’s the heat map.</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#36353f] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[1px]" />
    </div>
  );
}

function Frame69() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px overflow-clip relative">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic opacity-80 overflow-hidden relative shrink-0 text-[14px] text-ellipsis text-white tracking-[-0.21px]">The heat map is also where we can see full segmentation results across the totality of data streams.</p>
    </div>
  );
}

function Frame70() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-end min-h-px min-w-px overflow-clip relative">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic opacity-80 relative shrink-0 text-[14px] text-white tracking-[-0.21px]">The heat map is also where we can see full segmentation results across the totality of data streams.</p>
    </div>
  );
}

function Frame68() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#2d2c36] h-[28px] left-[670px] rounded-[1px] top-1/2 w-[574px]">
      <div className="content-stretch flex items-center overflow-clip px-[4px] py-[3px] relative rounded-[inherit] size-full">
        <Frame69 />
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic opacity-80 overflow-hidden relative shrink-0 text-[14px] text-ellipsis text-white tracking-[-0.21px]">…</p>
        <Frame70 />
      </div>
      <div aria-hidden="true" className="absolute border-[#36353f] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[1px]" />
    </div>
  );
}

function ScriptReel() {
  return (
    <div className="absolute bg-[#222227] bottom-[23px] h-[36px] left-[16px] right-0 rounded-[4px]" data-name="Script reel">
      <div aria-hidden="true" className="absolute border border-[#35353a] border-solid inset-[-0.5px] pointer-events-none rounded-[4.5px]" />
      <Script />
      <Frame62 />
      <Frame63 />
      <Frame66 />
      <Frame67 />
      <Frame68 />
    </div>
  );
}

function Playhead() {
  return (
    <div className="absolute bottom-0 h-[184px] left-[13px] right-[1647px]" data-name="Playhead">
      <div className="absolute h-[17px] left-0 top-0 w-[11px]">
        <div className="absolute inset-[0_-9.09%_-9.33%_-9.09%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 18.5857">
            <g filter="url(#filter0_d_1_1914)" id="Vector 1">
              <path d={svgPaths.pd0d8980} fill="var(--fill-0, #FAFAFA)" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="18.5857" id="filter0_d_1_1914" width="13" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dy="1" />
                <feGaussianBlur stdDeviation="0.5" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_1914" />
                <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_1914" mode="normal" result="shape" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <div className="absolute flex h-[168px] items-center justify-center left-[5px] top-[16px] w-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[168px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 168 1">
                <line id="Line 4" stroke="var(--stroke-0, #FCFCFC)" x2="168" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Ghosthead() {
  return (
    <div className="absolute bottom-0 h-[184px] left-[68px] opacity-30 right-[1592px]" data-name="Ghosthead">
      <div className="absolute h-[17px] left-0 top-0 w-[11px]">
        <div className="absolute inset-[0_-9.09%_-9.33%_-9.09%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 18.5857">
            <g filter="url(#filter0_d_1_1914)" id="Vector 1">
              <path d={svgPaths.pd0d8980} fill="var(--fill-0, #FAFAFA)" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="18.5857" id="filter0_d_1_1914" width="13" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dy="1" />
                <feGaussianBlur stdDeviation="0.5" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_1914" />
                <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_1914" mode="normal" result="shape" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <div className="absolute flex h-[168px] items-center justify-center left-[5px] top-[16px] w-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[168px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 168 1">
                <line id="Line 4" stroke="var(--stroke-0, #FCFCFC)" x2="168" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hover() {
  return <div className="absolute h-[192px] left-[13px] top-[-1px] w-[11px]" data-name="hover-01" />;
}

function Hover1() {
  return <div className="absolute h-[192px] left-[24px] top-[-1px] w-[11px]" data-name="hover-02" />;
}

function Hover2() {
  return <div className="absolute h-[192px] left-[35px] top-[-1px] w-[11px]" data-name="hover-03" />;
}

function Hover3() {
  return <div className="absolute h-[192px] left-[46px] top-[-1px] w-[11px]" data-name="hover-04" />;
}

function Hover4() {
  return <div className="absolute h-[192px] left-[57px] top-[-1px] w-[11px]" data-name="hover-05" />;
}

function Hover5() {
  return <div className="absolute h-[192px] left-[68px] top-[-1px] w-[11px]" data-name="hover-06" />;
}

function Hover6() {
  return <div className="absolute h-[192px] left-[79px] top-[-1px] w-[11px]" data-name="hover-07" />;
}

function Hover7() {
  return <div className="absolute h-[192px] left-[90px] top-[-1px] w-[11px]" data-name="hover-08" />;
}

function Hover8() {
  return <div className="absolute h-[192px] left-[101px] top-[-1px] w-[11px]" data-name="hover-09" />;
}

function Hover9() {
  return <div className="absolute h-[192px] left-[112px] top-[-1px] w-[11px]" data-name="hover-10" />;
}

function Hover10() {
  return <div className="absolute h-[192px] left-[123px] top-[-1px] w-[11px]" data-name="hover-11" />;
}

function Hover11() {
  return <div className="absolute h-[192px] left-[134px] top-[-1px] w-[11px]" data-name="hover-12" />;
}

function Hover12() {
  return <div className="absolute h-[192px] left-[145px] top-[-1px] w-[11px]" data-name="hover-13" />;
}

function Hover13() {
  return <div className="absolute h-[192px] left-[156px] top-[-1px] w-[11px]" data-name="hover-14" />;
}

function Hover14() {
  return <div className="absolute h-[192px] left-[167px] top-[-1px] w-[11px]" data-name="hover-15" />;
}

function Hover15() {
  return <div className="absolute h-[192px] left-[178px] top-[-1px] w-[11px]" data-name="hover-16" />;
}

function Hover16() {
  return <div className="absolute h-[192px] left-[189px] top-[-1px] w-[11px]" data-name="hover-17" />;
}

function Hover17() {
  return <div className="absolute h-[192px] left-[200px] top-[-1px] w-[11px]" data-name="hover-18" />;
}

function Hover18() {
  return <div className="absolute h-[192px] left-[211px] top-[-1px] w-[11px]" data-name="hover-19" />;
}

function Hover19() {
  return <div className="absolute h-[192px] left-[222px] top-[-1px] w-[11px]" data-name="hover-20" />;
}

function Hover20() {
  return <div className="absolute h-[192px] left-[233px] top-[-1px] w-[11px]" data-name="hover-21" />;
}

function Frame21() {
  return (
    <div className="absolute bg-[#171717] border-[#25272b] border-solid border-t bottom-0 h-[192px] left-0 overflow-clip w-[1671px]">
      <Frame39 />
      <Frame37 />
      <Frame38 />
      <Frame22 />
      <Frame56 />
      <Frame58 />
      <ScriptReel />
      <Playhead />
      <Ghosthead />
      <Hover />
      <Hover1 />
      <Hover2 />
      <Hover3 />
      <Hover4 />
      <Hover5 />
      <Hover6 />
      <Hover7 />
      <Hover8 />
      <Hover9 />
      <Hover10 />
      <Hover11 />
      <Hover12 />
      <Hover13 />
      <Hover14 />
      <Hover15 />
      <Hover16 />
      <Hover17 />
      <Hover18 />
      <Hover19 />
      <Hover20 />
    </div>
  );
}

function Frame46() {
  return (
    <div className="absolute bottom-0 h-[199px] left-0 right-0">
      <Frame21 />
    </div>
  );
}

function Frame49() {
  return (
    <div className="h-[199px] overflow-x-auto overflow-y-clip relative shrink-0 w-[1230px]">
      <Frame46 />
    </div>
  );
}

function Frame72() {
  return (
    <div className="absolute bg-[#1f1f1f] h-[21px] left-[3px] rounded-[4px] top-[3.5px] w-[29px]">
      <div aria-hidden="true" className="absolute border border-[#353535] border-solid inset-[-0.5px] pointer-events-none rounded-[4.5px]" />
    </div>
  );
}

function Frame73() {
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

function Frame71() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#323436] content-stretch flex gap-[6px] h-[28px] items-center left-[1097px] overflow-clip pl-[6px] pr-[12px] py-[3px] rounded-[4px] top-[calc(50%+247.5px)]">
      <Frame72 />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic opacity-80 overflow-hidden relative shrink-0 text-[12px] text-ellipsis text-white tracking-[-0.24px]">TAB</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic opacity-80 overflow-hidden relative shrink-0 text-[12px] text-ellipsis text-white">to jump cut</p>
      <Frame73 />
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

export default function Frame50() {
  return (
    <div className="bg-[#0e1015] content-stretch flex flex-col items-start overflow-clip relative rounded-[18px] size-full">
      <Frame48 />
      <Frame49 />
      <Frame71 />
    </div>
  );
}