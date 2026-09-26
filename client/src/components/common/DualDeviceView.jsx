import React, { useState, useEffect } from 'react';
import StudentApp from '../student/StudentApp';
import { Smartphone, Laptop, Columns, Wifi, Battery, Sparkles } from 'lucide-react';

export default function DualDeviceView({ onOpenShopkeeperLogin }) {
  // Desktop display modes: 'split' (side-by-side), 'phone' (phone frame only), 'laptop' (laptop full only)
  const [displayMode, setDisplayMode] = useState('split');
  const [isRealMobile, setIsRealMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsRealMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // If user is actually on a smartphone, render native full-screen mobile app directly
  if (isRealMobile) {
    return (
      <div className="w-full h-full min-h-screen bg-[#FDF8EF]">
        <StudentApp onOpenShopkeeperLogin={onOpenShopkeeperLogin} />
      </div>
    );
  }

  // On Laptop / Desktop
  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5EEDB] overflow-hidden">
      {/* Device View Mode Switcher Header */}
      <div className="bg-[#1E1E1E]/95 backdrop-blur-md text-white px-4 py-2 border-b border-white/10 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[#F5A623] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Adaptive Student Interface
          </span>
          <span className="text-gray-500 text-[12px]">|</span>
          <span className="text-[11px] text-gray-300 hidden sm:inline">
            Scroll inside the phone frame or use the full laptop view
          </span>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center bg-black/40 p-1 rounded-full border border-white/10 text-[12px]">
          <button
            type="button"
            onClick={() => setDisplayMode('split')}
            className={`px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1.5 ${
              displayMode === 'split'
                ? 'bg-[#F5A623] text-white shadow-sm font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Side-by-side view"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>

          <button
            type="button"
            onClick={() => setDisplayMode('phone')}
            className={`px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1.5 ${
              displayMode === 'phone'
                ? 'bg-[#F5A623] text-white shadow-sm font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Interactive Phone frame only"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone Frame</span>
          </button>

          <button
            type="button"
            onClick={() => setDisplayMode('laptop')}
            className={`px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1.5 ${
              displayMode === 'laptop'
                ? 'bg-[#F5A623] text-white shadow-sm font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Full Laptop responsive layout"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Laptop View</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden p-4 md:p-6 gap-6 items-center justify-center">
        {/* ================= 1. PHONE FRAME (Scrollable) ================= */}
        {(displayMode === 'split' || displayMode === 'phone') && (
          <div className="flex flex-col items-center h-full max-h-[860px] shrink-0">
            <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#1E1E1E]">
              <Smartphone className="w-4 h-4 text-[#F5A623]" />
              <span>Mobile Phone View</span>
              <span className="text-[10px] bg-[#1E1E1E] text-white px-2 py-0.5 rounded-full font-mono">
                Scrollable
              </span>
            </div>

            {/* Realistic Smartphone Chassis */}
            <div className="w-[375px] h-[780px] max-h-[calc(100vh-140px)] bg-[#18181B] rounded-[50px] p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] ring-1 ring-white/20 relative flex flex-col overflow-hidden">
              {/* Top Dynamic Island / Speaker Pill */}
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#000000] rounded-full z-50 flex items-center justify-between px-3 pointer-events-none shadow-md">
                <div className="w-2.5 h-2.5 rounded-full bg-[#18181B] border border-white/10" />
                <div className="w-2 h-2 rounded-full bg-[#4CAF50] opacity-80" />
              </div>

              {/* Simulated Phone Status Bar */}
              <div className="w-full pt-1.5 px-6 pb-1 flex items-center justify-between text-[11px] font-semibold text-[#1E1E1E] bg-[#FDF8EF] z-40 select-none">
                <span>9:41</span>
                <div className="flex items-center gap-1.5 text-[#1E1E1E]">
                  <Wifi className="w-3 h-3" />
                  <Battery className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Phone Inner Viewport (Scrollable) */}
              <div className="w-full flex-1 bg-[#FDF8EF] rounded-b-[40px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 relative flex flex-col">
                <StudentApp isEmbedded={true} onOpenShopkeeperLogin={onOpenShopkeeperLogin} />
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/30 rounded-full pointer-events-none z-50" />
            </div>
          </div>
        )}

        {/* ================= 2. LAPTOP VIEW ================= */}
        {(displayMode === 'split' || displayMode === 'laptop') && (
          <div className="flex-1 flex flex-col h-full max-h-[860px] min-w-0">
            <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#1E1E1E]">
              <Laptop className="w-4 h-4 text-[#F5A623]" />
              <span>Laptop / Desktop View</span>
              <span className="text-[10px] bg-[#4CAF50] text-white px-2 py-0.5 rounded-full font-mono">
                Full Width
              </span>
            </div>

            {/* Laptop Window Shell */}
            <div className="flex-1 bg-white rounded-[20px] shadow-2xl border border-[#1E1E1E]/15 overflow-hidden flex flex-col">
              {/* Browser Window Header */}
              <div className="h-10 bg-[#1E1E1E] px-4 flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                {/* Simulated URL bar */}
                <div className="flex-1 max-w-md mx-auto bg-white/10 rounded-lg px-3 py-1 text-[11px] text-gray-300 text-center font-mono truncate">
                  https://printflow.campus.edu/student
                </div>
              </div>

              {/* Laptop Inner App */}
              <div className="flex-1 overflow-y-auto bg-[#FDF8EF]">
                <StudentApp isEmbedded={false} onOpenShopkeeperLogin={onOpenShopkeeperLogin} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}