import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { PDFDocument, rgb } from 'pdf-lib';

import User from '../src/models/User.js';
import StudentSession from '../src/models/StudentSession.js';
import Order from '../src/models/Order.js';
import StationConfig from '../src/models/StationConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../uploads');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Helper to generate a PDF with exact page count
async function generateSamplePdf(fileName, pageCount, title) {
  const pdfDoc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    const page = pdfDoc.addPage([595, 842]); // Standard A4
    page.drawText(`${title} - Page ${i + 1} of ${pageCount}`, {
      x: 50,
      y: 780,
      size: 16,
      color: rgb(0.12, 0.12, 0.12),
    });
    page.drawText('PrintFlow Campus Print Order Sample Document', {
      x: 50,
      y: 750,
      size: 12,
      color: rgb(0.48, 0.46, 0.44),
    });
    page.drawRectangle({
      x: 50,
      y: 100,
      width: 495,
      height: 600,
      borderColor: rgb(0.96, 0.65, 0.14),
      borderWidth: 1,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const filePath = path.join(uploadsDir, fileName);
  fs.writeFileSync(filePath, pdfBytes);
  return {
    filePath,
    fileSize: pdfBytes.length,
  };
}

export async function clearUploadsExceptGitkeep() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    return;
  }
  const files = fs.readdirSync(uploadsDir);
  for (const file of files) {
    if (file !== '.gitkeep') {
      try {
        fs.unlinkSync(path.join(uploadsDir, file));
      } catch (e) {
        console.error(`Could not delete ${file}:`, e.message);
      }
    }
  }
}

