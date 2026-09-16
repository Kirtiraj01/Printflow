import React, { useState } from 'react';
import { Home, FileText, User, Printer } from 'lucide-react';
import StudentHome from './StudentHome';
import StudentScan from './StudentScan';
import StudentUploadFlow from './StudentUploadFlow';
import OrderStatusView from './OrderStatusView';
import StudentOrders from './StudentOrders';
import StudentProfile from './StudentProfile';
import { usePrintOrder } from '../../context/PrintOrderContext';

export default function StudentApp({ isEmbedded = false }) {
  const { createOrder } = usePrintOrder();

  const [activeTab, setActiveTab] = useState('home'); // 'home', 'orders', 'profile'
  const [subView, setSubView] = useState(null); // 'scan', 'upload', 'status'
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const handleStartPrint = () => {
    setSubView('upload');
  };

  const handleOpenScan = () => {
    setSubView('scan');
  };

  const handleScanSuccess = () => {
    setSubView('upload');
  };

  const handleOrderComplete = (orderData) => {
    const newOrder = createOrder(orderData);
    setSelectedOrderId(newOrder.id);
    setSubView('status');
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setSubView('status');
  };

  const handleBackToHome = () => {
    setSubView(null);
  };

  return (
    <div className="min-h-screen bg-[#FDF8EF] flex justify-center text-[#1E1E1E]">
      <div className={`w-full ${isEmbedded ? 'max-w-none' : 'max-w-md'} bg-[#FDF8EF] min-h-screen flex flex-col relative`}>
        {/* Main Content Area with 20px side padding */}
        <main className="flex-1 px-5 pt-4 pb-6 overflow-y-auto">
          {subView === 'scan' && (
            <StudentScan onBack={handleBackToHome} onScanSuccess={handleScanSuccess} />
          )}

          {subView === 'upload' && (
            <StudentUploadFlow
              onBack={handleBackToHome}
              onCompleteOrder={handleOrderComplete}
            />
          )}

          {subView === 'status' && (
            <OrderStatusView
              orderId={selectedOrderId}
              onBack={handleBackToHome}
              onNewPrint={handleStartPrint}
            />
          )}

          {!subView && activeTab === 'home' && (
            <StudentHome
              onStartPrint={handleStartPrint}
              onOpenScan={handleOpenScan}
              onSelectOrder={handleSelectOrder}
            />
          )}

          {!subView && activeTab === 'orders' && (
            <StudentOrders
              onSelectOrder={handleSelectOrder}
              onStartPrint={handleStartPrint}
            />
          )}

          {!subView && activeTab === 'profile' && (
            <StudentProfile />
          )}
        </main>

        {/* Bottom Tab Bar (Home / Orders / Profile) matching Master Design Prompt */}
        {!subView && (
          <nav className="fixed sm:sticky bottom-0 left-0 right-0 z-40 bg-white border-t border-[#1E1E1E]/10 shadow-[0_-4px_16px_rgba(30,30,30,0.04)] px-6 py-2.5 flex items-center justify-around">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === 'home' ? 'text-[#F5A623]' : 'text-[#7A7670] hover:text-[#1E1E1E]'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[11px] font-medium">Home</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === 'orders' ? 'text-[#F5A623]' : 'text-[#7A7670] hover:text-[#1E1E1E]'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[11px] font-medium">Orders</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === 'profile' ? 'text-[#F5A623]' : 'text-[#7A7670] hover:text-[#1E1E1E]'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[11px] font-medium">Profile</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
