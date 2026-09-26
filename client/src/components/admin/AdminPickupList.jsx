import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  MapPin, 
  FileText, 
  Package,
  UserCheck
} from 'lucide-react';
import { formatRelativeAge, formatBytes } from '../../utils/formatters';

export default function AdminPickupList({ orders = [], onSelectOrder, onUpdateStatus }) {
  const [searchQuery, setSearchQuery] = useState('');

  const readyOrders = orders.filter((o) => o.status === 'ready');

  const filteredOrders = readyOrders.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
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

  const isOldOrder = (readyAt) => {
    if (!readyAt) return false;
    const diffMs = Date.now() - new Date(readyAt).getTime();
    return diffMs > 2 * 60 * 60 * 1000; // > 2 hours
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header & Fast Counter Lookup */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[#1E1E1E]">Ready for Pickup</h1>
          <p className="text-[13px] text-[#7A7670] mt-0.5">
            {readyOrders.length} printed document{readyOrders.length === 1 ? '' : 's'} waiting on counter shelves
          </p>
        </div>

        {/* 2-Second Code / Student Fast Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#7A7670] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Type 4-digit code or student name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-[12px] border border-[#1E1E1E]/15 text-[13px] text-[#1E1E1E] focus:outline-none focus:border-[#F5A623] shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#7A7670] hover:text-[#1E1E1E]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid of Ready Orders */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-[16px] p-12 text-center border border-[#1E1E1E]/10 shadow-soft">
          <div className="w-12 h-12 rounded-full bg-[#4CAF50]/15 text-[#4CAF50] flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-[16px] font-semibold text-[#1E1E1E]">Pickup shelf is clear!</h3>
          <p className="text-[13px] text-[#7A7670] mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No matching pickup order found for "${searchQuery}".`
              : 'All printed orders have been collected by students.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const isOld = isOldOrder(order.readyAt);
            const ageText = formatRelativeAge(order.readyAt);
            const orderId = order._id || order.orderCode || order.id;
            const displayCode = order.displayId || (order.orderCode ? `PF-${order.orderCode}` : (order.id ? (order.id.startsWith('WP-') ? order.id.replace('WP-', 'PF-') : order.id) : 'PF-0000'));

            return (
              <div
                key={orderId}
                className="bg-white rounded-[16px] p-5 shadow-soft border border-[#1E1E1E]/10 flex flex-col justify-between hover:border-[#4CAF50] transition-all space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#1E1E1E]/10">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 rounded-[10px] bg-[#1E1E1E] text-white font-mono font-bold text-[18px]">
                        #{displayCode}
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-[#1E1E1E]">{order.studentName}</h3>
                        <span className="text-[12px] text-[#7A7670]">{order.studentPhone || 'No phone'}</span>
                      </div>
                    </div>

                    {/* Shelf Location Tag */}
                    <div className="px-3 py-1 rounded-[10px] bg-[#4CAF50]/15 border border-[#4CAF50]/30 text-[#4CAF50] font-bold text-[13px] flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>{order.shelfLocation || 'Shelf A-1'}</span>
                    </div>
                  </div>

                  {/* Document & Age Specs */}
                  <div className="mt-3 flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2 text-[#1E1E1E] truncate max-w-[240px]">
                      <FileText className="w-4 h-4 text-[#F5A623] shrink-0" />
                      <span className="truncate font-medium">{order.fileName}</span>
                      <span className="text-[#7A7670] shrink-0">({order.pages} pgs)</span>
                    </div>

                    {/* Shelf Age Indicator */}
                    <span
                      className={`inline-flex items-center gap-1 text-[12px] font-medium px-2 py-0.5 rounded-full ${
                        isOld ? 'bg-[#E24B4A]/15 text-[#E24B4A]' : 'bg-gray-100 text-[#7A7670]'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {ageText}
                    </span>
                  </div>

                  {order.notes && (
                    <div className="mt-2 text-[12px] bg-[#FDF8EF] p-2 rounded-[8px] text-[#7A7670]">
                      <strong className="text-[#1E1E1E]">Note:</strong> {order.notes}
                    </div>
                  )}
                </div>

                {/* Handover Action */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectOrder(order)}
                    className="text-[13px] text-[#7A7670] hover:text-[#1E1E1E] font-medium underline-offset-2 hover:underline"
                  >
                    Inspect details
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateStatus(orderId, 'completed')}
                    className="py-2.5 px-4 bg-[#4CAF50] hover:bg-green-600 text-white font-semibold text-[13px] rounded-[12px] transition-colors flex items-center gap-2 shadow-soft"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Mark as Picked Up</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
