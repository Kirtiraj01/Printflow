import React, { createContext, useContext, useState, useEffect } from 'react';

const PrintOrderContext = createContext();

const INITIAL_ORDERS = [
  {
    id: 'WP-4821',
    code: '4821',
    studentName: 'Alex Rivera',
    studentEmail: 'alex.r@campus.edu',
    studentPhone: '+91 98765 43210',
    fileName: 'CS302_Algorithm_CheatSheet.pdf',
    fileSize: '1.8 MB',
    pages: 6,
    copies: 2,
    colorMode: 'bw', // 'bw' or 'color'
    paperSize: 'A4', // 'A4' or 'A3'
    doubleSided: true,
    totalPrice: 24, // 6 pages * 2 copies * ₹2
    status: 'ready', // 'paid', 'review', 'printing', 'ready', 'completed', 'rejected'
    statusHistory: [
      { step: 'paid', time: '10:15 AM', label: 'Payment confirmed' },
      { step: 'review', time: '10:16 AM', label: 'Verified by counter' },
      { step: 'printing', time: '10:18 AM', label: 'Spooling on Canon iR-ADV' },
      { step: 'ready', time: '10:22 AM', label: 'Placed on Shelf B-3' },
    ],
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    readyAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    notes: 'Please staple in the top-left corner',
    shelfLocation: 'Shelf B-3',
  },
  {
    id: 'WP-5109',
    code: '5109',
    studentName: 'Priya Sharma',
    studentEmail: 'priya.s@campus.edu',
    studentPhone: '+91 91234 56789',
    fileName: 'Architecture_Design_Portfolio.pdf',
    fileSize: '14.2 MB',
    pages: 12,
    copies: 1,
    colorMode: 'color',
    paperSize: 'A4',
    doubleSided: false,
    totalPrice: 96, // 12 pages * 1 copy * ₹8
    status: 'printing',
    statusHistory: [
      { step: 'paid', time: '10:40 AM', label: 'Payment confirmed' },
      { step: 'review', time: '10:42 AM', label: 'Approved by counter' },
      { step: 'printing', time: '10:44 AM', label: 'Printing page 8 of 12' },
    ],
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    notes: 'High resolution print requested',
  },
  {
    id: 'WP-5382',
    code: '5382',
    studentName: 'Marcus Chen',
    studentEmail: 'marcus.c@campus.edu',
    studentPhone: '+91 99887 76655',
    fileName: 'Organic_Chemistry_Lab_Manual.pdf',
    fileSize: '4.5 MB',
    pages: 18,
    copies: 1,
    colorMode: 'bw',
    paperSize: 'A4',
    doubleSided: true,
    totalPrice: 36,
    status: 'review',
    statusHistory: [
      { step: 'paid', time: '10:48 AM', label: 'Payment confirmed via UPI' },
      { step: 'review', time: '10:49 AM', label: 'Awaiting shop approval' },
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    notes: '',
  },
  {
    id: 'WP-3914',
    code: '3914',
    studentName: 'Alex Rivera',
    studentEmail: 'alex.r@campus.edu',
    studentPhone: '+91 98765 43210',
    fileName: 'History_Essay_Draft3.pdf',
    fileSize: '820 KB',
    pages: 4,
    copies: 1,
    colorMode: 'bw',
    paperSize: 'A4',
    doubleSided: false,
    totalPrice: 8,
    status: 'completed',
    statusHistory: [
      { step: 'paid', time: 'Yesterday 3:10 PM', label: 'Payment confirmed' },
      { step: 'ready', time: 'Yesterday 3:18 PM', label: 'Ready for pickup' },
      { step: 'completed', time: 'Yesterday 3:45 PM', label: 'Picked up by Alex' },
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    shelfLocation: 'Collected',
  }
];

export function PrintOrderProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('weprint_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved orders', e);
      }
    }
    return INITIAL_ORDERS;
  });

  const [activeOrderId, setActiveOrderId] = useState(() => {
    // default to Alex's ready order if exists, or first order
    return 'WP-4821';
  });

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    localStorage.setItem('weprint_orders', JSON.stringify(orders));
  }, [orders]);

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type, id: Date.now() });
    setTimeout(() => setNotification(null), 4000);
  };

  const createOrder = (orderData) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const id = `WP-${randomNum}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder = {
      id,
      code: String(randomNum),
      studentName: orderData.studentName || 'Alex Rivera',
      studentEmail: orderData.studentEmail || 'alex.r@campus.edu',
      studentPhone: orderData.studentPhone || '+91 98765 43210',
      fileName: orderData.fileName || 'Document.pdf',
      fileSize: orderData.fileSize || '2.4 MB',
      pages: orderData.pages || 4,
      copies: orderData.copies || 1,
      colorMode: orderData.colorMode || 'bw',
      paperSize: orderData.paperSize || 'A4',
      doubleSided: orderData.doubleSided ?? true,
      totalPrice: orderData.totalPrice || 8,
      status: 'paid', // immediately enters queue for shop triage
      statusHistory: [
        { step: 'paid', time: timeStr, label: 'Payment confirmed via Razorpay' },
        { step: 'review', time: timeStr, label: 'Sent to shop counter queue' },
      ],
      createdAt: now.toISOString(),
      notes: orderData.notes || '',
      shelfLocation: 'Pending Print',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrderId(id);
    showNotification(`Order #${id} placed successfully!`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus, extra = {}) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;

        let statusLabel = '';
        if (newStatus === 'review') statusLabel = 'Under review by desk';
        else if (newStatus === 'printing') statusLabel = 'Approved & printing started';
        else if (newStatus === 'ready') statusLabel = `Ready for pickup (${extra.shelfLocation || 'Shelf A-1'})`;
        else if (newStatus === 'completed') statusLabel = 'Collected at counter';
        else if (newStatus === 'rejected') statusLabel = `Rejected: ${extra.reason || 'File issue'}`;

        const updatedHistory = [
          ...ord.statusHistory,
          { step: newStatus, time: timeStr, label: statusLabel },
        ];

        return {
          ...ord,
          status: newStatus,
          statusHistory: updatedHistory,
          ...(newStatus === 'ready' ? { readyAt: now.toISOString(), shelfLocation: extra.shelfLocation || 'Shelf A-1' } : {}),
          ...(newStatus === 'completed' ? { completedAt: now.toISOString() } : {}),
          ...(newStatus === 'rejected' ? { rejectionReason: extra.reason } : {}),
        };
      })
    );

    showNotification(`Order #${orderId} updated to ${newStatus}`, 'info');
  };

  const deleteOrder = (orderId) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (activeOrderId === orderId) {
      setActiveOrderId(null);
    }
    showNotification(`Order #${orderId} removed`, 'info');
  };

  const resetDemoData = () => {
    setOrders(INITIAL_ORDERS);
    setActiveOrderId('WP-4821');
    localStorage.removeItem('weprint_orders');
    showNotification('Demo data reset to default', 'info');
  };

  const activeOrder = orders.find((o) => o.id === activeOrderId) || orders[0] || null;

  return (
    <PrintOrderContext.Provider
      value={{
        orders,
        activeOrder,
        activeOrderId,
        setActiveOrderId,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        resetDemoData,
        notification,
        showNotification,
      }}
    >
      {children}
    </PrintOrderContext.Provider>
  );
}

export function usePrintOrder() {
  const ctx = useContext(PrintOrderContext);
  if (!ctx) throw new Error('usePrintOrder must be used within PrintOrderProvider');
  return ctx;
}
