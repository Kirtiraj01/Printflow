# Implementation Plan: MERN Full-Stack Architecture for WePrint (Final)

> **Project**: WePrint — Campus Print Order Application  
> **Architecture**: MERN (MongoDB, Express, Node, React 19)  
> **Core Identity Model**: Anonymous Device Session for Students + JWT Authentication for Counter Admins.

---

## 1. Architectural Summary & System Design

1. **Zero Student Authentication**: Students never register or log in. Identity is bound to an anonymous device UUID stored in `localStorage` under `weprint_device_id` and sent in the `X-Device-Id` HTTP header.
2. **Device Resolution (`getOrCreateDeviceId`)**:
   - Returns the stored ID if present in `localStorage`.
   - If absent: returns `'demo-device-alex'` ONLY when `import.meta.env.DEV` is true, otherwise generates `crypto.randomUUID()`.
3. **Student Profile & Real Name Capture**: `StudentSession` defaults (`name`, `email`, `phone`, `department`, `rollNumber`) are empty strings. A student name + phone/email capture step in `StudentUploadFlow.jsx` saves to `PUT /api/students/me` before payment so `Order.studentName` is always real.
4. **Admin-Only Authentication**: The `User` model is strictly for shop attendants and counter admins. Only `POST /api/auth/login` and `GET /api/auth/me` exist.
5. **Real PDF Storage, Page Count & Cleanup**:
   - Uploads handled via `multer` into `server/uploads/` with 50MB limit and PDF MIME check.
   - Real page count extracted server-side using `pdf-lib`.
   - **Crucial Invariant**: Every failure path in `createOrder` (bad PDF, page extraction error, validation failure, insufficient wallet funds, DB insert failure) triggers an immediate `fs.unlink` of the uploaded file.
6. **Server-Side Price Authority**: Server calculates `totalPrice` from `StationConfig.rates` and real pages. Client-supplied price is overwritten/ignored.
7. **Complete Wallet Flow (Debit & Credit)**:
   - When `paymentMethod === 'wallet'`: server checks `StudentSession.walletBalance >= totalPrice`. If insufficient, unlinks file and returns `400 Bad Request`. Otherwise, atomically debits `walletBalance`.
   - When an order is rejected: if `paymentMethod === 'wallet'`, the server atomically credits `walletBalance` back and sets `paymentStatus = 'refunded'`.
8. **Strict Order State Machine**:
   - On creation, `createOrder` writes the `'paid'` entry and immediately advances the order to `'review'` with its own history entry (initial saved status is `'review'`).
   - `PATCH /api/orders/:id/status` enum excludes `'paid'`. Legal transitions:
     - `review` $\rightarrow$ `printing`
     - `printing` $\rightarrow$ `ready`
     - `ready` $\rightarrow$ `completed`
     - `review` $\rightarrow$ `rejected`
     - `printing` $\rightarrow$ `rejected`
   - All other transitions return `400 Bad Request`.
9. **Order Code Normalization & Lookup**:
   - Store single `orderCode` (4-digit string generated with retry loop). `"WP-"` prefix is a virtual property derived for display.
   - `GET /api/orders/:id` resolves by Mongo `_id` first; if invalid ObjectId, falls back to `orderCode`.
10. **Secure PDF Streaming & Blob URL Preview**:
    - `GET /api/orders/:id/file` streams PDF.
    - In `AdminOrderDetailModal`, client fetches PDF as a Blob through the authenticated API client, creates `URL.createObjectURL(blob)`, embeds it in the iframe, and calls `URL.revokeObjectURL(url)` on modal unmount/close to prevent memory leaks and 401 unauthenticated iframe errors.
    - Uses `import.meta.env.VITE_API_URL` instead of hardcoded URLs.
11. **Consolidated Admin Polling via Refs**:
    - `AdminDashboard` runs a single 5s `setInterval` polling `GET /api/orders` (capped at last 200 orders, sorted `createdAt: -1`).
    - Mutation lock and interval handle are held in React `useRef`s (`isMutatingRef`, `pollIntervalRef`) to eliminate stale closures. Interval is cleared on unmount.
    - Slices (`queue`, `pickup`, `history`) are passed down via props.
    - "Today's revenue" counter is derived client-side from completed orders created today.

