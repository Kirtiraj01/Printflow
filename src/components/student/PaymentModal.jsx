import React, { useState } from 'react';
import { X, ShieldCheck, Smartphone, CreditCard, Wallet, CheckCircle2, Loader2 } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, amount, orderData, onPaymentSuccess }) {
  const [method, setMethod] = useState('upi');
  const [upiApp, setUpiApp] = useState('gpay');
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setPaid(true);
      setTimeout(() => {
        onPaymentSuccess();
      }, 1000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-md bg-white rounded-t-[24px] sm:rounded-[24px] shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E1E1E]/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F5A623]/15 flex items-center justify-center text-[#F5A623]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#1E1E1E] leading-tight">Razorpay Checkout</h3>
              <p className="text-[12px] text-[#7A7670]">WePrint Campus Desk · Instant Verify</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={processing || paid}
            className="p-1 rounded-full hover:bg-gray-100 text-[#7A7670] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {paid ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#4CAF50]/15 text-[#4CAF50] flex items-center justify-center mb-3 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-[18px] font-semibold text-[#1E1E1E]">Payment confirmed!</h4>
            <p className="text-[14px] text-[#7A7670] mt-1">Generating order code and sending to print queue...</p>
          </div>
        ) : (
          <div className="mt-4 space-y-4 overflow-y-auto">
            {/* Amount display */}
            <div className="bg-[#FDF8EF] p-4 rounded-[16px] border border-[#F5A623]/20 flex items-center justify-between">
              <div>
                <span className="text-[12px] text-[#7A7670] block">Amount to pay</span>
                <span className="text-[22px] font-bold text-[#1E1E1E]">₹{amount.toFixed(2)}</span>
              </div>
              <span className="text-[12px] font-medium px-2.5 py-1 bg-white rounded-full text-[#1E1E1E] border border-[#1E1E1E]/10 shadow-sm">
                {orderData.pages} pages · {orderData.copies} {orderData.copies > 1 ? 'copies' : 'copy'}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#7A7670]">Select payment method</label>

              {/* UPI Option */}
              <div
                onClick={() => setMethod('upi')}
                className={`p-3.5 rounded-[16px] border cursor-pointer transition-all flex flex-col gap-2.5 ${
                  method === 'upi' ? 'border-[#F5A623] bg-[#F5A623]/5 ring-1 ring-[#F5A623]' : 'border-[#1E1E1E]/10 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-[#F5A623]" />
                    <span className="text-[14px] font-medium text-[#1E1E1E]">UPI Instant Pay</span>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 bg-[#4CAF50]/15 text-[#4CAF50] rounded-full">
                    Fastest
                  </span>
                </div>

                {method === 'upi' && (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { id: 'gpay', label: 'Google Pay' },
                      { id: 'phonepe', label: 'PhonePe' },
                      { id: 'paytm', label: 'Paytm' },
                    ].map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUpiApp(app.id);
                        }}
                        className={`text-[12px] py-1.5 px-2 rounded-lg font-medium transition-all ${
                          upiApp === app.id
                            ? 'bg-[#1E1E1E] text-white'
                            : 'bg-white border border-[#1E1E1E]/10 text-[#1E1E1E] hover:bg-gray-50'
                        }`}
                      >
                        {app.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Campus ID Card / Student Wallet */}
              <div
                onClick={() => setMethod('card')}
                className={`p-3.5 rounded-[16px] border cursor-pointer transition-all flex items-center justify-between ${
                  method === 'card' ? 'border-[#F5A623] bg-[#F5A623]/5 ring-1 ring-[#F5A623]' : 'border-[#1E1E1E]/10 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-[#7A7670]" />
                  <div>
                    <span className="text-[14px] font-medium text-[#1E1E1E] block leading-snug">Debit / Credit Card</span>
                    <span className="text-[11px] text-[#7A7670]">Visa, Mastercard, RuPay</span>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  method === 'card' ? 'border-[#F5A623] bg-[#F5A623]' : 'border-gray-300'
                }`}>
                  {method === 'card' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>

              {/* Campus Wallet */}
              <div
                onClick={() => setMethod('wallet')}
                className={`p-3.5 rounded-[16px] border cursor-pointer transition-all flex items-center justify-between ${
                  method === 'wallet' ? 'border-[#F5A623] bg-[#F5A623]/5 ring-1 ring-[#F5A623]' : 'border-[#1E1E1E]/10 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-[#7A7670]" />
                  <div>
                    <span className="text-[14px] font-medium text-[#1E1E1E] block leading-snug">Campus Student ID Pay</span>
                    <span className="text-[11px] text-[#7A7670]">Balance: ₹140.00</span>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  method === 'wallet' ? 'border-[#F5A623] bg-[#F5A623]' : 'border-gray-300'
                }`}>
                  {method === 'wallet' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2">
              <button
                onClick={handlePay}
                disabled={processing}
                className="w-full py-3.5 px-4 bg-[#F5A623] hover:bg-[#D9861A] text-white font-semibold rounded-[16px] transition-colors flex items-center justify-center gap-2 shadow-soft"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing ₹{amount.toFixed(2)}...</span>
                  </>
                ) : (
                  <span>Pay ₹{amount.toFixed(2)}</span>
                )}
              </button>
              <p className="text-center text-[11px] text-[#7A7670] mt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4CAF50]" /> 256-bit encrypted campus payment gateway
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
