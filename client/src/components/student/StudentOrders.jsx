import React, { useState } from 'react';
import { FileText, ChevronRight, CheckCircle2, Clock, XCircle, Printer } from 'lucide-react';
import { usePrintOrder } from '../../context/PrintOrderContext';

export default function StudentOrders({ onSelectOrder, onStartPrint }) {
  const { orders } = usePrintOrder();
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  const activeStatuses = ['paid', 'review', 'printing', 'ready'];
  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return activeStatuses.includes(o.status);
    if (filter === 'completed') return o.status === 'completed' || o.status === 'rejected';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return { text: 'Ready', bg: 'bg-[#4CAF50]/15 text-[#4CAF50]' };
      case 'printing':
        return { text: 'Printing', bg: 'bg-[#F5A623]/15 text-[#D9861A]' };
      case 'review':
        return { text: 'Review', bg: 'bg-blue-100 text-blue-700' };
      case 'paid':
        return { text: 'Paid', bg: 'bg-amber-100 text-amber-800' };
      case 'completed':
        return { text: 'Completed', bg: 'bg-gray-100 text-[#7A7670]' };
      case 'rejected':
        return { text: 'Rejected', bg: 'bg-[#E24B4A]/15 text-[#E24B4A]' };
      default:
        return { text: status, bg: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      <div>
        <h1 className="text-[24px] font-semibold text-[#1E1E1E]">My print orders</h1>
        <p className="text-[13px] text-[#7A7670] mt-0.5">Track queue status and counter receipts</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-[#FDF8EF] border border-[#1E1E1E]/10 rounded-[12px]">
        {[
          { id: 'all', label: 'All' },
          { id: 'active', label: 'In Progress' },
          { id: 'completed', label: 'Past Receipts' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`flex-1 py-1.5 rounded-[8px] text-[13px] font-medium transition-all ${
              filter === tab.id
                ? 'bg-white text-[#1E1E1E] shadow-sm font-semibold'
                : 'text-[#7A7670] hover:text-[#1E1E1E]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-[16px] p-8 text-center border border-[#1E1E1E]/5 shadow-soft space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FDF8EF] text-[#F5A623] flex items-center justify-center mx-auto">
            <Printer className="w-6 h-6" />
          </div>
          <p className="text-[14px] text-[#7A7670]">No orders found in this category.</p>
          <button
            onClick={onStartPrint}
            className="px-4 py-2 bg-[#F5A623] text-white rounded-[14px] text-[13px] font-semibold"
          >
            Print a document
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const orderId = order._id || order.orderCode || order.id;
            const codeDisplay = order.displayId || (order.orderCode ? `PF-${order.orderCode}` : (order.id ? (order.id.startsWith('WP-') ? order.id.replace('WP-', 'PF-') : order.id) : 'PF-0000'));

            return (
              <div
                key={orderId}
                onClick={() => onSelectOrder(orderId)}
                className="bg-white rounded-[16px] p-4 shadow-soft border border-[#1E1E1E]/5 hover:border-[#F5A623]/50 cursor-pointer transition-all hover:translate-y-[-1px] group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] bg-[#FDF8EF] border border-[#F5A623]/20 flex items-center justify-center text-[#F5A623] font-bold text-[13px]">
                      PDF
                    </div>
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#1E1E1E] group-hover:text-[#D9861A] transition-colors truncate max-w-[170px] sm:max-w-xs">
                        {order.fileName}
                      </h4>
                      <p className="text-[12px] text-[#7A7670] mt-0.5">
                        #{codeDisplay} · {order.pages} pgs · {order.copies} {order.copies > 1 ? 'copies' : 'copy'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badge.bg}`}>
                      {badge.text}
                    </span>
                    <span className="text-[13px] font-bold text-[#1E1E1E] mt-1">
                      ₹{order.totalPrice}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#1E1E1E]/5 flex items-center justify-between text-[12px] text-[#7A7670]">
                  <span>
                    {order.status === 'ready'
                      ? `Ready at ${order.shelfLocation || 'Shelf B-3'}`
                      : `${order.paperSize} · ${order.colorMode === 'bw' ? 'B&W' : 'Color'}`}
                  </span>
                  <span className="text-[#F5A623] font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
