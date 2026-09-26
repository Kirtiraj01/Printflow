import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Clock, 
  CreditCard, 
  MapPin, 
  AlertTriangle,
  Eye,
  Loader2
} from 'lucide-react';
import { ordersApi } from '../../api/ordersApi';
import { formatBytes, formatTimestamp } from '../../utils/formatters';

export default function AdminOrderDetailModal({ order, isOpen, onClose, onUpdateStatus }) {
  const [shelfInput, setShelfInput] = useState('Shelf A-2');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  // Authenticated PDF stream fetched as blob URL, revoked on close (Requirement 1)
  useEffect(() => {
    let activeUrl = null;

    if (isOpen && order) {
      setLoadingPdf(true);
      const identifier = order._id || order.orderCode || order.id;

      ordersApi.getOrderPdfBlob(identifier)
        .then((blob) => {
          activeUrl = URL.createObjectURL(blob);
          setPdfBlobUrl(activeUrl);
        })
        .catch((err) => {
          console.warn('[PDF Preview] Could not stream document:', err.message);
        })
        .finally(() => {
          setLoadingPdf(false);
        });
    }

    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
      setPdfBlobUrl(null);
    };
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const orderId = order._id || order.orderCode || order.id;
  const orderDisplayCode = order.displayId || (order.orderCode ? `PF-${order.orderCode}` : (order.id ? (order.id.startsWith('WP-') ? order.id.replace('WP-', 'PF-') : order.id) : 'PF-0000'));

  const handleApproveAndPrint = () => {
    onUpdateStatus(orderId, 'printing');
    onClose();
  };

  const handleMarkAsReady = () => {
    onUpdateStatus(orderId, 'ready', { shelfLocation: shelfInput });
    onClose();
  };

  const handleMarkCompleted = () => {
    onUpdateStatus(orderId, 'completed');
    onClose();
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return;
    onUpdateStatus(orderId, 'rejected', { reason: rejectReason.trim() });
    setShowRejectBox(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-[#1E1E1E]/10 flex items-center justify-between bg-[#FDF8EF]/50">
          <div className="flex items-center gap-3">
            <span className="text-[20px] font-bold text-[#1E1E1E] font-mono">
              #{orderDisplayCode}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${
              order.status === 'ready'
                ? 'bg-[#4CAF50]/15 text-[#4CAF50]'
                : order.status === 'printing'
                ? 'bg-[#F5A623]/15 text-[#D9861A]'
                : order.status === 'rejected'
                ? 'bg-[#E24B4A]/15 text-[#E24B4A]'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {order.status.toUpperCase()}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-[#7A7670] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Student & File Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-[16px] bg-[#FDF8EF] border border-[#F5A623]/20 space-y-1">
              <span className="text-[11px] font-semibold text-[#7A7670] uppercase tracking-wider">
                Student Details
              </span>
              <h3 className="text-[16px] font-bold text-[#1E1E1E]">{order.studentName}</h3>
              <p className="text-[13px] text-[#7A7670]">{order.studentEmail || 'No email provided'}</p>
              <p className="text-[13px] text-[#7A7670]">{order.studentPhone || 'No phone provided'}</p>
            </div>

            <div className="p-4 rounded-[16px] bg-gray-50 border border-gray-200 space-y-1">
              <span className="text-[11px] font-semibold text-[#7A7670] uppercase tracking-wider">
                Payment Verification
              </span>
              <div className="flex items-center gap-1.5 text-[#4CAF50] font-semibold text-[15px]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Paid ₹{order.totalPrice}.00</span>
              </div>
              <p className="text-[12px] text-[#7A7670]">
                Method: {order.paymentMethod === 'wallet' ? 'Campus Wallet' : order.paymentMethod === 'card' ? 'Debit/Credit Card' : 'Razorpay UPI'}
              </p>
              <p className="text-[12px] text-[#7A7670]">
                Submitted: {formatTimestamp(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Document Specifications */}
          <div className="space-y-3">
            <h4 className="text-[15px] font-semibold text-[#1E1E1E] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#F5A623]" />
              Document Specifications
            </h4>

            <div className="p-4 rounded-[16px] border border-[#1E1E1E]/10 space-y-3 bg-white">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E1E1E]/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FDF8EF] border border-[#F5A623]/30 flex items-center justify-center text-[#F5A623] font-bold text-[12px]">
                    PDF
                  </div>
                  <div>
                    <span className="font-semibold text-[#1E1E1E] text-[14px]">{order.fileName}</span>
                    <span className="text-[12px] text-[#7A7670] block">
                      {order.fileSize ? formatBytes(order.fileSize) : ''} · {order.pages} pages
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[12px] text-[#7A7670] block">Total Impressions</span>
                  <span className="text-[14px] font-bold text-[#1E1E1E]">{order.pages * order.copies} pages</span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
                <div className="p-2.5 rounded-[10px] bg-[#FDF8EF]">
                  <span className="text-[#7A7670] block text-[11px]">Color Mode</span>
                  <strong className="text-[#1E1E1E]">{order.colorMode === 'bw' ? 'B&W' : 'Full Color'}</strong>
                </div>
                <div className="p-2.5 rounded-[10px] bg-[#FDF8EF]">
                  <span className="text-[#7A7670] block text-[11px]">Copies</span>
                  <strong className="text-[#1E1E1E]">{order.copies} set(s)</strong>
                </div>
                <div className="p-2.5 rounded-[10px] bg-[#FDF8EF]">
                  <span className="text-[#7A7670] block text-[11px]">Paper Format</span>
                  <strong className="text-[#1E1E1E]">{order.paperSize} Standard</strong>
                </div>
                <div className="p-2.5 rounded-[10px] bg-[#FDF8EF]">
                  <span className="text-[#7A7670] block text-[11px]">Duplex</span>
                  <strong className="text-[#1E1E1E]">{order.doubleSided ? '2-Sided' : 'Single-Sided'}</strong>
                </div>
              </div>

              {order.notes && (
                <div className="p-3 bg-amber-50 rounded-[10px] border border-amber-200 text-[13px] text-amber-900">
                  <strong>Student instructions:</strong> "{order.notes}"
                </div>
              )}
            </div>
          </div>

          {/* Real PDF Inline Preview (Requirement 1 & 10) */}
          <div className="space-y-2">
            <span className="text-[13px] font-medium text-[#7A7670] flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> PDF Spool Preview
            </span>

            {loadingPdf ? (
              <div className="h-64 rounded-[16px] bg-gray-50 border border-dashed border-gray-300 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#F5A623]" />
                <span className="text-[12px] text-[#7A7670]">Loading spool stream...</span>
              </div>
            ) : pdfBlobUrl ? (
              <div className="h-72 rounded-[16px] overflow-hidden border border-[#1E1E1E]/15 bg-gray-100 shadow-inner">
                <iframe
                  src={pdfBlobUrl}
                  className="w-full h-full border-0"
                  title="PDF Preview"
                />
              </div>
            ) : (
              <div className="h-32 rounded-[16px] bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-[13px] text-[#7A7670]">
                Document spool preview not available for this record.
              </div>
            )}
          </div>

          {/* Rejection input box */}
          {showRejectBox && (
            <div className="p-4 rounded-[16px] bg-[#E24B4A]/10 border border-[#E24B4A]/30 space-y-3">
              <h5 className="text-[14px] font-semibold text-[#E24B4A]">Reject Order</h5>
              <p className="text-[12px] text-[#7A7670]">
                Enter reason for rejection. An automatic refund will be triggered for the student.
              </p>
              <input
                type="text"
                placeholder="e.g. PDF corrupted, page orientation unreadable..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 text-[13px] rounded-[10px] border border-gray-300 focus:outline-none focus:border-[#E24B4A]"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowRejectBox(false)}
                  className="px-3 py-1.5 rounded-[8px] text-[12px] font-medium text-[#7A7670] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={!rejectReason.trim()}
                  className="px-4 py-1.5 rounded-[8px] text-[12px] font-semibold bg-[#E24B4A] text-white hover:bg-red-600 disabled:opacity-50"
                >
                  Confirm Rejection & Refund
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-[#1E1E1E]/10 flex flex-wrap items-center justify-between gap-3">
          {!showRejectBox && order.status !== 'rejected' && order.status !== 'completed' && (
            <button
              onClick={() => setShowRejectBox(true)}
              className="px-3.5 py-2 text-[13px] font-medium text-[#E24B4A] hover:bg-red-50 rounded-[12px] transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject order</span>
            </button>
          )}

          <div className="flex items-center gap-2.5 ml-auto">
            {order.status === 'paid' || order.status === 'review' ? (
              <button
                onClick={handleApproveAndPrint}
                className="px-5 py-2.5 bg-[#F5A623] hover:bg-[#D9861A] text-white font-semibold rounded-[14px] transition-colors flex items-center gap-2 shadow-soft"
              >
                <Printer className="w-4 h-4" />
                <span>Approve & Send to Printer</span>
              </button>
            ) : null}

            {order.status === 'printing' ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shelfInput}
                  onChange={(e) => setShelfInput(e.target.value)}
                  placeholder="Shelf location"
                  className="w-28 px-3 py-2 text-[13px] rounded-[12px] border border-gray-300 focus:outline-none focus:border-[#4CAF50]"
                />
                <button
                  onClick={handleMarkAsReady}
                  className="px-5 py-2.5 bg-[#4CAF50] hover:bg-green-600 text-white font-semibold rounded-[14px] transition-colors flex items-center gap-2 shadow-soft"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Printed & Ready</span>
                </button>
              </div>
            ) : null}

            {order.status === 'ready' ? (
              <button
                onClick={handleMarkCompleted}
                className="px-5 py-2.5 bg-[#1E1E1E] hover:bg-black text-white font-semibold rounded-[14px] transition-colors flex items-center gap-2 shadow-soft"
              >
                <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
                <span>Confirm Student Handover</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
