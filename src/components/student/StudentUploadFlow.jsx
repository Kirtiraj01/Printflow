import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  UploadCloud, 
  FileText, 
  Check, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  Minus, 
  Plus, 
  Sparkles,
  Layers,
  Palette,
  Copy,
  ChevronRight
} from 'lucide-react';
import StepIndicator from './StepIndicator';
import PaymentModal from './PaymentModal';

export default function StudentUploadFlow({ onBack, onCompleteOrder }) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Options, 3: Summary
  const [file, setFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Print Options state
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState('bw'); // 'bw' or 'color'
  const [paperSize, setPaperSize] = useState('A4'); // 'A4' or 'A3'
  const [doubleSided, setDoubleSided] = useState(true);
  const [notes, setNotes] = useState('');

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Price Calculation:
  // Base rates: B&W = ₹2/page, Color = ₹8/page (A3 has 1.5x multiplier)
  const calculatePrice = () => {
    if (!file) return 0;
    const baseRatePerPage = colorMode === 'bw' ? 2 : 8;
    const sizeMultiplier = paperSize === 'A3' ? 1.5 : 1;
    const pricePerPage = baseRatePerPage * sizeMultiplier;
    return Math.round(file.pages * copies * pricePerPage);
  };

  const handleFileSelect = (selectedFile) => {
    setErrorMsg('');
    if (!selectedFile) return;

    // Strict PDF validation as per Master Design Prompt
    const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setErrorMsg("That file didn't upload. Try again or check it's a PDF under 50MB.");
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setErrorMsg("That file didn't upload. Try again or check it's a PDF under 50MB.");
      return;
    }

    // Realistic page estimation based on file size or default 4-8 pages
    const simulatedPages = Math.max(1, Math.min(32, Math.round(selectedFile.size / (150 * 1024)) || 4));
    const sizeInMb = (selectedFile.size / (1024 * 1024)).toFixed(1);

    setFile({
      name: selectedFile.name,
      size: `${sizeInMb} MB`,
      pages: simulatedPages,
      rawFile: selectedFile,
    });
  };

  const handleSimulateSamplePdf = (preset) => {
    setErrorMsg('');
    if (preset === 'assignment') {
      setFile({
        name: 'Computer_Networks_Assignment2.pdf',
        size: '1.4 MB',
        pages: 5,
      });
    } else if (preset === 'lab') {
      setFile({
        name: 'EE201_Circuit_Lab_Manual.pdf',
        size: '3.8 MB',
        pages: 12,
      });
    }
  };

  const totalPrice = calculatePrice();

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={() => {
            if (step > 1) setStep(step - 1);
            else onBack();
          }}
          className="w-9 h-9 rounded-full bg-white shadow-soft flex items-center justify-center text-[#1E1E1E] hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-[14px] font-semibold text-[#1E1E1E]">
          {step === 1 ? 'Select document' : step === 2 ? 'Print settings' : 'Review & pay'}
        </span>
        <div className="w-9" />
      </div>

      {/* Progress Step Indicator */}
      <StepIndicator currentStep={step} />

      {/* ================= STEP 1: UPLOAD ================= */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-[20px] font-semibold text-[#1E1E1E]">Upload file</h2>
            <p className="text-[13px] text-[#7A7670] mt-0.5">
              PDF documents only · Up to 50MB per file
            </p>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files?.[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-[24px] p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#F5A623] bg-[#F5A623]/5 scale-[1.01]'
                : file
                ? 'border-[#4CAF50] bg-[#4CAF50]/5'
                : 'border-[#1E1E1E]/15 bg-white hover:border-[#F5A623]/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            <div className="w-14 h-14 rounded-full bg-[#FDF8EF] border border-[#F5A623]/30 flex items-center justify-center mx-auto mb-3 text-[#F5A623]">
              <UploadCloud className="w-7 h-7" />
            </div>

            <p className="text-[15px] font-semibold text-[#1E1E1E]">
              {file ? 'Tap to choose another file' : 'Tap to upload or drag & drop'}
            </p>
            <span className="inline-block mt-1 text-[13px] text-[#7A7670]">
              Accepts PDF only
            </span>
          </div>

          {/* Error Banner if any */}
          {errorMsg && (
            <div className="p-3.5 bg-[#E24B4A]/10 border border-[#E24B4A]/20 rounded-[16px] flex items-start gap-2.5 text-[#E24B4A]">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-[13px] leading-snug">{errorMsg}</p>
            </div>
          )}

          {/* Uploaded File Pill / Card */}
          {file && (
            <div className="bg-white rounded-[16px] p-4 shadow-soft border border-[#4CAF50]/30 flex items-center justify-between animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#4CAF50]/15 text-[#4CAF50] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[14px] font-semibold text-[#1E1E1E] truncate max-w-[200px]">
                    {file.name}
                  </h4>
                  <p className="text-[13px] text-[#4CAF50] font-medium mt-0.5">
                    File uploaded — {file.pages} pages ({file.size})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="p-2 text-[#7A7670] hover:text-[#E24B4A] transition-colors rounded-full hover:bg-gray-50"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick preset pills for instant demo testing */}
          {!file && (
            <div className="pt-2">
              <span className="text-[12px] font-medium text-[#7A7670] block mb-2">
                Or quick test with sample document:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulateSamplePdf('assignment')}
                  className="px-3 py-1.5 rounded-full bg-white border border-[#1E1E1E]/10 text-[12px] font-medium text-[#1E1E1E] hover:border-[#F5A623] hover:text-[#F5A623] transition-colors"
                >
                  📄 Assignment_2.pdf (5 pgs)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateSamplePdf('lab')}
                  className="px-3 py-1.5 rounded-full bg-white border border-[#1E1E1E]/10 text-[12px] font-medium text-[#1E1E1E] hover:border-[#F5A623] hover:text-[#F5A623] transition-colors"
                >
                  📄 EE201_Lab_Manual.pdf (12 pgs)
                </button>
              </div>
            </div>
          )}

          {/* Bottom Proceed CTA */}
          <div className="pt-4">
            <button
              type="button"
              disabled={!file}
              onClick={() => setStep(2)}
              className="w-full py-3.5 px-4 bg-[#F5A623] hover:bg-[#D9861A] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-[16px] transition-all flex items-center justify-center gap-2 shadow-soft"
            >
              <span>Continue to options</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: PRINT OPTIONS ================= */}
      {step === 2 && file && (
        <div className="space-y-4">
          <div>
            <h2 className="text-[20px] font-semibold text-[#1E1E1E]">Print options</h2>
            <p className="text-[13px] text-[#7A7670] mt-0.5">
              {file.name} · {file.pages} pages
            </p>
          </div>

          <div className="bg-white rounded-[16px] p-5 shadow-soft border border-[#1E1E1E]/5 space-y-5">
            {/* 1. Copies Stepper */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1E1E1E]/10">
              <div>
                <label className="text-[15px] font-semibold text-[#1E1E1E] block">Copies</label>
                <span className="text-[12px] text-[#7A7670]">How many sets do you need?</span>
              </div>
              <div className="flex items-center gap-3 bg-[#FDF8EF] border border-[#1E1E1E]/10 rounded-[12px] p-1">
                <button
                  type="button"
                  onClick={() => setCopies(Math.max(1, copies - 1))}
                  className="w-8 h-8 rounded-[8px] bg-white text-[#1E1E1E] flex items-center justify-center hover:bg-gray-50 shadow-sm transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-7 text-center font-semibold text-[16px] text-[#1E1E1E]">
                  {copies}
                </span>
                <button
                  type="button"
                  onClick={() => setCopies(copies + 1)}
                  className="w-8 h-8 rounded-[8px] bg-white text-[#1E1E1E] flex items-center justify-center hover:bg-gray-50 shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. Color Mode (B&W vs Color) */}
            <div className="space-y-2 pb-4 border-b border-[#1E1E1E]/10">
              <label className="text-[15px] font-semibold text-[#1E1E1E] block">Color mode</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setColorMode('bw')}
                  className={`p-3 rounded-[14px] border text-left transition-all ${
                    colorMode === 'bw'
                      ? 'border-[#F5A623] bg-[#F5A623]/10 ring-2 ring-[#F5A623]'
                      : 'border-[#1E1E1E]/10 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold text-[#1E1E1E]">Black & White</span>
                    <span className="text-[12px] font-bold text-[#1E1E1E]">₹2/pg</span>
                  </div>
                  <span className="text-[11px] text-[#7A7670] mt-0.5 block">Standard notes & text</span>
                </button>

                <button
                  type="button"
                  onClick={() => setColorMode('color')}
                  className={`p-3 rounded-[14px] border text-left transition-all ${
                    colorMode === 'color'
                      ? 'border-[#F5A623] bg-[#F5A623]/10 ring-2 ring-[#F5A623]'
                      : 'border-[#1E1E1E]/10 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold text-[#1E1E1E]">Full Color</span>
                    <span className="text-[12px] font-bold text-[#F5A623]">₹8/pg</span>
                  </div>
                  <span className="text-[11px] text-[#7A7670] mt-0.5 block">Charts, diagrams & slides</span>
                </button>
              </div>
            </div>

            {/* 3. Paper Size (A4 vs A3) */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1E1E1E]/10">
              <div>
                <label className="text-[15px] font-semibold text-[#1E1E1E] block">Paper size</label>
                <span className="text-[12px] text-[#7A7670]">Standard A4 or oversize A3</span>
              </div>
              <div className="flex gap-1.5 bg-[#FDF8EF] p-1 rounded-[12px] border border-[#1E1E1E]/10">
                {['A4', 'A3'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setPaperSize(size)}
                    className={`px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-all ${
                      paperSize === size
                        ? 'bg-[#1E1E1E] text-white shadow-sm'
                        : 'text-[#7A7670] hover:text-[#1E1E1E]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Double-sided toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[14px] font-medium text-[#1E1E1E] block">Double-sided (Duplex)</label>
                <span className="text-[12px] text-[#7A7670]">Saves paper & weight</span>
              </div>
              <input
                type="checkbox"
                checked={doubleSided}
                onChange={(e) => setDoubleSided(e.target.checked)}
                className="w-5 h-5 accent-[#F5A623] cursor-pointer rounded"
              />
            </div>
          </div>

          {/* Live Price Footer Card */}
          <div className="bg-[#FDF8EF] border border-[#F5A623]/30 rounded-[16px] p-4 flex items-center justify-between">
            <div>
              <span className="text-[12px] text-[#7A7670] block">Estimated Total</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[22px] font-bold text-[#1E1E1E]">₹{totalPrice}</span>
                <span className="text-[12px] text-[#7A7670]">
                  ({file.pages * copies} pages total)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="py-3 px-5 bg-[#F5A623] hover:bg-[#D9861A] text-white font-semibold rounded-[16px] transition-colors flex items-center gap-1.5 shadow-soft"
            >
              <span>Review order</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: ORDER SUMMARY / CART ================= */}
      {step === 3 && file && (
        <div className="space-y-4">
          <div>
            <h2 className="text-[20px] font-semibold text-[#1E1E1E]">Order summary</h2>
            <p className="text-[13px] text-[#7A7670] mt-0.5">
              Review details before proceeding to payment
            </p>
          </div>

          {/* Main Cart Item Card */}
          <div className="bg-white rounded-[16px] p-5 shadow-soft border border-[#1E1E1E]/5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-[12px] bg-[#F5A623]/15 text-[#D9861A] flex items-center justify-center font-bold text-[14px]">
                  PDF
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-[#1E1E1E] truncate max-w-[200px]">
                    {file.name}
                  </h4>
                  <span className="text-[12px] text-[#7A7670]">
                    {file.pages} pages · {file.size}
                  </span>
                </div>
              </div>

              {/* Edit & Delete affordances matching Master Design Prompt */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="p-2 text-[#7A7670] hover:text-[#1E1E1E] rounded-full hover:bg-gray-100 transition-colors"
                  title="Edit options"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setStep(1);
                  }}
                  className="p-2 text-[#7A7670] hover:text-[#E24B4A] rounded-full hover:bg-gray-100 transition-colors"
                  title="Delete item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Options Recap */}
            <div className="bg-[#FDF8EF] rounded-[12px] p-3.5 space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#7A7670]">Color format</span>
                <span className="font-medium text-[#1E1E1E]">
                  {colorMode === 'bw' ? 'Black & White (₹2/page)' : 'Full Color (₹8/page)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7670]">Number of copies</span>
                <span className="font-medium text-[#1E1E1E]">{copies}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7670]">Paper size</span>
                <span className="font-medium text-[#1E1E1E]">{paperSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7670]">Duplex (2-sided)</span>
                <span className="font-medium text-[#1E1E1E]">
                  {doubleSided ? 'Yes (flip on long edge)' : 'No (single-sided)'}
                </span>
              </div>
            </div>

            {/* Counter Notes Input */}
            <div>
              <label className="text-[13px] font-medium text-[#7A7670] block mb-1">
                Counter note (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Staple top-left, spiral bind..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-[13px] px-3.5 py-2.5 rounded-[12px] border border-[#1E1E1E]/15 focus:outline-none focus:border-[#F5A623] transition-colors"
              />
            </div>

            {/* Total Calculation Row */}
            <div className="pt-3 border-t border-[#1E1E1E]/10 flex items-center justify-between">
              <div>
                <span className="text-[14px] font-semibold text-[#1E1E1E] block">Total Amount</span>
                <span className="text-[12px] text-[#7A7670]">Inclusive of campus tax</span>
              </div>
              <span className="text-[24px] font-bold text-[#1E1E1E]">₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Pay Button CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="w-full py-3.5 px-4 bg-[#F5A623] hover:bg-[#D9861A] text-white font-semibold rounded-[16px] transition-colors flex items-center justify-center gap-2 shadow-soft"
            >
              <span>Proceed to pay ₹{totalPrice.toFixed(2)}</span>
            </button>
            <p className="text-center text-[12px] text-[#7A7670] mt-2">
              Ready for pickup in ~5 minutes once approved
            </p>
          </div>
        </div>
      )}

      {/* Hosted Payment Sheet Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={totalPrice}
        orderData={{
          fileName: file?.name,
          pages: file?.pages,
          copies,
          colorMode,
          paperSize,
          doubleSided,
          notes,
          totalPrice,
        }}
        onPaymentSuccess={() => {
          setShowPaymentModal(false);
          onCompleteOrder({
            fileName: file.name,
            fileSize: file.size,
            pages: file.pages,
            copies,
            colorMode,
            paperSize,
            doubleSided,
            notes,
            totalPrice,
          });
        }}
      />
    </div>
  );
}
