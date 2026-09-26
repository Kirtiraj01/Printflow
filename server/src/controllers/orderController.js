import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import Order from '../models/Order.js';
import StudentSession from '../models/StudentSession.js';
import StationConfig from '../models/StationConfig.js';
import { getRealPdfPageCount, safeUnlink } from '../utils/pdfUtils.js';
import { calculateOrderPrice } from '../utils/priceCalculator.js';
import { generateUniqueOrderCode } from '../utils/orderCodeGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../../uploads');

export const createOrder = async (req, res, next) => {
  const filePath = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document provided. Please upload a PDF under 50MB.",
      });
    }

    // 1. Extract real page count server-side
    let pages;
    try {
      pages = await getRealPdfPageCount(filePath);
    } catch (parseErr) {
      safeUnlink(filePath);
      return res.status(400).json({
        success: false,
        message: "That file didn't upload. Check it's a valid PDF under 50MB.",
      });
    }

    if (!pages || pages < 1) {
      safeUnlink(filePath);
      return res.status(400).json({
        success: false,
        message: 'Could not detect valid printable pages in this PDF.',
      });
    }

    // 2. Parse print options & calculate authoritative price
    const copies = Math.max(1, parseInt(req.body.copies, 10) || 1);
    const colorMode = req.body.colorMode === 'color' ? 'color' : 'bw';
    const paperSize = req.body.paperSize === 'A3' ? 'A3' : 'A4';
    const doubleSided = req.body.doubleSided !== 'false' && req.body.doubleSided !== false;
    const notes = (req.body.notes || '').trim();
    const paymentMethod = ['card', 'wallet'].includes(req.body.paymentMethod) ? req.body.paymentMethod : 'upi';

    const station = await StationConfig.findOne({ stationId: 'desk-2' });
    const rates = station?.rates || { bwPerPage: 2, colorPerPage: 8, a3Multiplier: 1.5 };
    const totalPrice = calculateOrderPrice({ pages, copies, colorMode, paperSize, rates });

    // 3. Resolve student identity
    let session = await StudentSession.findOne({ deviceId: req.deviceId });
    if (!session) {
      session = await StudentSession.create({ deviceId: req.deviceId });
    }

    // Fallback names if student hasn't set profile yet
    const studentName = (session.name || req.body.studentName || 'Student').trim();
    const studentEmail = (session.email || req.body.studentEmail || 'student@campus.edu').trim();
    const studentPhone = (session.phone || req.body.studentPhone || '+91 00000 00000').trim();

    // 4. Handle wallet debit if wallet payment
    let walletDebited = false;
    if (paymentMethod === 'wallet') {
      if (session.walletBalance < totalPrice) {
        safeUnlink(filePath);
        return res.status(400).json({
          success: false,
          message: `Insufficient campus wallet balance (₹${session.walletBalance.toFixed(2)} available, ₹${totalPrice} required).`,
        });
      }
      session.walletBalance -= totalPrice;
      await session.save();
      walletDebited = true;
    }

    // 5. Generate collision-resistant 4-digit code
    const orderCode = await generateUniqueOrderCode();
    const now = new Date();

    // 6. Build status history: 'paid' entry then immediate 'review' entry
    const statusHistory = [
      {
        step: 'paid',
        label: `Payment confirmed via ${paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'wallet' ? 'Campus Wallet' : 'Card'}`,
        timestamp: now,
      },
      {
        step: 'review',
        label: 'Sent to shop counter queue',
        timestamp: now,
      },
    ];

    const order = new Order({
      orderCode,
      deviceId: req.deviceId,
      studentName,
      studentEmail,
      studentPhone,
      fileName: req.file.originalname,
      storedFileName: req.file.filename,
      fileSize: req.file.size,
      pages,
      copies,
      colorMode,
      paperSize,
      doubleSided,
      notes,
      totalPrice,
      paymentMethod,
      paymentStatus: 'paid',
      status: 'review',
      statusHistory,
      shelfLocation: 'Pending Print',
    });

    await order.save();

    res.status(201).json({
      success: true,
      order,
    });
  } catch (err) {
    safeUnlink(filePath);
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ deviceId: req.deviceId })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      orders,
    });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let order = null;

    const cleanedCode = id.replace(/^(PF-|WP-)/i, '').trim();
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderCode: cleanedCode }) || await Order.findOne({ orderCode: id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Check ownership or admin
    const isOwner = req.deviceId && order.deviceId === req.deviceId;
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied to this order.' });
    }

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    next(err);
  }
};

export const streamOrderFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    let order = null;

    const cleanedCode = id.replace(/^(PF-|WP-)/i, '').trim();
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderCode: cleanedCode }) || await Order.findOne({ orderCode: id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Check authorization: owning device or authenticated admin
    const isOwner = req.deviceId && order.deviceId === req.deviceId;
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this document.' });
    }

    const filePath = path.resolve(uploadDir, order.storedFileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File document no longer available on server.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${order.fileName}"`);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    // Capped at last 200 orders to keep history bounded
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status: nextStatus, shelfLocation, reason } = req.body;
    let order = null;

    const cleanedCode = id.replace(/^(PF-|WP-)/i, '').trim();
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderCode: cleanedCode }) || await Order.findOne({ orderCode: id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Strict State Machine Validation
    const ALLOWED_TRANSITIONS = {
      review: ['printing', 'rejected'],
      printing: ['ready', 'rejected'],
      ready: ['completed'],
      completed: [],
      rejected: [],
    };

    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Illegal status transition from "${order.status}" to "${nextStatus}". Allowed: [${allowed.join(', ')}]`,
      });
    }

    const now = new Date();
    let stepLabel = '';

    if (nextStatus === 'printing') {
      stepLabel = 'Approved & printing started';
    } else if (nextStatus === 'ready') {
      order.readyAt = now;
      order.shelfLocation = (shelfLocation || 'Shelf A-1').trim();
      stepLabel = `Ready for pickup (${order.shelfLocation})`;
    } else if (nextStatus === 'completed') {
      order.completedAt = now;
      stepLabel = 'Collected at counter';
    } else if (nextStatus === 'rejected') {
      if (!reason || !reason.trim()) {
        return res.status(400).json({
          success: false,
          message: 'A rejection reason is required to reject an order.',
        });
      }
      order.rejectionReason = reason.trim();
      order.paymentStatus = 'refunded';
      stepLabel = `Rejected: ${order.rejectionReason}`;

      // Refund to wallet if student paid via wallet
      if (order.paymentMethod === 'wallet') {
        await StudentSession.findOneAndUpdate(
          { deviceId: order.deviceId },
          { $inc: { walletBalance: order.totalPrice } }
        );
      }
    }

    order.status = nextStatus;
    order.statusHistory.push({
      step: nextStatus,
      label: stepLabel,
      timestamp: now,
    });

    await order.save();

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    next(err);
  }
};