export async function runSeed() {
  console.log('[Seed] Starting database seed...');

  // Ensure uploads directory exists and clear old files
  await clearUploadsExceptGitkeep();

  // Clear existing collections
  await User.deleteMany({});
  await StudentSession.deleteMany({});
  await Order.deleteMany({});
  await StationConfig.deleteMany({});

  // 1. Seed Station Config
  const station = await StationConfig.create({
    stationId: 'desk-2',
    stationName: 'PrintFlow Desk #2 · Central Campus Library',
    isOpen: true,
    printerModel: 'Canon iR-ADV C5560',
    printerStatus: 'Ready',
    trayLevelA4: 84,
    tonerLevel: 'Normal',
    rates: {
      bwPerPage: 2,
      colorPerPage: 8,
      a3Multiplier: 1.5,
    },
  });
  console.log('[Seed] StationConfig seeded.');

  // 2. Seed Admin Attendant
  const hashedPassword = await bcrypt.hash('adminpassword123', 10);
  const admin = await User.create({
    name: 'Central Desk Attendant',
    email: 'admin@campusprint.edu',
    password: hashedPassword,
    role: 'admin',
    stationName: 'PrintFlow Desk #2 · Central Campus Library',
    shiftInfo: 'Shift ends at 6:00 PM',
  });
  console.log(`[Seed] Admin user seeded: ${admin.email}`);

  // 3. Seed Student Session for demo-device-alex
  const demoStudent = await StudentSession.create({
    deviceId: 'demo-device-alex',
    name: 'Alex Rivera',
    email: 'alex.r@campus.edu',
    phone: '+91 98765 43210',
    department: 'Computer Science',
    rollNumber: '2024CS082',
    walletBalance: 140.00,
  });
  console.log(`[Seed] Demo student session seeded: ${demoStudent.deviceId}`);

  // 4. Generate real sample PDFs with exact page counts requested
  const pdf1 = await generateSamplePdf('seed-cheatsheet.pdf', 6, 'CS302 Algorithm CheatSheet');
  const pdf2 = await generateSamplePdf('seed-portfolio.pdf', 12, 'Architecture Design Portfolio');
  const pdf3 = await generateSamplePdf('seed-lab-manual.pdf', 18, 'Organic Chemistry Lab Manual');
  const pdf4 = await generateSamplePdf('seed-essay.pdf', 4, 'History Essay Draft 3');
  console.log('[Seed] Generated 4 realistic PDFs matching exact page counts (6, 12, 18, 4).');

  // 5. Seed Orders
  const now = Date.now();

  const orders = [
    {
      orderCode: '4821',
      deviceId: 'demo-device-alex',
      studentName: 'Alex Rivera',
      studentEmail: 'alex.r@campus.edu',
      studentPhone: '+91 98765 43210',
      fileName: 'CS302_Algorithm_CheatSheet.pdf',
      storedFileName: 'seed-cheatsheet.pdf',
      fileSize: pdf1.fileSize,
      pages: 6,
      copies: 2,
      colorMode: 'bw',
      paperSize: 'A4',
      doubleSided: true,
      notes: 'Please staple in the top-left corner',
      totalPrice: 24, // 6 * 2 * 2
      paymentMethod: 'upi',
      paymentStatus: 'paid',
      status: 'ready',
      shelfLocation: 'Shelf B-3',
      readyAt: new Date(now - 15 * 60 * 1000),
      createdAt: new Date(now - 35 * 60 * 1000),
      statusHistory: [
        { step: 'paid', label: 'Payment confirmed via UPI', timestamp: new Date(now - 35 * 60 * 1000) },
        { step: 'review', label: 'Verified by counter', timestamp: new Date(now - 34 * 60 * 1000) },
        { step: 'printing', label: 'Spooling on Canon iR-ADV', timestamp: new Date(now - 32 * 60 * 1000) },
        { step: 'ready', label: 'Placed on Shelf B-3', timestamp: new Date(now - 15 * 60 * 1000) },
      ],
    },
    {
      orderCode: '5109',
      deviceId: 'demo-device-alex',
      studentName: 'Priya Sharma',
      studentEmail: 'priya.s@campus.edu',
      studentPhone: '+91 91234 56789',
      fileName: 'Architecture_Design_Portfolio.pdf',
      storedFileName: 'seed-portfolio.pdf',
      fileSize: pdf2.fileSize,
      pages: 12,
      copies: 1,
      colorMode: 'color',
      paperSize: 'A4',
      doubleSided: false,
      notes: 'High resolution print requested',
      totalPrice: 96, // 12 * 1 * 8
      paymentMethod: 'upi',
      paymentStatus: 'paid',
      status: 'printing',
      createdAt: new Date(now - 8 * 60 * 1000),
      statusHistory: [
        { step: 'paid', label: 'Payment confirmed via UPI', timestamp: new Date(now - 8 * 60 * 1000) },
        { step: 'review', label: 'Approved by counter', timestamp: new Date(now - 6 * 60 * 1000) },
        { step: 'printing', label: 'Approved & printing started', timestamp: new Date(now - 4 * 60 * 1000) },
      ],
    },
    {
      orderCode: '5382',
      deviceId: 'demo-device-alex',
      studentName: 'Marcus Chen',
      studentEmail: 'marcus.c@campus.edu',
      studentPhone: '+91 99887 76655',
      fileName: 'Organic_Chemistry_Lab_Manual.pdf',
      storedFileName: 'seed-lab-manual.pdf',
      fileSize: pdf3.fileSize,
      pages: 18,
      copies: 1,
      colorMode: 'bw',
      paperSize: 'A4',
      doubleSided: true,
      notes: '',
      totalPrice: 36, // 18 * 1 * 2
      paymentMethod: 'wallet',
      paymentStatus: 'paid',
      status: 'review',
      createdAt: new Date(now - 2 * 60 * 1000),
      statusHistory: [
        { step: 'paid', label: 'Payment confirmed via Campus Wallet', timestamp: new Date(now - 2 * 60 * 1000) },
        { step: 'review', label: 'Sent to shop counter queue', timestamp: new Date(now - 2 * 60 * 1000) },
      ],
    },
    {
      orderCode: '3914',
      deviceId: 'demo-device-alex',
      studentName: 'Alex Rivera',
      studentEmail: 'alex.r@campus.edu',
      studentPhone: '+91 98765 43210',
      fileName: 'History_Essay_Draft3.pdf',
      storedFileName: 'seed-essay.pdf',
      fileSize: pdf4.fileSize,
      pages: 4,
      copies: 1,
      colorMode: 'bw',
      paperSize: 'A4',
      doubleSided: false,
      notes: '',
      totalPrice: 8, // 4 * 1 * 2
      paymentMethod: 'upi',
      paymentStatus: 'paid',
      status: 'completed',
      shelfLocation: 'Collected',
      completedAt: new Date(now - 23 * 60 * 60 * 1000),
      createdAt: new Date(now - 24 * 60 * 60 * 1000),
      statusHistory: [
        { step: 'paid', label: 'Payment confirmed via UPI', timestamp: new Date(now - 24 * 60 * 60 * 1000) },
        { step: 'review', label: 'Sent to shop counter queue', timestamp: new Date(now - 24 * 60 * 60 * 1000) },
        { step: 'ready', label: 'Ready for pickup', timestamp: new Date(now - 23.5 * 60 * 60 * 1000) },
        { step: 'completed', label: 'Collected at counter', timestamp: new Date(now - 23 * 60 * 60 * 1000) },
      ],
    },
  ];

  await Order.insertMany(orders);
  console.log('[Seed] 4 orders seeded successfully.');
  console.log('[Seed] Database seed completed successfully.');
}

// Standalone execution check
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isMain) {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/weprint';
  mongoose.connect(uri)
    .then(async () => {
      await runSeed();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Error]', err);
      process.exit(1);
    });
}
