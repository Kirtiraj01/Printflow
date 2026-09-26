import mongoose from 'mongoose';

const studentSessionSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  },
  name: { type: String, default: '', trim: true },
  email: { type: String, default: '', trim: true, lowercase: true },
  phone: { type: String, default: '', trim: true },
  department: { type: String, default: '', trim: true },
  rollNumber: { type: String, default: '', trim: true },
  walletBalance: { type: Number, default: 140.00, min: 0 },
}, { timestamps: true });

export default mongoose.model('StudentSession', studentSessionSchema);
