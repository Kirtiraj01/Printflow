import React from 'react';
import { Printer, QrCode, ArrowRight, Clock, CheckCircle2, ChevronRight, FileText, AlertCircle } from 'lucide-react';
import { usePrintOrder } from '../../context/PrintOrderContext';

export default function StudentHome({ onStartPrint, onOpenScan, onSelectOrder }) {
  const { orders, studentProfile, stationConfig } = usePrintOrder();

  // Find most recent active order (review, printing, or ready)
  const inProgressOrder = orders.find(
    (o) => o.status === 'review' || o.status === 'printing' || o.status === 'ready' || o.status === 'paid'
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return { text: 'Ready for pickup', bg: 'bg-[#4CAF50]/15', textCol: 'text-[#4CAF50]', dot: 'bg-[#4CAF50]' };
      case 'printing':
        return { text: 'Printing now', bg: 'bg-[#F5A623]/15', textCol: 'text-[#D9861A]', dot: 'bg-[#F5A623] animate-pulse' };
      case 'review':
        return { text: 'Under review', bg: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' };
      default:
        return { text: 'Paid · Queued', bg: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' };
    }
  };

  const studentFirstName = studentProfile?.name ? studentProfile.name.split(' ')[0] : 'Alex';
  const bwRate = stationConfig?.rates?.bwPerPage ?? 2;
  const colorRate = stationConfig?.rates?.colorPerPage ?? 8;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Greeting Header */}
      <div className="pt-2">
        <span className="text-[13px] font-medium text-[#7A7670] uppercase tracking-wider block">
          {stationConfig?.stationName || 'Central Library Station'}
        </span>
        <h1 className="text-[24px] font-semibold text-[#1E1E1E] tracking-tight mt-0.5">
          Hey {studentFirstName}, need a print?
        </h1>
        <p className="text-[14px] text-[#7A7670] mt-1">
          Upload your PDF, pay in seconds, and collect at counter desk 2.
        </p>
      </div>

      {/* Primary Action Hero Banner */}
      <div className="bg-white rounded-[16px] p-5 shadow-soft border border-[#1E1E1E]/5 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5A623]/15 text-[#D9861A] text-[12px] font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-[#F5A623]" />
            Desk open · {stationConfig?.printerModel || 'Canon iR-ADV'} ready
          </div>

          <h2 className="text-[18px] font-semibold text-[#1E1E1E] leading-snug">
            Print a document
          </h2>
          <p className="text-[14px] text-[#7A7670] mt-1 mb-5 leading-relaxed">
            Fast PDF printing. Black & white or full color. Ready in ~5 mins.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={onStartPrint}
              className="flex-1 py-3.5 px-5 bg-[#F5A623] hover:bg-[#D9861A] active:scale-[0.98] text-white font-semibold rounded-[16px] transition-all flex items-center justify-center gap-2 shadow-soft"
            >
              <Printer className="w-5 h-5" />
              <span>Start printing</span>
            </button>

            <button
              onClick={onOpenScan}
              className="py-3.5 px-4 bg-[#FDF8EF] hover:bg-[#f6ebd7] text-[#1E1E1E] font-medium rounded-[16px] transition-colors flex items-center justify-center gap-2 border border-[#F5A623]/30"
              title="Scan QR at print desk"
            >
              <QrCode className="w-5 h-5 text-[#F5A623]" />
              <span className="sm:inline">Scan counter QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Current Order Status Card */}
      {inProgressOrder ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[15px] font-semibold text-[#1E1E1E]">Active order</h3>
            <span className="text-[12px] text-[#7A7670]">Live status</span>
          </div>

          <div
            onClick={() => onSelectOrder(inProgressOrder._id || inProgressOrder.orderCode || inProgressOrder.id)}
            className="bg-white rounded-[16px] p-4 shadow-soft border border-[#1E1E1E]/5 hover:border-[#F5A623]/50 cursor-pointer transition-all hover:translate-y-[-1px] group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#FDF8EF] border border-[#F5A623]/30 flex items-center justify-center text-[#F5A623] font-bold text-[14px]">
                  PDF
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-[#1E1E1E] group-hover:text-[#D9861A] transition-colors truncate max-w-[180px] sm:max-w-xs">
                    {inProgressOrder.fileName}
                  </h4>
                  <p className="text-[13px] text-[#7A7670] mt-0.5">
                    Order #{inProgressOrder.displayId || inProgressOrder.orderCode || inProgressOrder.id} · {inProgressOrder.pages} pages · ₹{inProgressOrder.totalPrice}
                  </p>
                </div>
              </div>

              {(() => {
                const badge = getStatusBadge(inProgressOrder.status);
                return (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium ${badge.bg} ${badge.textCol}`}>
                    <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                    {badge.text}
                  </span>
                );
              })()}
            </div>

            <div className="mt-4 pt-3 border-t border-[#1E1E1E]/5 flex items-center justify-between">
              <span className="text-[13px] text-[#1E1E1E] font-medium flex items-center gap-1.5">
                {inProgressOrder.status === 'ready' ? (
                  <span className="text-[#4CAF50] font-semibold">📍 Ready at {inProgressOrder.shelfLocation || 'Shelf B-3'}</span>
                ) : inProgressOrder.status === 'printing' ? (
                  <span className="text-[#D9861A]">Printing in progress...</span>
                ) : (
                  <span className="text-[#7A7670]">Under counter review</span>
                )}
              </span>

              <span className="text-[13px] font-medium text-[#F5A623] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                View status <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/60 rounded-[16px] p-5 border border-dashed border-[#1E1E1E]/15 text-center">
          <p className="text-[14px] text-[#7A7670]">
            No active orders — scan the QR code at the shop or tap above to start one.
          </p>
        </div>
      )}

      {/* Campus Rates Banner */}
      <div className="bg-white rounded-[16px] p-4 shadow-soft border border-[#1E1E1E]/5">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-[#7A7670] font-medium">Standard Campus Rates:</span>
          <div className="flex items-center gap-4 text-[#1E1E1E] font-medium">
            <span>B&W: <strong className="font-semibold text-[#1E1E1E]">₹{bwRate}/pg</strong></span>
            <span>Color: <strong className="font-semibold text-[#F5A623]">₹{colorRate}/pg</strong></span>
          </div>
        </div>
      </div>

      {/* Past prints */}
      <div className="space-y-2">
        <h3 className="text-[15px] font-semibold text-[#1E1E1E] px-1">Past prints</h3>
        <div className="space-y-2">
          {orders.filter((o) => o.status === 'completed').slice(0, 2).map((order) => (
            <div
              key={order._id || order.orderCode || order.id}
              onClick={() => onSelectOrder(order._id || order.orderCode || order.id)}
              className="bg-white rounded-[16px] p-3.5 shadow-soft border border-[#1E1E1E]/5 flex items-center justify-between cursor-pointer hover:border-[#F5A623]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#7A7670]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[14px] font-medium text-[#1E1E1E] leading-tight truncate max-w-[200px]">
                    {order.fileName}
                  </h4>
                  <span className="text-[12px] text-[#7A7670]">
                    #{order.displayId || order.orderCode || order.id} · {order.pages} pages · ₹{order.totalPrice}
                  </span>
                </div>
              </div>
              <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-[#7A7670]">
                Collected
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
