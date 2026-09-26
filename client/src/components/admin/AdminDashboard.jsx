import React, { useState, useEffect, useRef, useCallback } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminOrderQueue from './AdminOrderQueue';
import AdminPickupList from './AdminPickupList';
import AdminHistoryList from './AdminHistoryList';
import AdminOrderDetailModal from './AdminOrderDetailModal';
import AdminStationSettingsModal from './AdminStationSettingsModal';
import AdminLoginGate from './AdminLoginGate';
import { ordersApi } from '../../api/ordersApi';
import { authApi } from '../../api/authApi';
import { Clock, Menu, X, Settings, Inbox, PackageCheck, Archive, LogOut, ArrowLeft, Smartphone } from 'lucide-react';

export default function AdminDashboard({ autoAuthenticate = false, onExitToStudent }) {
  const [adminUser, setAdminUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'pickup', 'history'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Refs for mutation lock and polling interval to eliminate stale closure (Requirement 5)
  const isMutatingRef = useRef(false);
  const pollIntervalRef = useRef(null);

  // Auto-authentication or token verification on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        let token = localStorage.getItem('printflow_admin_token') || localStorage.getItem('weprint_admin_token');

        // If in autoAuthenticate mode and no token, auto-login with seeded credentials
        if (autoAuthenticate && !token) {
          try {
            const loginRes = await authApi.login('admin@campusprint.edu', 'adminpassword123');
            if (loginRes.success && loginRes.token) {
              token = loginRes.token;
              localStorage.setItem('printflow_admin_token', token);
              if (isMounted) setAdminUser(loginRes.user);
            }
          } catch (e) {
            console.warn('[Admin Auth] Auto-auth failed:', e.message);
          }
        }

        if (token) {
          const meRes = await authApi.getMe();
          if (meRes.success && meRes.user && isMounted) {
            setAdminUser(meRes.user);
          }
        }
      } catch (err) {
        localStorage.removeItem('weprint_admin_token');
      } finally {
        if (isMounted) setCheckingAuth(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [autoAuthenticate]);

  // Consolidated Polling Function (Requirement 17 & 18)
  const fetchAllOrders = useCallback(async () => {
    if (isMutatingRef.current) {
      return; // Pause polling during an in-flight mutation
    }

    try {
      const res = await ordersApi.getAllOrders();
      if (res.success && Array.isArray(res.orders)) {
        setOrders(res.orders);
      }
    } catch (err) {
      // Silent error on polling
    }
  }, []);

  // Polling lifecycle: start 5s interval only when authenticated, clear on unmount (Requirement 5)
  useEffect(() => {
    if (!adminUser) return;

    fetchAllOrders();

    pollIntervalRef.current = setInterval(() => {
      fetchAllOrders();
    }, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [adminUser, fetchAllOrders]);

  // System clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update Status mutation: pauses polling, performs request, refetches on success (Requirement 18)
  const handleUpdateStatus = async (orderId, nextStatus, extra = {}) => {
    isMutatingRef.current = true;
    try {
      const res = await ordersApi.updateStatus(orderId, nextStatus, extra);
      if (res.success) {
        await fetchAllOrders();
      }
    } catch (err) {
      console.error('[Admin Mutation Error]', err.message);
    } finally {
      isMutatingRef.current = false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('printflow_admin_token');
    localStorage.removeItem('weprint_admin_token');
    setAdminUser(null);
    setOrders([]);
    if (onExitToStudent) {
      onExitToStudent();
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex h-screen bg-[#FDF8EF] items-center justify-center text-[#7A7670]">
        Loading PrintFlow counter terminal...
      </div>
    );
  }

  if (!adminUser) {
    return (
      <div className="h-screen bg-[#FDF8EF] flex items-center justify-center p-4">
        <AdminLoginGate 
          onLoginSuccess={(user) => setAdminUser(user)} 
          onClose={onExitToStudent}
        />
      </div>
    );
  }

  // Slices & Counters (Requirement 15 & 17)
  const pendingCount = orders.filter(
    (o) => o.status === 'review' || o.status === 'printing' || o.status === 'paid'
  ).length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;

  // "Today's revenue" derived client-side from completed orders created today
  const todayStr = new Date().toDateString();
  const todayRevenue = orders
    .filter((o) => o.status === 'completed' && new Date(o.createdAt).toDateString() === todayStr)
    .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

  return (
    <div className="flex h-screen bg-[#FDF8EF] text-[#1E1E1E] overflow-hidden">
      {/* Desktop Left Sidebar (>= lg) */}
      <div className="hidden lg:flex h-full shrink-0">
        <AdminSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          pendingCount={pendingCount}
          readyCount={readyCount}
          adminUser={adminUser}
          onLogout={handleLogout}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onExitToStudent={onExitToStudent}
        />
      </div>

      {/* Mobile Slide-in Drawer (< lg) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-150">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-[#1E1E1E] h-full shadow-2xl z-10 flex flex-col">
            <AdminSidebar 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              pendingCount={pendingCount}
              readyCount={readyCount}
              adminUser={adminUser}
              onLogout={handleLogout}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onExitToStudent={onExitToStudent}
              isMobile={true}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Counter Bar */}
        <header className="h-16 bg-white border-b border-[#1E1E1E]/10 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Hamburger on mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-[#FDF8EF] border border-[#1E1E1E]/10 text-[#1E1E1E] hover:bg-gray-100 transition-colors"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-[#1E1E1E]" />
            </button>

            {/* Exit to Student App Button */}
            {onExitToStudent && (
              <button
                type="button"
                onClick={onExitToStudent}
                className="px-3 py-1.5 rounded-full bg-[#1E1E1E] hover:bg-black text-white text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-soft"
                title="Return to Student Portal"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#F5A623]" />
                <span className="hidden xs:inline">Student View</span>
              </button>
            )}

            <span className="text-[13px] font-semibold text-[#1E1E1E] truncate max-w-[170px] sm:max-w-none">
              {adminUser.stationName || 'PrintFlow Desk #2 · Central Campus Library'}
            </span>
            <div className="hidden lg:flex items-center gap-5 text-[12px] text-[#7A7670] border-l border-gray-200 pl-6">
              <span>Pending triage: <strong className="text-[#F5A623]">{pendingCount}</strong></span>
              <span>On counter shelf: <strong className="text-[#4CAF50]">{readyCount}</strong></span>
              <span>Today's Completed Revenue: <strong className="text-[#1E1E1E]">₹{todayRevenue}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Station Settings & Pricing Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              title="Station & Pricing Settings"
              className="px-2.5 py-1.5 rounded-full bg-[#FDF8EF] border border-[#F5A623]/30 text-[#1E1E1E] hover:bg-[#faeed6] transition-colors flex items-center gap-1.5 text-[12px] font-medium"
            >
              <Settings className="w-3.5 h-3.5 text-[#F5A623]" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {/* Live Clock */}
            <div className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-[#7A7670] bg-[#FDF8EF] px-2.5 sm:px-3 py-1.5 rounded-full border border-[#1E1E1E]/10 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#F5A623]" />
              <span>{currentTime}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Views with props slicing */}
        <main className="flex-1 p-3 sm:p-6 pb-20 lg:pb-6 overflow-y-auto">
          {activeTab === 'queue' && (
            <AdminOrderQueue 
              orders={orders}
              onSelectOrder={(ord) => setSelectedOrder(ord)} 
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {activeTab === 'pickup' && (
            <AdminPickupList 
              orders={orders}
              onSelectOrder={(ord) => setSelectedOrder(ord)} 
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {activeTab === 'history' && (
            <AdminHistoryList 
              orders={orders}
              onSelectOrder={(ord) => setSelectedOrder(ord)} 
            />
          )}
        </main>

        {/* Mobile Bottom Tab Bar for Quick Triage (< lg) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#1E1E1E]/10 shadow-[0_-4px_16px_rgba(30,30,30,0.05)] px-4 py-2 flex items-center justify-around">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex flex-col items-center gap-0.5 transition-colors relative ${
              activeTab === 'queue' ? 'text-[#F5A623]' : 'text-[#7A7670]'
            }`}
          >
            <div className="relative">
              <Inbox className="w-5 h-5" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#F5A623] text-white">
                  {pendingCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium">Queue</span>
          </button>

          <button
            onClick={() => setActiveTab('pickup')}
            className={`flex flex-col items-center gap-0.5 transition-colors relative ${
              activeTab === 'pickup' ? 'text-[#4CAF50]' : 'text-[#7A7670]'
            }`}
          >
            <div className="relative">
              <PackageCheck className="w-5 h-5" />
              {readyCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#4CAF50] text-white">
                  {readyCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium">Pickup</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              activeTab === 'history' ? 'text-[#F5A623]' : 'text-[#7A7670]'
            }`}
          >
            <Archive className="w-5 h-5" />
            <span className="text-[11px] font-medium">History</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex flex-col items-center gap-0.5 text-[#7A7670] hover:text-[#1E1E1E] transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="text-[11px] font-medium">Rates</span>
          </button>

          {onExitToStudent && (
            <button
              onClick={onExitToStudent}
              className="flex flex-col items-center gap-0.5 text-[#7A7670] hover:text-[#1E1E1E] transition-colors"
            >
              <Smartphone className="w-5 h-5 text-[#F5A623]" />
              <span className="text-[11px] font-medium">Student</span>
            </button>
          )}
        </nav>
      </div>

      {/* Full Order Inspection Modal */}
      <AdminOrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Station Settings & Pricing Modal */}
      <AdminStationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
