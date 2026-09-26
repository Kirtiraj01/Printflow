import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ordersApi } from '../api/ordersApi';
import { studentsApi } from '../api/studentsApi';
import { stationApi } from '../api/stationApi';

const PrintOrderContext = createContext();

export function PrintOrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [stationConfig, setStationConfig] = useState({
    stationName: 'Central Library Print Desk 2',
    isOpen: true,
    printerModel: 'Canon iR-ADV C5560',
    printerStatus: 'Ready',
    trayLevelA4: 84,
    tonerLevel: 'Normal',
    rates: { bwPerPage: 2, colorPerPage: 8, a3Multiplier: 1.5 },
  });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((msg, type = 'info') => {
    setNotification({ msg, type, id: Date.now() });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Fetch Student Profile for current anonymous device
  const fetchStudentProfile = useCallback(async () => {
    try {
      const res = await studentsApi.getMe();
      if (res.success && res.student) {
        setStudentProfile(res.student);
      }
    } catch (err) {
      // Offline / server not yet connected
    }
  }, []);

  // Fetch Station Status & Telemetry
  const fetchStationConfig = useCallback(async () => {
    try {
      const res = await stationApi.getStatus();
      if (res.success) {
        setStationConfig(res);
      }
    } catch (err) {
      // Fallback to default station config
    }
  }, []);

  // Fetch Orders for this device
  const fetchMyOrders = useCallback(async () => {
    try {
      const res = await ordersApi.getMyOrders();
      if (res.success && Array.isArray(res.orders)) {
        setOrders(res.orders);
        // If activeOrderId is not set or not found, select first active order
        if (!activeOrderId && res.orders.length > 0) {
          const inProgress = res.orders.find(
            (o) => o.status === 'review' || o.status === 'printing' || o.status === 'ready'
          );
          setActiveOrderId(inProgress ? (inProgress.orderCode || inProgress._id) : (res.orders[0].orderCode || res.orders[0]._id));
        }
      }
    } catch (err) {
      // Silent catch on poll
    } finally {
      setLoading(false);
    }
  }, [activeOrderId]);

  // Initial load
  useEffect(() => {
    fetchStudentProfile();
    fetchStationConfig();
    fetchMyOrders();
  }, [fetchStudentProfile, fetchStationConfig, fetchMyOrders]);

  // Student background polling (every 5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      fetchMyOrders();
    }, 5000);
    return () => clearInterval(timer);
  }, [fetchMyOrders]);

  // Create Order
  const createOrder = async (formData) => {
    try {
      const res = await ordersApi.createOrder(formData);
      if (res.success && res.order) {
        setOrders((prev) => [res.order, ...prev]);
        const id = res.order.orderCode || res.order._id;
        setActiveOrderId(id);
        showNotification(`Order #${res.order.displayId || id} placed successfully!`, 'success');
        // Refresh profile to reflect any wallet debit
        fetchStudentProfile();
        return res.order;
      }
      throw new Error(res.message || 'Failed to place order.');
    } catch (err) {
      showNotification(err.message || 'Could not place order.', 'danger');
      throw err;
    }
  };

  // Update Student Profile
  const updateStudentProfile = async (profileData) => {
    try {
      const res = await studentsApi.updateMe(profileData);
      if (res.success && res.student) {
        setStudentProfile(res.student);
        showNotification('Profile updated successfully!', 'success');
        return res.student;
      }
    } catch (err) {
      showNotification(err.message || 'Could not update profile.', 'danger');
      throw err;
    }
  };

  // Top Up Wallet
  const topUpWallet = async (amount) => {
    try {
      const res = await studentsApi.topUpWallet(amount);
      if (res.success && res.student) {
        setStudentProfile(res.student);
        showNotification(res.message || `Added ₹${amount} to wallet!`, 'success');
        return res.student;
      }
    } catch (err) {
      showNotification(err.message || 'Failed to top up wallet.', 'danger');
      throw err;
    }
  };

  // Update Station Config (for shopkeeper)
  const updateStationConfig = async (newConfig) => {
    try {
      const res = await stationApi.updateConfig(newConfig);
      if (res.success) {
        setStationConfig(res);
        showNotification('Station configuration updated!', 'success');
        return res;
      }
    } catch (err) {
      showNotification(err.message || 'Failed to update station config.', 'danger');
      throw err;
    }
  };

  // Reset Demo Data
  const resetDemoData = async () => {
    try {
      const res = await stationApi.resetDemo();
      if (res.success) {
        showNotification(res.message || 'Demo data reset successfully!', 'info');
        await fetchStudentProfile();
        await fetchMyOrders();
        await fetchStationConfig();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to reset demo data.', 'danger');
    }
  };

  const activeOrder = orders.find(
    (o) => o._id === activeOrderId || o.orderCode === activeOrderId || (o.displayId && o.displayId === activeOrderId)
  ) || orders[0] || null;

  return (
    <PrintOrderContext.Provider
      value={{
        orders,
        activeOrder,
        activeOrderId,
        setActiveOrderId,
        createOrder,
        studentProfile,
        updateStudentProfile,
        topUpWallet,
        stationConfig,
        updateStationConfig,
        refreshStationConfig: fetchStationConfig,
        loading,
        resetDemoData,
        refreshOrders: fetchMyOrders,
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
