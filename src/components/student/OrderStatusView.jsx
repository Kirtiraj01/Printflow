import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Clock, 
  MapPin, 
  Printer, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { usePrintOrder } from '../../context/PrintOrderContext';

export default function OrderStatusView({ orderId, onBack, onNewPrint }) {
  const { orders } = usePrintOrder();
  const [copied, setCopied] = useState(false);

  const order = orders.find((o) => o.id === orderId) || orders[0];

  if (!order) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-[#7A7670]">Order not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#F5A623] text-white rounded-[16px] font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(order.code || order.id.replace('WP-', ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine active step index:
  // 0: paid, 1: review, 2: printing, 3: ready, 4: completed
  const getStepIndex = (status) => {
    switch (status) {
      case 'paid': return 0;
      case 'review': return 1;
      case 'printing': return 2;
      case 'ready': return 3;
      case 'completed': return 4;
      case 'rejected': return -1;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(order.status);

  const steps = [
    {
      title: 'Paid',
      desc: 'Payment confirmed via UPI/Card',
      time: order.statusHistory?.find((h) => h.step === 'paid')?.time || 'Just now',
    },
    {
      title: 'Under review',
      desc: 'Print desk checking page specs',
      time: order.statusHistory?.find((h) => h.step === 'review')?.time || '',
    },
    {
      title: 'Approved & printing',
      desc: 'Canon iR-ADV processing document',
      time: order.statusHistory?.find((h) => h.step === 'printing')?.time || '',
    },
    {
      title: 'Ready for pickup',
      desc: order.shelfLocation ? `Placed on ${order.shelfLocation}` : 'Counter collection ready',
      time: order.statusHistory?.find((h) => h.step === 'ready')?.time || '',
    },
  ];

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white shadow-soft flex items-center justify-center text-[#1E1E1E] hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-[14px] font-semibold text-[#1E1E1E]">Order status</span>
        <div className="w-9" />
      </div>

      {/* Prominent Order Code Hero Card */}
      <div className="bg-white rounded-[24px] p-5 shadow-soft border border-[#1E1E1E]/5 text-center relative overflow-hidden">
        {order.status === 'ready' && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4CAF50]/15 text-[#4CAF50] text-[12px] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Your printout is ready
          </div>
        )}

        <span className="text-[12px] font-medium text-[#7A7670] uppercase tracking-wider block">
          Counter pickup code
        </span>

        {/* Large Prominent Copyable Code */}
        <div className="my-2 flex items-center justify-center gap-2">
          <span className="text-[36px] font-bold text-[#1E1E1E] tracking-wider font-mono">
            #{order.code || order.id}
          </span>
          <button
            onClick={handleCopyCode}
            className="p-2 rounded-full bg-[#FDF8EF] hover:bg-[#f3e7d1] text-[#1E1E1E] transition-colors border border-[#F5A623]/30"
            title="Copy pickup code"
          >
            {copied ? <Check className="w-4 h-4 text-[#4CAF50]" /> : <Copy className="w-4 h-4 text-[#F5A623]" />}
          </button>
        </div>

        <p className="text-[13px] text-[#7A7670]">
          Show this code to the attendant at Central Library Desk 2
        </p>

        {order.status === 'ready' && (
          <div className="mt-4 p-3 bg-[#4CAF50]/10 rounded-[14px] border border-[#4CAF50]/20 flex items-center justify-center gap-2 text-[#4CAF50] font-medium text-[13px]">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>Waiting on <strong>{order.shelfLocation || 'Shelf B-3'}</strong></span>
          </div>
        )}
      </div>

      {/* Vertical Stepper */}
      <div className="bg-white rounded-[20px] p-5 shadow-soft border border-[#1E1E1E]/5">
        <h3 className="text-[15px] font-semibold text-[#1E1E1E] mb-4">Progress</h3>

        {order.status === 'rejected' ? (
          <div className="p-4 bg-[#E24B4A]/10 border border-[#E24B4A]/20 rounded-[16px] flex items-start gap-3 text-[#E24B4A]">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-[14px]">Order rejected by shop</h4>
              <p className="text-[13px] mt-0.5 text-[#E24B4A]/90">
                Reason: {order.rejectionReason || 'Corrupt PDF format or unsupported sizing.'}
              </p>
              <p className="text-[12px] text-[#7A7670] mt-2">
                A full refund has been initiated to your source payment method.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6">
            {/* Vertical connecting line */}
            <div className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-[#1E1E1E]/10" />

            {steps.map((st, idx) => {
              const isPast = currentIndex > idx;
              const isCurrent = currentIndex === idx;
              const isFuture = currentIndex < idx;

              return (
                <div key={st.title} className="relative flex items-start gap-3 group">
                  {/* Step node indicator */}
                  <div
                    className={`absolute -left-[24px] top-0.5 w-[24px] h-[24px] rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                      isPast
                        ? 'bg-[#4CAF50] text-white'
                        : isCurrent
                        ? 'bg-[#F5A623] text-white ring-4 ring-[#F5A623]/20'
                        : 'bg-white border-2 border-[#1E1E1E]/20 text-[#7A7670]'
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-[14px] font-semibold ${
                          isCurrent
                            ? 'text-[#1E1E1E]'
                            : isPast
                            ? 'text-[#1E1E1E]'
                            : 'text-[#7A7670]'
                        }`}
                      >
                        {st.title}
                      </h4>
                      {st.time && (
                        <span className="text-[11px] text-[#7A7670]">{st.time}</span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#7A7670] mt-0.5 leading-snug">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Item Details Card */}
      <div className="bg-white rounded-[16px] p-4 shadow-soft border border-[#1E1E1E]/5 space-y-2 text-[13px]">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E1E1E]/10">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#F5A623]" />
            <span className="font-semibold text-[#1E1E1E] truncate max-w-[200px]">
              {order.fileName}
            </span>
          </div>
          <span className="font-medium text-[#7A7670]">{order.pages} pages</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[#7A7670] pt-1">
          <div>Mode: <strong className="text-[#1E1E1E]">{order.colorMode === 'bw' ? 'B&W' : 'Full Color'}</strong></div>
          <div>Copies: <strong className="text-[#1E1E1E]">{order.copies}</strong></div>
          <div>Paper: <strong className="text-[#1E1E1E]">{order.paperSize}</strong></div>
          <div>Duplex: <strong className="text-[#1E1E1E]">{order.doubleSided ? '2-Sided' : '1-Sided'}</strong></div>
        </div>

        {order.notes && (
          <div className="pt-2 text-[12px] text-[#7A7670] border-t border-[#1E1E1E]/5">
            Note: <span className="text-[#1E1E1E] italic">"{order.notes}"</span>
          </div>
        )}

        <div className="pt-2 border-t border-[#1E1E1E]/10 flex justify-between items-center text-[14px]">
          <span className="text-[#7A7670]">Paid Amount</span>
          <span className="font-bold text-[#1E1E1E]">₹{order.totalPrice}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2">
        <button
          onClick={onNewPrint}
          className="w-full py-3.5 px-4 bg-[#FDF8EF] hover:bg-[#faeed6] text-[#1E1E1E] font-semibold rounded-[16px] border border-[#F5A623]/30 transition-colors flex items-center justify-center gap-2"
        >
          <Printer className="w-4 h-4 text-[#F5A623]" />
          <span>Print another document</span>
        </button>
      </div>
    </div>
  );
}
