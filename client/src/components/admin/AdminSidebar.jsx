import React from 'react';
import { 
  Inbox, 
  PackageCheck, 
  Archive, 
  Printer, 
  LogOut,
  Settings,
  X,
  ArrowLeft,
  Smartphone
} from 'lucide-react';
import { usePrintOrder } from '../../context/PrintOrderContext';

export default function AdminSidebar({ 
  activeTab, 
  onTabChange, 
  pendingCount, 
  readyCount, 
  adminUser, 
  onLogout,
  onOpenSettings,
  onExitToStudent,
  isMobile = false,
  onCloseMobile = null
}) {
  const { stationConfig } = usePrintOrder();

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

  const printerStatus = stationConfig?.printerStatus || 'Ready';
  const trayLevel = stationConfig?.trayLevelA4 ?? 84;
  const tonerStatus = stationConfig?.tonerLevel || 'Normal';

  const handleNavClick = (tabId) => {
    onTabChange(tabId);
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className={`${isMobile ? 'w-full' : 'w-64'} bg-[#1E1E1E] text-white flex flex-col justify-between shrink-0 h-full border-r border-[#1E1E1E]`}>
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#F5A623] flex items-center justify-center text-white font-bold shadow-soft">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-[16px] leading-tight tracking-tight">PrintFlow Desk</h2>
              <span className="text-[12px] text-gray-400">
                {stationConfig?.stationName ? stationConfig.stationName.split('·')[0] : 'Stationery Counter #2'}
              </span>
            </div>
          </div>

          {isMobile && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Live Hardware Monitor Status */}
        <div className="mx-4 my-4 p-3 rounded-[12px] bg-white/5 border border-white/10 text-[12px]">
          <div className="flex items-center justify-between font-medium">
            <span className="flex items-center gap-1.5 text-gray-300">
              <span className={`w-2 h-2 rounded-full ${printerStatus === 'Ready' ? 'bg-[#4CAF50] animate-pulse' : 'bg-[#F5A623]'}`} />
              {stationConfig?.printerModel || 'Canon iR-ADV C5560'}
            </span>
            <span className={printerStatus === 'Ready' ? 'text-[#4CAF50]' : 'text-[#F5A623]'}>
              {printerStatus}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-gray-400 text-[11px]">
            <span>Tray 1 (A4): {trayLevel}%</span>
            <span>Toner: {tonerStatus}</span>
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
                onClick={() => handleNavClick(item.id)}
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

          {/* Station Settings & Pricing Nav Button */}
          {onOpenSettings && (
            <button
              onClick={() => {
                onOpenSettings();
                if (isMobile && onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-[#F5A623]" />
                <span>Station & Rates</span>
              </div>
              <span className="text-[11px] text-gray-400 bg-white/10 px-1.5 py-0.5 rounded">
                Edit
              </span>
            </button>
          )}
        </nav>

        {/* Exit to Student View Button */}
        {onExitToStudent && (
          <div className="px-3 pt-3">
            <button
              onClick={() => {
                onExitToStudent();
                if (isMobile && onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium bg-white/5 text-gray-200 hover:bg-white/10 hover:text-white border border-white/10 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ArrowLeft className="w-4 h-4 text-[#F5A623]" />
                <span>Return to Student App</span>
              </div>
              <span className="text-[11px] text-gray-400">Exit</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Attendant Info & Logout */}
      <div className="p-4 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 text-[13px] font-semibold shrink-0">
            {adminUser?.name ? adminUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CP'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-[13px] font-medium text-white truncate">
              {adminUser?.name || 'Station Attendant'}
            </h4>
            <p className="text-[11px] text-gray-400 truncate">
              {adminUser?.shiftInfo || 'Shift ends at 6:00 PM'}
            </p>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            title="Log out of station"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
