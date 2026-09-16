import React, { useState } from 'react';
import StudentApp from './components/student/StudentApp';
import AdminDashboard from './components/admin/AdminDashboard';
import { PrintOrderProvider, usePrintOrder } from './context/PrintOrderContext';
import { Smartphone, Monitor, Columns, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

function AppContent() {
  // View mode: 'student' (mobile frame), 'admin' (desktop station), 'dual' (side-by-side interactive)
  const [viewMode, setViewMode] = useState('dual');
  const { notification, resetDemoData, orders } = usePrintOrder();

  const pendingCount = orders.filter(
    (o) => o.status === 'paid' || o.status === 'review' || o.status === 'printing'
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5EFE6]">
      {/* Top Demo Bar for Reviewers */}
      <header className="bg-[#1E1E1E] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623] animate-pulse" />
            <span className="font-bold text-[14px] tracking-tight">WePrint Demo</span>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-gray-400 border-l border-white/20 pl-3">
            Campus Print Order System · Master Design Prototype
          </span>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-full text-[12px]">
          <button
            type="button"
            onClick={() => setViewMode('student')}
            className={`px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'student' ? 'bg-[#F5A623] text-white shadow' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Student App</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('admin')}
            className={`px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'admin' ? 'bg-[#F5A623] text-white shadow' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Admin Station</span>
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#F5A623]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setViewMode('dual')}
            className={`px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'dual' ? 'bg-[#F5A623] text-white shadow' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Dual Live Sync</span>
          </button>
        </div>

        {/* Reset / Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetDemoData}
            className="px-2.5 py-1 text-[11px] text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1"
            title="Reset orders to initial demo state"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Data</span>
          </button>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {notification && (
        <div className="fixed top-14 right-4 z-50 bg-[#1E1E1E] text-white px-4 py-2.5 rounded-[14px] shadow-2xl flex items-center gap-2.5 text-[13px] border border-white/15 animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Viewport Renderings */}
      <main className="flex-1 flex overflow-hidden">
        {/* ============= 1. STUDENT ONLY VIEW ============= */}
        {viewMode === 'student' && (
          <div className="flex-1 flex items-center justify-center p-4 bg-[#F5EFE6] overflow-y-auto">
            {/* Realistic iPhone frame */}
            <div className="w-full max-w-[390px] h-[844px] bg-[#FDF8EF] rounded-[48px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] border-[10px] border-[#1E1E1E] overflow-hidden flex flex-col relative ring-1 ring-black/10">
              {/* Dynamic Island / Notch */}
              <div className="w-28 h-5 bg-[#1E1E1E] rounded-full mx-auto mt-2.5 shrink-0 z-50" />
              <div className="flex-1 overflow-y-auto">
                <StudentApp />
              </div>
            </div>
          </div>
        )}

        {/* ============= 2. ADMIN ONLY VIEW ============= */}
        {viewMode === 'admin' && (
          <div className="flex-1 overflow-hidden">
            <AdminDashboard />
          </div>
        )}

        {/* ============= 3. DUAL LIVE SYNC VIEW ============= */}
        {viewMode === 'dual' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left: Student Mobile View */}
            <div className="lg:w-[420px] xl:w-[460px] bg-[#EDE4D5] p-4 lg:p-6 border-r border-[#1E1E1E]/10 flex flex-col items-center justify-start overflow-y-auto shrink-0">
              <div className="mb-3 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E1E1E] text-white text-[12px] font-semibold shadow-sm">
                  <Smartphone className="w-3.5 h-3.5 text-[#F5A623]" />
                  Student Mobile View
                </span>
                <p className="text-[11px] text-[#7A7670] mt-1">
                  Upload PDF & pay to test live queue dispatch
                </p>
              </div>

              {/* Mobile device shell */}
              <div className="w-full max-w-[380px] h-[780px] bg-[#FDF8EF] rounded-[40px] shadow-[0_16px_40px_rgba(0,0,0,0.15)] border-[8px] border-[#1E1E1E] overflow-hidden flex flex-col relative">
                <div className="w-24 h-4 bg-[#1E1E1E] rounded-full mx-auto mt-2 shrink-0 z-50" />
                <div className="flex-1 overflow-y-auto">
                  <StudentApp isEmbedded={true} />
                </div>
              </div>
            </div>

            {/* Right: Admin Desktop Station View */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#FDF8EF]">
              <div className="bg-[#FDF8EF] px-6 py-2 border-b border-[#1E1E1E]/10 flex items-center justify-between text-[12px] text-[#7A7670]">
                <span className="font-semibold text-[#1E1E1E] flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-[#F5A623]" />
                  Station Counter Desktop Surface
                </span>
                <span>Real-time bi-directional reactive sync active</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <AdminDashboard />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <PrintOrderProvider>
      <AppContent />
    </PrintOrderProvider>
  );
}
