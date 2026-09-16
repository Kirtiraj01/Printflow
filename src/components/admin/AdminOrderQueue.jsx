import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Clock, 
  ChevronRight, 
  SlidersHorizontal,
  Eye,
  RefreshCw
} from 'lucide-react';
import { usePrintOrder } from '../../context/PrintOrderContext';

export default function AdminOrderQueue({ onSelectOrder }) {
  const { orders, updateOrderStatus } = usePrintOrder();
  const [filter, setFilter] = useState('active'); // 'active', 'review', 'printing', 'all'
  const [searchQuery, setSearchQuery] = useState('');

  // Incoming queue orders: sorted newest first
  const queueOrders = orders.filter((o) => {
    if (filter === 'active') return ['paid', 'review', 'printing'].includes(o.status);
    if (filter === 'review') return ['paid', 'review'].includes(o.status);
    if (filter === 'printing') return o.status === 'printing';
    if (filter === 'all') return true;
    return true;
  });

  const filteredOrders = queueOrders.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      o.id.toLowerCase().includes(q) ||
      (o.code && o.code.includes(q)) ||
      o.studentName.toLowerCase().includes(q) ||
      o.fileName.toLowerCase().includes(q)
    );
  });

  const getStatusPill = (status) => {
    switch (status) {
      case 'printing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#F5A623]/15 text-[#D9861A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse" />
            Printing
          </span>
        );
      case 'review':
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-blue-100 text-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            Awaiting Review
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#4CAF50]/15 text-[#4CAF50]">
            Ready on Shelf
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-gray-100 text-[#7A7670]">
            Collected
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#E24B4A]/15 text-[#E24B4A]">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Header & Fast Triage Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#1E1E1E]">Order Queue</h1>
          <p className="text-[13px] text-[#7A7670] mt-0.5">
            Triage incoming student print jobs sorted newest first
          </p>
        </div>

        {/* Controls: Search & Tabs */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-[#7A7670] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search code, student, file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-[10px] border border-[#1E1E1E]/15 text-[13px] focus:outline-none focus:border-[#F5A623]"
            />
          </div>

          <div className="flex gap-1 bg-white p-1 rounded-[10px] border border-[#1E1E1E]/15 text-[12px]">
            {[
              { id: 'active', label: 'Active Queue' },
              { id: 'review', label: 'Pending Review' },
              { id: 'printing', label: 'Printing' },
              { id: 'all', label: 'All' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilter(t.id)}
                className={`px-3 py-1 rounded-[6px] font-medium transition-colors ${
                  filter === t.id
                    ? 'bg-[#1E1E1E] text-white'
                    : 'text-[#7A7670] hover:text-[#1E1E1E]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Scannable Table (Desk-First Dense Layout) */}
      <div className="bg-white rounded-[16px] shadow-soft border border-[#1E1E1E]/10 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-[#7A7670]">
            <Printer className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-[14px]">No orders currently match the selected view.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#FDF8EF] border-b border-[#1E1E1E]/10 text-[#7A7670] font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Order Code</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Specs</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E1E1E]/5 font-normal">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                    onClick={() => onSelectOrder(order)}
                  >
                    {/* Order Code */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#1E1E1E] bg-[#FDF8EF] px-2 py-1 rounded-[6px] border border-[#F5A623]/30">
                        #{order.code || order.id}
                      </span>
                    </td>

                    {/* Student Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1E1E1E]">{order.studentName}</div>
                      <div className="text-[11px] text-[#7A7670]">{order.studentPhone}</div>
                    </td>

                    {/* File Name & Pages */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#F5A623] shrink-0" />
                        <span className="font-medium text-[#1E1E1E] truncate max-w-[200px]" title={order.fileName}>
                          {order.fileName}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#7A7670]">
                        {order.pages} pages · {order.fileSize}
                      </span>
                    </td>

                    {/* Print Specs */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          order.colorMode === 'bw' ? 'bg-gray-100 text-[#1E1E1E]' : 'bg-[#F5A623]/20 text-[#D9861A] font-semibold'
                        }`}>
                          {order.colorMode === 'bw' ? 'B&W' : 'Color'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-[#1E1E1E] text-[11px]">
                          {order.copies}x
                        </span>
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-[#1E1E1E] text-[11px]">
                          {order.paperSize}
                        </span>
                        {order.doubleSided && (
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-[#7A7670] text-[11px]">
                            Duplex
                          </span>
                        )}
                      </div>
                      {order.notes && (
                        <div className="text-[11px] text-[#D9861A] font-medium truncate max-w-[150px] mt-0.5">
                          Note: "{order.notes}"
                        </div>
                      )}
                    </td>

                    {/* Total Amount & Payment */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1E1E1E]">₹{order.totalPrice}</div>
                      <span className="text-[11px] text-[#4CAF50] font-medium">UPI Paid</span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {getStatusPill(order.status)}
                    </td>

                    {/* Action buttons (Approve / Reject / Inspect) */}
                    <td className="py-3.5 px-4 text-right">
                      <div 
                        className="inline-flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {order.status === 'paid' || order.status === 'review' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order.id, 'printing')}
                              className="px-3 py-1.5 bg-[#F5A623] hover:bg-[#D9861A] text-white font-semibold rounded-[8px] text-[12px] transition-colors shadow-sm flex items-center gap-1"
                              title="Approve and print"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onSelectOrder(order)}
                              className="p-1.5 text-[#7A7670] hover:text-[#E24B4A] rounded-[8px] hover:bg-red-50 transition-colors"
                              title="Reject options"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        ) : null}

                        {order.status === 'printing' ? (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.id, 'ready', { shelfLocation: 'Shelf A-1' })}
                            className="px-3 py-1.5 bg-[#4CAF50] hover:bg-green-600 text-white font-semibold rounded-[8px] text-[12px] transition-colors shadow-sm flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Ready</span>
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => onSelectOrder(order)}
                          className="p-1.5 text-[#7A7670] hover:text-[#1E1E1E] rounded-[8px] hover:bg-gray-100 transition-colors"
                          title="View order details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
