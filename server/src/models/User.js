import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin'], default: 'admin', required: true },
  stationName: { type: String, default: 'Central Library Print Desk 2' },
  shiftInfo: { type: String, default: 'Shift ends at 6:00 PM' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
