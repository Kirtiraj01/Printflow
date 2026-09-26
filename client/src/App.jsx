import React, { useState, useEffect } from 'react';
import StudentApp from './components/student/StudentApp';
import DualDeviceView from './components/common/DualDeviceView';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLoginGate from './components/admin/AdminLoginGate';
import { PrintOrderProvider, usePrintOrder } from './context/PrintOrderContext';
import { authApi } from './api/authApi';
import { Printer, Store, CheckCircle2, RefreshCw, LogOut } from 'lucide-react';

function AppContent() {
  // Always default to 'student' so when anyone opens the app, the Student UI opens
  const [viewMode, setViewMode] = useState(() => {
    const hash = window.location.hash.toLowerCase();
    const token = localStorage.getItem('printflow_admin_token') || localStorage.getItem('weprint_admin_token');
    if ((hash === '#shopkeeper' || hash === '#admin') && token) {
      return 'shopkeeper';
    }
    return 'student';
  });

  const [adminUser, setAdminUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const { notification, stationConfig, orders, resetDemoData } = usePrintOrder();

  // Check admin session on mount
  useEffect(() => {
    const token = localStorage.getItem('printflow_admin_token') || localStorage.getItem('weprint_admin_token');
    if (token) {
      authApi.getMe()
        .then((res) => {
          if (res.success && res.user) {
            setAdminUser(res.user);
          } else {
            setAdminUser(null);
          }
        })
        .catch(() => {
          setAdminUser(null);
        });
    }
  }, []);

  const pendingCount = orders.filter(
    (o) => o.status === 'paid' || o.status === 'review' || o.status === 'printing'
  ).length;

  const handleOpenShopkeeper = () => {
    const token = localStorage.getItem('printflow_admin_token') || localStorage.getItem('weprint_admin_token');
    if (adminUser || token) {
      setViewMode('shopkeeper');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = (user) => {
    setAdminUser(user);
    setIsLoginModalOpen(false);
    setViewMode('shopkeeper');
  };

  const handleLogout = () => {
    localStorage.removeItem('printflow_admin_token');
    localStorage.removeItem('weprint_admin_token');
    setAdminUser(null);
    setViewMode('student');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8EF] text-[#1E1E1E]">
      {/* Top Application Navbar (Only shown in Student mode; Admin has its own comprehensive desk header) */}
      {viewMode === 'student' && (
        <header className="sticky top-0 z-50 bg-[#1E1E1E] text-white px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 shadow-md">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[#F5A623] flex items-center justify-center text-white font-bold shadow-soft shrink-0">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[15px] sm:text-[16px] tracking-tight leading-tight">PrintFlow</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] animate-pulse" />
              </div>
              <span className="hidden sm:block text-[11px] text-gray-400 leading-tight">
                {stationConfig?.stationName || 'Campus & Retail Print Hub'}
              </span>
            </div>
          </div>

          {/* Right Header Controls: Shopkeeper Desk Entry & Demo Reset */}
          <div className="flex items-center gap-2">
            {adminUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setViewMode('shopkeeper')}
                  className="px-3 py-1.5 rounded-full bg-[#F5A623] text-white hover:bg-[#D9861A] text-[12px] font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Shopkeeper Desk</span>
                  {pendingCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-bold">
                      {pendingCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out of Shopkeeper Desk"
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleOpenShopkeeper}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white text-[12px] font-medium border border-white/15 transition-all flex items-center gap-1.5"
                title="Attendant & Shop Owner Sign In"
              >
                <Store className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>Shopkeeper Login</span>
              </button>
            )}

            {/* Quick Demo Reset */}
            <button
              type="button"
              onClick={resetDemoData}
              title="Reset demo database"
              className="hidden md:flex px-2.5 py-1.5 text-[11px] text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </header>
      )}

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed top-14 right-4 z-50 bg-[#1E1E1E] text-white px-4 py-2.5 rounded-[14px] shadow-2xl flex items-center gap-2.5 text-[13px] border border-white/15 animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Shopkeeper Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm">
            <AdminLoginGate
              onLoginSuccess={handleLoginSuccess}
              onClose={() => setIsLoginModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content: Dual Phone/Laptop View for Student, Full Desk for Shopkeeper */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {viewMode === 'student' ? (
          <DualDeviceView onOpenShopkeeperLogin={handleOpenShopkeeper} />
        ) : (
          <div className="flex-1 overflow-hidden">
            <AdminDashboard
              autoAuthenticate={false}
              onExitToStudent={() => setViewMode('student')}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <PrintOrderProvider>
      <AppContent />
    </PrintOrderProvider>
  );
}