---

## 2. Directory Layout & Restructuring Plan

```
WePrint/
├── client/                     # Vite + React + Tailwind frontend (moved via git mv)
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── .env                    # VITE_API_URL=http://localhost:5000/api
│   └── src/
│       ├── api/                # apiClient, authApi, ordersApi, studentsApi, stationApi
│       ├── components/
│       │   ├── admin/          # AdminDashboard, AdminOrderQueue, AdminPickupList, etc.
│       │   └── student/        # StudentHome, StudentUploadFlow, OrderStatusView, etc.
│       ├── context/            # PrintOrderContext, AuthContext
│       ├── utils/              # deviceId.js, formatters.js
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── server/                     # Node.js + Express backend
│   ├── package.json
│   ├── .env                    # MONGO_URI, PORT, JWT_SECRET, CLIENT_URL, NODE_ENV
│   ├── .env.example
│   ├── uploads/                # Local disk storage for uploaded PDFs (.gitkeep)
│   ├── scripts/
│   │   └── seed.js             # Seeds demo admin, demo-device-alex, real pdf-lib PDFs, station
│   └── src/
│       ├── config/             # db.js
│       ├── controllers/        # auth, student, order, station controllers
│       ├── middleware/         # errorHandler.js, auth.js, requireDevice.js, upload.js
│       ├── models/             # StudentSession.js, User.js, Order.js, StationConfig.js
│       ├── routes/             # authRoutes, studentRoutes, orderRoutes, stationRoutes
│       ├── utils/              # priceCalculator.js, pdfUtils.js, orderCodeGenerator.js
│       └── server.js           # Express app, ensureStationConfig(), 404 handler, error handler
├── package.json                # Root orchestrator with concurrently
├── .gitignore                  # Covers server/uploads/*, .env files, node_modules, dist
└── IMPLEMENTATION_PLAN.md
```

---

## 3. Data Models (Mongoose Schemas)

### 3.1 StudentSession Schema (`server/src/models/StudentSession.js`)
```javascript
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
```

---

### 3.2 User Schema (`server/src/models/User.js`) — Admin Only
```javascript
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
```

---

### 3.3 Order Schema (`server/src/models/Order.js`)
```javascript
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
  orderCode: { type: String, required: true, unique: true, index: true }, // e.g. "4821"
  deviceId: { type: String, required: true, index: true },
  studentName: { type: String, required: true, trim: true },
  studentEmail: { type: String, required: true, trim: true },
  studentPhone: { type: String, required: true, trim: true },
  fileName: { type: String, required: true, trim: true },
  storedFileName: { type: String, required: true },
  fileSize: { type: Number, required: true }, // bytes
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
    enum: ['review', 'printing', 'ready', 'completed', 'rejected'], // 'paid' is historical
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

orderSchema.virtual('displayId').get(function () {
  return `WP-${this.orderCode}`;
});

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ readyAt: -1 });

export default mongoose.model('Order', orderSchema);
```

---

### 3.4 StationConfig Schema (`server/src/models/StationConfig.js`)
```javascript
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
```

---

## 4. REST API Contract

