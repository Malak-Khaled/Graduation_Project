export default function MedicalBackground() {
  const css = `
    @keyframes ecgDraw {
      0%   { stroke-dashoffset: 2000; opacity: 0; }
      10%  { opacity: 1; }
      80%  { stroke-dashoffset: 0; opacity: 1; }
      100% { stroke-dashoffset: 0; opacity: 0; }
    }
    @keyframes ecgDraw2 {
      0%   { stroke-dashoffset: 2000; opacity: 0; }
      15%  { opacity: 0.6; }
      80%  { stroke-dashoffset: 0; opacity: 0.6; }
      100% { stroke-dashoffset: 0; opacity: 0; }
    }
    @keyframes ecgDraw3 {
      0%   { stroke-dashoffset: 2000; opacity: 0; }
      20%  { opacity: 0.5; }
      80%  { stroke-dashoffset: 0; opacity: 0.5; }
      100% { stroke-dashoffset: 0; opacity: 0; }
    }
    @keyframes pulseDot {
      0%, 100% { opacity: 0.2; transform: scale(1); }
      50%       { opacity: 0.8; transform: scale(2); }
    }
    @keyframes floatY {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-12px); }
    }
    @keyframes floatY2 {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(10px); }
    }
    @keyframes fadeInOut {
      0%, 100% { opacity: 0; }
      40%, 60% { opacity: 1; }
    }
    @keyframes dashMove {
      to { stroke-dashoffset: -28; }
    }
    .ecg1 { stroke-dasharray: 2000; stroke-dashoffset: 2000; animation: ecgDraw  4s ease-in-out infinite; }
    .ecg2 { stroke-dasharray: 2000; stroke-dashoffset: 2000; animation: ecgDraw2 4s ease-in-out infinite; animation-delay: 1.5s; }
    .ecg3 { stroke-dasharray: 2000; stroke-dashoffset: 2000; animation: ecgDraw3 5s ease-in-out infinite; animation-delay: 3s; }
    .pdot1 { animation: pulseDot 2s ease-in-out infinite; transform-origin: center; }
    .pdot2 { animation: pulseDot 2.5s ease-in-out infinite; animation-delay: 0.8s; transform-origin: center; }
    .pdot3 { animation: pulseDot 3s ease-in-out infinite; animation-delay: 1.5s; transform-origin: center; }
    .fc1 { animation: floatY  6s ease-in-out infinite; }
    .fc2 { animation: floatY2 7s ease-in-out infinite; animation-delay: 1s; }
    .fc3 { animation: floatY  8s ease-in-out infinite; animation-delay: 3s; }
    .fc4 { animation: floatY2 5s ease-in-out infinite; animation-delay: 2s; }
    .fc5 { animation: floatY  6s ease-in-out infinite; animation-delay: 4s; }
    .fad1 { animation: fadeInOut 4s ease-in-out infinite; }
    .fad2 { animation: fadeInOut 5s ease-in-out infinite; animation-delay: 2s; }
    .fad3 { animation: fadeInOut 6s ease-in-out infinite; animation-delay: 1s; }
    .dash { stroke-dasharray: 8 6; animation: dashMove 2s linear infinite; }
  `;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <style>{css}</style>
      <svg width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#eff6ff" />
            <stop offset="50%"  stopColor="#f8faff" />
            <stop offset="100%" stopColor="#f0f9ff" />
          </linearGradient>
          <linearGradient id="eg1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#2563eb" stopOpacity="0" />
            <stop offset="30%"  stopColor="#2563eb" stopOpacity="0.5" />
            <stop offset="70%"  stopColor="#3b82f6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="eg2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#10b981" stopOpacity="0" />
            <stop offset="40%"  stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* خلفية */}
        <rect width="1440" height="900" fill="url(#bg)" />

        {/* شبكة */}
        {Array.from({ length: 18 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 50} x2="1440" y2={i * 50}
            stroke="#2563eb" strokeWidth="0.5" strokeOpacity="0.15" />
        ))}
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 60} y1="0" x2={i * 60} y2="900"
            stroke="#2563eb" strokeWidth="0.5" strokeOpacity="0.15" />
        ))}

        {/* خطوط منقطة */}
        <line className="dash" x1="0" y1="80"  x2="1440" y2="80"  stroke="#2563eb" strokeWidth="1" strokeOpacity="0.13" />
        <line className="dash" x1="0" y1="820" x2="1440" y2="820" stroke="#2563eb" strokeWidth="1" strokeOpacity="0.13" />

        {/* ECG line 1 - وسط (y=405) */}
        <path className="ecg1" fill="none" stroke="url(#eg1)" strokeWidth="3"
          d="M -50,405 L 72,405 L 115,405 L 130,365 L 144,445 L 158,295 L 172,520 L 187,405
             L 260,405 L 274,370 L 288,440 L 302,405
             L 432,405 L 475,405 L 490,355 L 504,445 L 518,280 L 532,530 L 546,405
             L 648,405 L 662,370 L 676,440 L 690,405
             L 864,405 L 907,405 L 922,360 L 936,448 L 950,290 L 964,520 L 978,405
             L 1080,405 L 1094,368 L 1108,442 L 1122,405
             L 1296,405 L 1339,405 L 1353,358 L 1367,450 L 1381,285 L 1395,525 L 1409,405
             L 1490,405" />

        {/* ECG line 2 - أعلى (y=198) */}
        <path className="ecg2" fill="none" stroke="url(#eg2)" strokeWidth="2.5"
          d="M -50,198 L 144,198 L 173,165 L 187,230 L 202,128 L 216,270 L 230,198
             L 403,198 L 418,165 L 432,230 L 446,198
             L 720,198 L 749,152 L 763,240 L 778,115 L 792,278 L 806,198
             L 1080,198 L 1094,165 L 1108,230 L 1122,198
             L 1440,198" />

        {/* ECG line 3 - أسفل (y=675) */}
        <path className="ecg3" fill="none" stroke="url(#eg1)" strokeWidth="2.5"
          d="M -50,675 L 216,675 L 245,630 L 259,718 L 274,562 L 288,788 L 302,675
             L 547,675 L 562,638 L 576,712 L 590,675
             L 893,675 L 907,625 L 921,722 L 936,558 L 950,792 L 964,675
             L 1224,675 L 1238,638 L 1252,712 L 1267,675
             L 1490,675" />

        {/* نقاط نابضة */}
        <circle className="pdot1" cx="158"  cy="405" r="4" fill="#2563eb" fillOpacity="0.7" />
        <circle className="pdot2" cx="518"  cy="405" r="4" fill="#2563eb" fillOpacity="0.7" />
        <circle className="pdot3" cx="950"  cy="405" r="4" fill="#2563eb" fillOpacity="0.6" />
        <circle className="pdot1" cx="778"  cy="198" r="3" fill="#10b981" fillOpacity="0.7" />
        <circle className="pdot2" cx="288"  cy="675" r="3" fill="#2563eb" fillOpacity="0.6" />
        <circle className="pdot3" cx="936"  cy="675" r="3" fill="#2563eb" fillOpacity="0.6" />

        {/* دوائر طبية */}
        <circle className="fad1" cx="72"   cy="135" r="70"  fill="none" stroke="#2563eb" strokeWidth="1"   strokeOpacity="0.15" />
        <circle className="fad1" cx="72"   cy="135" r="100" fill="none" stroke="#2563eb" strokeWidth="0.5" strokeOpacity="0.1" />
        <circle className="fad2" cx="1368" cy="765" r="90"  fill="none" stroke="#3b82f6" strokeWidth="1"   strokeOpacity="0.15" />
        <circle className="fad2" cx="1368" cy="765" r="120" fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.1" />
        <circle className="fad3" cx="720"  cy="45"  r="55"  fill="none" stroke="#10b981" strokeWidth="0.8" strokeOpacity="0.13" />

        {/* صلبان طبية عائمة */}
        <g className="fc1">
          <rect x="105" y="108" width="6"  height="22" rx="3" fill="#2563eb" fillOpacity="0.18" />
          <rect x="94"  y="119" width="28" height="6"  rx="3" fill="#2563eb" fillOpacity="0.18" />
        </g>
        <g className="fc2">
          <rect x="1282" y="693" width="8"  height="28" rx="4" fill="#2563eb" fillOpacity="0.16" />
          <rect x="1268" y="707" width="36" height="8"  rx="4" fill="#2563eb" fillOpacity="0.16" />
        </g>
        <g className="fc3">
          <rect x="36"  y="490" width="5"  height="18" rx="2" fill="#10b981" fillOpacity="0.2" />
          <rect x="27"  y="499" width="23" height="5"  rx="2" fill="#10b981" fillOpacity="0.2" />
        </g>
        <g className="fc4">
          <rect x="1390" y="342" width="6"  height="20" rx="3" fill="#2563eb" fillOpacity="0.16" />
          <rect x="1380" y="352" width="26" height="6"  rx="3" fill="#2563eb" fillOpacity="0.16" />
        </g>
        <g className="fc5">
          <rect x="706" y="855" width="5"  height="16" rx="2" fill="#3b82f6" fillOpacity="0.16" />
          <rect x="698" y="863" width="21" height="5"  rx="2" fill="#3b82f6" fillOpacity="0.16" />
        </g>
      </svg>
    </div>
  );
}