import React, { useState } from 'react';
import { Search, Archive, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

export default function AdminHistoryList({ orders = [], onSelectOrder }) {
  const [search, setSearch] = useState('');

  const historyOrders = orders.filter(
    (o) => o.status === 'completed' || o.status === 'rejected'
  );

  const filtered = historyOrders.filter((o) => {
    const q = search.toLowerCase();
    const orderId = (o._id || '').toLowerCase();
    const orderCode = (o.orderCode || '').toLowerCase();
    const displayId = (o.displayId || '').toLowerCase();
    const studentName = (o.studentName || '').toLowerCase();
    const fileName = (o.fileName || '').toLowerCase();

    return (
      orderId.includes(q) ||
      orderCode.includes(q) ||
      displayId.includes(q) ||
      studentName.includes(q) ||
      fileName.includes(q)
    );
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#1E1E1E]">Completed & Past Orders</h1>
          <p className="text-[13px] text-[#7A7670] mt-0.5">Archived print jobs and handover records</p>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 text-[#7A7670] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search past records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white rounded-[10px] border border-[#1E1E1E]/15 text-[13px] focus:outline-none focus:border-[#F5A623]"
          />
        </div>
      </div>

      <div className="bg-white rounded-[16px] shadow-soft border border-[#1E1E1E]/10 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-[#7A7670]">
            <Archive className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-[14px]">No archived orders found.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#FDF8EF] border-b border-[#1E1E1E]/10 text-[#7A7670] font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Document</th>
                <th className="py-3 px-4">Specs</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E1E]/5">
              {filtered.map((o) => {
                const displayCode = o.displayId || (o.orderCode ? `PF-${o.orderCode}` : (o.id ? (o.id.startsWith('WP-') ? o.id.replace('WP-', 'PF-') : o.id) : 'PF-0000'));

                return (
                  <tr
                    key={o._id || o.orderCode || o.id}
                    onClick={() => onSelectOrder(o)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#1E1E1E]">#{displayCode}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#1E1E1E]">{o.studentName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 truncate max-w-[220px]">
                        <FileText className="w-3.5 h-3.5 text-[#7A7670]" />
                        <span className="truncate">{o.fileName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#7A7670]">
                      {o.pages} pgs · {o.colorMode === 'bw' ? 'B&W' : 'Color'} · {o.copies}x
                    </td>
                    <td className="py-3 px-4 font-bold text-[#1E1E1E]">₹{o.totalPrice}</td>
                    <td className="py-3 px-4">
                      {o.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4CAF50] bg-[#4CAF50]/15 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Collected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E24B4A] bg-[#E24B4A]/15 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        className="text-[#F5A623] hover:underline font-medium text-[12px]"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
