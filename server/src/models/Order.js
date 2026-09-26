import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
  step: {
    type: String,
    enum: ['paid', 'review', 'printing', 'ready', 'completed', 'rejected'],
    required: true,
  },
  label: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  deviceId: {
    type: String,
    required: true,
    index: true,
  },
  studentName: { type: String, required: true, trim: true },
  studentEmail: { type: String, required: true, trim: true },
  studentPhone: { type: String, required: true, trim: true },
  fileName: { type: String, required: true, trim: true },
  storedFileName: { type: String, required: true },
  fileSize: { type: Number, required: true }, // size in bytes
  pages: { type: Number, required: true, min: 1 },
  copies: { type: Number, required: true, default: 1, min: 1 },
  colorMode: { type: String, enum: ['bw', 'color'], required: true, default: 'bw' },
  paperSize: { type: String, enum: ['A4', 'A3'], required: true, default: 'A4' },
  doubleSided: { type: Boolean, required: true, default: true },
  notes: { type: String, default: '', trim: true },
  totalPrice: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ['upi', 'card', 'wallet'], default: 'upi' },
  paymentStatus: { type: String, enum: ['paid', 'refunded'], default: 'paid' },
  status: {
    type: String,
    enum: ['review', 'printing', 'ready', 'completed', 'rejected'],
    default: 'review',
    index: true,
  },
  statusHistory: [statusHistorySchema],
  shelfLocation: { type: String, default: 'Pending Print', trim: true },
  readyAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: null },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual property deriving "PF-4821" from "4821"
orderSchema.virtual('displayId').get(function () {
  return `PF-${this.orderCode}`;
});

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ readyAt: -1 });

export default mongoose.model('Order', orderSchema);
