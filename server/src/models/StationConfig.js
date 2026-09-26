import mongoose from 'mongoose';

const stationConfigSchema = new mongoose.Schema({
  stationId: { type: String, required: true, unique: true, default: 'desk-2' },
  stationName: { type: String, default: 'Central Library Print Desk 2' },
  isOpen: { type: Boolean, default: true },
  printerModel: { type: String, default: 'Canon iR-ADV C5560' },
  printerStatus: { type: String, enum: ['Ready', 'Printing', 'Offline', 'Maintenance'], default: 'Ready' },
  trayLevelA4: { type: Number, default: 84 },
  tonerLevel: { type: String, default: 'Normal' },
  rates: {
    bwPerPage: { type: Number, default: 2 },
    colorPerPage: { type: Number, default: 8 },
    a3Multiplier: { type: Number, default: 1.5 },
  },
}, { timestamps: true });

export default mongoose.model('StationConfig', stationConfigSchema);
