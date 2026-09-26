import React, { useState, useRef, useEffect } from 'react';
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
  ChevronRight,
  User,
  Phone,
  Mail,
  Loader2
} from 'lucide-react';
import { PDFDocument, rgb } from 'pdf-lib';
import StepIndicator from './StepIndicator';
import PaymentModal from './PaymentModal';
import { usePrintOrder } from '../../context/PrintOrderContext';

export default function StudentUploadFlow({ onBack, onCompleteOrder }) {
  const { studentProfile, updateStudentProfile, stationConfig } = usePrintOrder();

  const [step, setStep] = useState(1); // 1: Upload, 2: Options, 3: Summary
  const [file, setFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [generatingSample, setGeneratingSample] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Print Options state
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState('bw'); // 'bw' or 'color'
  const [paperSize, setPaperSize] = useState('A4'); // 'A4' or 'A3'
  const [doubleSided, setDoubleSided] = useState(true);
  const [notes, setNotes] = useState('');

  // Student Contact Capture State (Requirement 4)
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [contactError, setContactError] = useState('');

  useEffect(() => {
    if (studentProfile) {
      if (studentProfile.name) setStudentName(studentProfile.name);
      if (studentProfile.phone) setStudentPhone(studentProfile.phone);
      if (studentProfile.email) setStudentEmail(studentProfile.email);
    }
  }, [studentProfile]);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Price Calculation using StationConfig rates
  const calculatePrice = () => {
    if (!file) return 0;
    const rates = stationConfig?.rates || { bwPerPage: 2, colorPerPage: 8, a3Multiplier: 1.5 };
    const baseRatePerPage = colorMode === 'bw' ? rates.bwPerPage : rates.colorPerPage;
    const sizeMultiplier = paperSize === 'A3' ? rates.a3Multiplier : 1;
    const pricePerPage = baseRatePerPage * sizeMultiplier;
    return Math.max(1, Math.round(file.pages * copies * pricePerPage));
  };

  const handleFileSelect = async (selectedFile) => {
    setErrorMsg('');
    if (!selectedFile) return;

    const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setErrorMsg("That file didn't upload. Try again or check it's a PDF under 50MB.");
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setErrorMsg("That file didn't upload. Try again or check it's a PDF under 50MB.");
      return;
    }

    try {
      // Extract real page count client-side for immediate options display
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const realPages = pdfDoc.getPageCount();
      const sizeInMb = (selectedFile.size / (1024 * 1024)).toFixed(1);

      setFile({
        name: selectedFile.name,
        size: `${sizeInMb} MB`,
        rawBytes: selectedFile.size,
        pages: realPages,
        rawFile: selectedFile,
      });
    } catch (err) {
      setErrorMsg("Could not read PDF pages. Please verify the document is not password-protected.");
    }
  };

  // Generate real PDF in the browser for sample presets
  const handleSimulateSamplePdf = async (preset) => {
    setErrorMsg('');
    setGeneratingSample(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const pageCount = preset === 'assignment' ? 5 : 12;
      const title = preset === 'assignment' ? 'Computer Networks Assignment 2' : 'EE201 Circuit Lab Manual';
      const fileName = preset === 'assignment' ? 'Computer_Networks_Assignment2.pdf' : 'EE201_Circuit_Lab_Manual.pdf';

      for (let i = 0; i < pageCount; i++) {
        const page = pdfDoc.addPage([595, 842]);
        page.drawText(`${title} - Page ${i + 1} of ${pageCount}`, {
          x: 50,
          y: 780,
          size: 16,
          color: rgb(0.12, 0.12, 0.12),
        });
        page.drawText('PrintFlow Sample Document', {
          x: 50,
          y: 750,
          size: 12,
          color: rgb(0.48, 0.46, 0.44),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const sampleBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const sampleFile = new File([sampleBlob], fileName, { type: 'application/pdf' });

      setFile({
        name: fileName,
        size: `${(sampleFile.size / (1024 * 1024)).toFixed(1)} MB`,
        rawBytes: sampleFile.size,
        pages: pageCount,
        rawFile: sampleFile,
      });
    } catch (e) {
      setErrorMsg('Failed to generate sample PDF.');
    } finally {
      setGeneratingSample(false);
    }
  };

  const handleProceedToPayment = async () => {
    setContactError('');
    if (!studentName.trim()) {
      setContactError('Please enter your name for the counter attendant.');
      return;
    }
    if (!studentPhone.trim()) {
      setContactError('Please enter your phone number for order SMS/pickup lookup.');
      return;
    }

    // Save student profile to backend session once
    try {
      await updateStudentProfile({
        name: studentName.trim(),
        phone: studentPhone.trim(),
        email: studentEmail.trim() || `${studentName.toLowerCase().replace(/\s+/g, '.')}@campus.edu`,
      });
    } catch (e) {
      // Non-blocking error, still proceed to payment
    }

    setShowPaymentModal(true);
  };

  const handlePaymentConfirmed = async (paymentMethod) => {
    setShowPaymentModal(false);
    setIsSubmitting(true);

    // Build real FormData
    const formData = new FormData();
    formData.append('file', file.rawFile);
    formData.append('copies', copies);
    formData.append('colorMode', colorMode);
    formData.append('paperSize', paperSize);
    formData.append('doubleSided', doubleSided);
    formData.append('notes', notes);
    formData.append('paymentMethod', paymentMethod);
    formData.append('studentName', studentName.trim());
    formData.append('studentPhone', studentPhone.trim());
    formData.append('studentEmail', studentEmail.trim() || 'student@campus.edu');

    try {
      await onCompleteOrder(formData);
    } finally {
      setIsSubmitting(false);
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

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-[#E24B4A]/10 border border-[#E24B4A]/20 rounded-[16px] flex items-start gap-2.5 text-[#E24B4A]">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-[13px] leading-snug">{errorMsg}</p>
            </div>
          )}

          {/* Uploaded File Card */}
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

          {/* Preset Buttons */}
          {!file && (
            <div className="pt-2">
              <span className="text-[12px] font-medium text-[#7A7670] block mb-2">
                Or quick test with sample document:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={generatingSample}
                  onClick={() => handleSimulateSamplePdf('assignment')}
                  className="px-3 py-1.5 rounded-full bg-white border border-[#1E1E1E]/10 text-[12px] font-medium text-[#1E1E1E] hover:border-[#F5A623] hover:text-[#F5A623] transition-colors flex items-center gap-1.5"
                >
                  {generatingSample ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '📄'}
                  <span>Assignment_2.pdf (5 pgs)</span>
                </button>
                <button
                  type="button"
                  disabled={generatingSample}
                  onClick={() => handleSimulateSamplePdf('lab')}
                  className="px-3 py-1.5 rounded-full bg-white border border-[#1E1E1E]/10 text-[12px] font-medium text-[#1E1E1E] hover:border-[#F5A623] hover:text-[#F5A623] transition-colors flex items-center gap-1.5"
                >
                  {generatingSample ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '📄'}
                  <span>EE201_Lab_Manual.pdf (12 pgs)</span>
                </button>
              </div>
            </div>
          )}

          {/* Continue Button */}
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

      {/* ================= STEP 2: OPTIONS ================= */}
      {step === 2 && file && (
        <div className="space-y-4">
          <div>
            <h2 className="text-[20px] font-semibold text-[#1E1E1E]">Print options</h2>
            <p className="text-[13px] text-[#7A7670] mt-0.5">
              {file.name} · {file.pages} pages
            </p>
          </div>

          <div className="bg-white rounded-[16px] p-5 shadow-soft border border-[#1E1E1E]/5 space-y-5">
            {/* Copies */}
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

            {/* Color Mode */}
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
                    <span className="text-[12px] font-bold text-[#1E1E1E]">₹{stationConfig?.rates?.bwPerPage || 2}/pg</span>
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
                    <span className="text-[12px] font-bold text-[#F5A623]">₹{stationConfig?.rates?.colorPerPage || 8}/pg</span>
                  </div>
                  <span className="text-[11px] text-[#7A7670] mt-0.5 block">Charts, diagrams & slides</span>
                </button>
              </div>
            </div>

            {/* Paper Size */}
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

            {/* Duplex */}
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

          {/* Live Price Footer */}
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

      {/* ================= STEP 3: SUMMARY & CONTACT ================= */}
      {step === 3 && file && (
        <div className="space-y-4">
          <div>
            <h2 className="text-[20px] font-semibold text-[#1E1E1E]">Order summary</h2>
            <p className="text-[13px] text-[#7A7670] mt-0.5">
              Review details and confirm pickup identity
            </p>
          </div>

          {/* Document Summary Card */}
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

            {/* Recap */}
            <div className="bg-[#FDF8EF] rounded-[12px] p-3.5 space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#7A7670]">Color format</span>
                <span className="font-medium text-[#1E1E1E]">
                  {colorMode === 'bw' ? 'Black & White' : 'Full Color'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7670]">Copies</span>
                <span className="font-medium text-[#1E1E1E]">{copies} set(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7670]">Paper size</span>
                <span className="font-medium text-[#1E1E1E]">{paperSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7670]">Duplex</span>
                <span className="font-medium text-[#1E1E1E]">{doubleSided ? 'Yes' : 'No'}</span>
              </div>
            </div>

            {/* Counter Notes */}
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

            {/* Student Pickup Identity Capture (Requirement 4) */}
            <div className="pt-3 border-t border-[#1E1E1E]/10 space-y-3">
              <span className="text-[13px] font-semibold text-[#1E1E1E] block">
                Pickup Student Identity
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-[#7A7670] block mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Alex Rivera"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-[13px] rounded-[10px] border border-[#1E1E1E]/15 focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[#7A7670] block mb-1">Mobile Phone *</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-[13px] rounded-[10px] border border-[#1E1E1E]/15 focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>
                </div>
              </div>

              {contactError && (
                <p className="text-[12px] text-[#E24B4A] font-medium">{contactError}</p>
              )}
            </div>

            {/* Total Row */}
            <div className="pt-3 border-t border-[#1E1E1E]/10 flex items-center justify-between">
              <div>
                <span className="text-[14px] font-semibold text-[#1E1E1E] block">Total Amount</span>
                <span className="text-[12px] text-[#7A7670]">Inclusive of campus tax</span>
              </div>
              <span className="text-[24px] font-bold text-[#1E1E1E]">₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Pay Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleProceedToPayment}
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

      {/* Submitting Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white p-6 text-center animate-in fade-in duration-200">
          <div className="bg-[#1E1E1E] p-6 rounded-[24px] shadow-2xl flex flex-col items-center max-w-xs border border-white/10 space-y-3">
            <Loader2 className="w-10 h-10 text-[#F5A623] animate-spin" />
            <h4 className="text-[16px] font-semibold">Submitting Order</h4>
            <p className="text-[12px] text-gray-300">
              Uploading PDF document and queueing at PrintFlow desk...
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
        onPaymentSuccess={handlePaymentConfirmed}
      />
    </div>
  );
}
