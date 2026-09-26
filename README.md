# PrintFlow 🖨️

> **PrintFlow** is a smart campus print ordering and station management platform that lets students upload documents, customize print settings, and pay from their phone, while giving print-shop attendants a real-time dashboard to triage queues, inspect PDFs, assign pickup shelves, and manage station rates.

---

## 🌟 Key Features

### 📱 For Students (Customer Portal)
- **Instant Document Upload**: Upload PDF files with automatic real-time page detection using `pdf-lib`.
- **Flexible Print Options**: Custom copies, Black & White vs. Full Color, A4 / A3 paper sizes, and single or double-sided (duplex) printing.
- **Dynamic Price Calculation**: Real-time pricing calculated automatically according to active station rates.
- **Payment & Wallet**: Integrated simulated UPI / Card payments and Instant Campus Wallet top-up.
- **Live Order Tracking**: Real-time progress timeline (`Paid` → `Under Review` → `Printing` → `Ready for Pickup`) with a `#PF-XXXX` pickup code.
- **Adaptive Display**: Native edge-to-edge experience on smartphones, plus side-by-side interactive phone frame and laptop view on desktop.

### 🏪 For Shopkeepers (Station Attendant Desk)
- **Incoming Queue Triage**: 1-click "Approve & Send to Printer" workflow.
- **Counter Pickup Manager**: Search orders by 4-digit pickup code, assign shelf locations (e.g. `Shelf A-2`), and complete handovers.
- **PDF Inspection Spool**: Authenticated inline document stream for document pre-flight verification before printing.
- **Station & Rate Configuration**: Update station operational hours, B&W / Color page rates, A3 multiplier, and printer hardware status.
- **Order Rejections & Refunds**: Reject unprintable files with reason notes and automatic student wallet refund.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, `pdf-lib`
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose ODM), Multer
- **Authentication**: JWT token-based auth for counter attendants, anonymous device session tracking for students

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas URI or local MongoDB (`mongodb://localhost:27017/printflow`)

### Installation

```bash
# Clone the repository
git clone https://github.com/Kirtiraj01/Printflow.git
cd Printflow

# Install all root, server, and client dependencies
npm run install:all
```

### Environment Configuration

Create `server/.env`:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/printflow?retryWrites=true&w=majority
JWT_SECRET=printflow_jwt_secret_development_key
```

### Seed Demo Data

```bash
npm run seed
```

### Run Development Servers

```bash
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`

---

## 🔑 Demo Attendant Credentials

- **Email**: `admin@campusprint.edu`
- **Password**: `adminpassword123`
*(A 1-click "Auto-fill Demo Credentials" button is provided in the Shopkeeper Login modal)*