| Method & Path | Access | Request Body | Response Shape | Error Cases & Description |
|---|---|---|---|---|
| **GET** `/api/health` | Public | None | `{ success: true, status: "ok", db: "connected" }` | `500` DB disconnected |
| **POST** `/api/auth/login` | Public | `{ email, password }` | `{ success: true, token, user }` | `400` Missing fields<br>`401` Invalid credentials |
| **GET** `/api/auth/me` | Admin (`requireAuth`) | None | `{ success: true, user }` | `401` Unauthorized |
| **GET** `/api/students/me` | Student (`requireDevice`) | None | `{ success: true, student }` | `400` Missing `X-Device-Id` |
| **PUT** `/api/students/me` | Student (`requireDevice`) | `{ name, email, phone, department, rollNumber }` | `{ success: true, student }` | `400` Validation error |
| **POST** `/api/orders` | Student (`requireDevice`) | `multipart/form-data`: `file`, `copies`, `colorMode`, `paperSize`, `doubleSided`, `notes`, `paymentMethod` | `{ success: true, order }` | `400` Bad PDF, `400` Insufficient wallet balance, `400` File > 50MB (all failure paths trigger `fs.unlink`) |
| **GET** `/api/orders/my-orders` | Student (`requireDevice`) | None | `{ success: true, orders: [ ... ] }` | Scoped to `req.deviceId`, sorted `createdAt: -1` |
| **GET** `/api/orders/:id` | Owning device OR Admin | None | `{ success: true, order }` | Resolves by Mongo `_id`, falls back to `orderCode`. `403` Forbidden, `404` Not found |
| **GET** `/api/orders/:id/file` | Owning device OR Admin | None | Binary stream (`application/pdf`) | `403` Unauthorized, `404` File not found |
| **GET** `/api/orders` | Admin (`requireAuth`) | None | `{ success: true, count, orders: [ ... ] }` | Returns last 200 orders, sorted `createdAt: -1` |
| **PATCH** `/api/orders/:id/status` | Admin (`requireAuth`) | `{ status: "printing"\|"ready"\|"completed"\|"rejected", shelfLocation?, reason? }` | `{ success: true, order }` | `400` Illegal transition (e.g. `paid`), `404` Not found |
| **GET** `/api/station/status` | Public | None | `{ success: true, ...stationConfig }` | Returns desk status & rates |
| **POST** `/api/station/reset-demo` | Gated (`NODE_ENV !== 'production'`) | None | `{ success: true, message: "Demo data reset successfully" }` | Clears `server/uploads/` (except `.gitkeep`), resets DB with seed data. `403` in production |

---

## 5. Seed Script Specification (`server/scripts/seed.js`)

1. **PDF Generation via `pdf-lib`**:
   - Generates valid binary PDF files in `server/uploads/` matching the exact page counts:
     - `seed-cheatsheet.pdf` (6 pages)
     - `seed-portfolio.pdf` (12 pages)
     - `seed-lab-manual.pdf` (18 pages)
     - `seed-essay.pdf` (4 pages)
2. **Seed Data**:
   - Admin: `admin@campusprint.edu` / `adminpassword123`.
   - Student Session: `demo-device-alex`, Alex Rivera, `alex.r@campus.edu`, `+91 98765 43210`, `Computer Science`, `2024CS082`, wallet balance `140.00`.
   - Orders:
     - `#WP-4821` (`4821`): 6 pgs, 2 copies, B&W, ₹24, status `ready`, `Shelf B-3`, printed 15m ago.
     - `#WP-5109` (`5109`): 12 pgs, 1 copy, Color, ₹96, status `printing`, started 8m ago.
     - `#WP-5382` (`5382`): 18 pgs, 1 copy, B&W, ₹36, status `review`, submitted 2m ago.
     - `#WP-3914` (`3914`): 4 pgs, 1 copy, B&W, ₹8, status `completed`, collected yesterday.
   - Station: `desk-2`, Canon iR-ADV C5560, Tray 1 84%, Toner Normal, B&W ₹2, Color ₹8, A3 1.5x.

---

## 6. Phased Implementation Roadmap

- **Phase 1**: Git initialization, `git mv` restructure into `client/` and `server/`, root `concurrently`, Express server skeleton, `errorHandler.js`, 404 handler, `ensureStationConfig()`, `GET /api/health`.
- **Phase 2**: Mongoose models (`StudentSession`, `User`, `Order`, `StationConfig`) and `seed.js` using `pdf-lib` for exact-page sample PDFs.
- **Phase 3**: Admin authentication routes and Student anonymous session routes (`/api/students/me`).
- **Phase 4**: Multer PDF upload, `fs.unlink` on all error branches, `pdf-lib` page counter, price calculator, wallet debit/credit, strict order state machine, and PDF file streaming endpoint.
- **Phase 5**: Client API client layer, device ID resolution (`import.meta.env.DEV` check), blob URL creator/revoker for PDF preview, and formatters.
- **Phase 6**: Student mobile interface wiring: name/phone capture step, real multipart order upload, wallet debit, live stepper polling.
- **Phase 7**: Admin station wiring: consolidated polling via refs, Admin Login Gate, Dual View auto-login, real PDF iframe preview via blob URL.
- **Phase 8**: Full end-to-end verification across Student, Admin, and Dual-View modes.
