import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminOrderQueue from './AdminOrderQueue';
import AdminPickupList from './AdminPickupList';
import AdminHistoryList from './AdminHistoryList';
import AdminOrderDetailModal from './AdminOrderDetailModal';
import { usePrintOrder } from '../../context/PrintOrderContext';
import { Clock, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const { orders } = usePrintOrder();
  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'pickup', 'history'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Quick stats
  const pendingCount = orders.filter(
    (o) => o.status === 'paid' || o.status === 'review' || o.status === 'printing'
  ).length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'rejected')
    .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

  return (
    <div className="flex h-screen bg-[#FDF8EF] text-[#1E1E1E] overflow-hidden">
      {/* Left Sidebar (Desktop-first) */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Counter Bar */}
        <header className="h-16 bg-white border-b border-[#1E1E1E]/10 px-6 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-6">
            <span className="text-[13px] font-semibold text-[#1E1E1E]">
              Station Desk #2 · Central Campus Library
            </span>
            <div className="hidden lg:flex items-center gap-5 text-[12px] text-[#7A7670] border-l border-gray-200 pl-6">
              <span>Pending triage: <strong className="text-[#F5A623]">{pendingCount}</strong></span>
              <span>On counter shelf: <strong className="text-[#4CAF50]">{readyCount}</strong></span>
              <span>Today's Total: <strong className="text-[#1E1E1E]">₹{totalRevenue}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[12px] text-[#7A7670] bg-[#FDF8EF] px-3 py-1.5 rounded-full border border-[#1E1E1E]/10 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#F5A623]" />
              <span>{currentTime}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'queue' && (
            <AdminOrderQueue onSelectOrder={(ord) => setSelectedOrder(ord)} />
          )}

          {activeTab === 'pickup' && (
            <AdminPickupList onSelectOrder={(ord) => setSelectedOrder(ord)} />
          )}

          {activeTab === 'history' && (
            <AdminHistoryList onSelectOrder={(ord) => setSelectedOrder(ord)} />
          )}
        </main>
      </div>

      {/* Full Order Inspection / Action Drawer Modal */}
      <AdminOrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
