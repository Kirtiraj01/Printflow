import React, { useState, useEffect } from 'react';
import { ArrowLeft, QrCode, Camera, CheckCircle2, Sparkles } from 'lucide-react';

export default function StudentScan({ onBack, onScanSuccess }) {
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    // Auto-detect simulation after 2 seconds for a realistic demo feel
    const timer = setTimeout(() => {
      setScanning(false);
      setTimeout(() => {
        onScanSuccess();
      }, 600);
    }, 2200);

    return () => clearTimeout(timer);
  }, [onScanSuccess]);

  return (
    <div className="flex flex-col h-full min-h-[500px] justify-between pb-6 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-[#1E1E1E] hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-[20px] font-semibold text-[#1E1E1E]">Scan counter QR</h2>
            <p className="text-[13px] text-[#7A7670]">PrintFlow Desk #2 · Central Library</p>
          </div>
        </div>

        {/* Viewfinder simulator */}
        <div className="relative aspect-square max-w-[320px] mx-auto bg-[#1E1E1E] rounded-[24px] overflow-hidden flex items-center justify-center shadow-2xl border-4 border-white">
          {/* Subtle camera view background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#2a2a2a] to-[#121212] opacity-90" />

          {/* Target Corners */}
          <div className="relative w-56 h-56 border-2 border-white/20 rounded-2xl flex items-center justify-center p-4">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#F5A623] rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#F5A623] rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#F5A623] rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#F5A623] rounded-br-lg" />

            {scanning ? (
              <div className="flex flex-col items-center justify-center text-center p-3">
                {/* Scanning laser line */}
                <div className="absolute left-4 right-4 h-0.5 bg-[#F5A623] shadow-[0_0_12px_#F5A623] animate-[pulse_1.5s_ease-in-out_infinite]" />
                <QrCode className="w-20 h-20 text-white/30 mb-2" />
                <span className="text-white text-[12px] font-medium tracking-wide">
                  Align desk QR inside frame
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-3 animate-in zoom-in duration-300">
                <div className="w-14 h-14 rounded-full bg-[#4CAF50] text-white flex items-center justify-center mb-2 shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <span className="text-white text-[13px] font-semibold">Desk connected!</span>
                <span className="text-white/70 text-[11px]">Opening uploader...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 px-4 pt-4">
        <button
          onClick={onScanSuccess}
          className="w-full py-3 px-4 bg-[#F5A623] hover:bg-[#D9861A] text-white font-semibold rounded-[16px] transition-colors flex items-center justify-center gap-2 shadow-soft"
        >
          <Camera className="w-5 h-5" />
          <span>Simulate Instant Scan</span>
        </button>
        <p className="text-center text-[12px] text-[#7A7670]">
          Or skip camera to upload your PDF directly
        </p>
      </div>
    </div>
  );
}
