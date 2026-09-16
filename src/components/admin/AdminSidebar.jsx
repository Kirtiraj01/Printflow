import React from 'react';
import { 
  Inbox, 
  PackageCheck, 
  Archive, 
  Printer, 
  Settings, 
  LogOut, 
  CircleDot,
  Layers
} from 'lucide-react';
import { usePrintOrder } from '../../context/PrintOrderContext';

export default function AdminSidebar({ activeTab, onTabChange }) {
  const { orders } = usePrintOrder();

  const pendingCount = orders.filter(
    (o) => o.status === 'paid' || o.status === 'review' || o.status === 'printing'
  ).length;

  const readyCount = orders.filter((o) => o.status === 'ready').length;

  const navItems = [
    {
      id: 'queue',
      label: 'Incoming Queue',
      icon: Inbox,
      badge: pendingCount,
      badgeColor: 'bg-[#F5A623] text-white',
    },
    {
      id: 'pickup',
      label: 'Ready for Pickup',
      icon: PackageCheck,
      badge: readyCount,
      badgeColor: 'bg-[#4CAF50] text-white',
    },
    {
      id: 'history',
      label: 'Completed Orders',
      icon: Archive,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-[#1E1E1E] text-white flex flex-col justify-between shrink-0 h-full border-r border-[#1E1E1E]">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-[#F5A623] flex items-center justify-center text-white font-bold shadow-soft">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-[16px] leading-tight tracking-tight">WePrint Desk</h2>
            <span className="text-[12px] text-gray-400">Stationery Counter #2</span>
          </div>
        </div>

        {/* Live Hardware Monitor Status */}
        <div className="mx-4 my-4 p-3 rounded-[12px] bg-white/5 border border-white/10 text-[12px]">
          <div className="flex items-center justify-between font-medium">
            <span className="flex items-center gap-1.5 text-gray-300">
              <span className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse" />
              Canon iR-ADV C5560
            </span>
            <span className="text-[#4CAF50]">Ready</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-gray-400 text-[11px]">
            <span>Tray 1 (A4): 84%</span>
            <span>Toner: Normal</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[#F5A623] text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge > 0 && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-black/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 text-[13px] font-semibold">
            CP
          </div>
          <div className="overflow-hidden">
            <h4 className="text-[13px] font-medium text-white truncate">Campus Print Attendant</h4>
            <p className="text-[11px] text-gray-400 truncate">Shift ends at 6:00 PM</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
