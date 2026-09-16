import React from 'react';
import { User, Mail, Phone, CreditCard, HelpCircle, FileCheck, Shield, ChevronRight } from 'lucide-react';
import { usePrintOrder } from '../../context/PrintOrderContext';

export default function StudentProfile() {
  const { resetDemoData } = usePrintOrder();

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      <div>
        <h1 className="text-[24px] font-semibold text-[#1E1E1E]">Student profile</h1>
        <p className="text-[13px] text-[#7A7670] mt-0.5">Central University Campus ID</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-[20px] p-5 shadow-soft border border-[#1E1E1E]/5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#F5A623]/20 border-2 border-[#F5A623] flex items-center justify-center text-[#D9861A] font-bold text-[18px]">
          AR
        </div>
        <div>
          <h2 className="text-[17px] font-bold text-[#1E1E1E]">Alex Rivera</h2>
          <p className="text-[13px] text-[#7A7670]">Computer Science · Roll #2024CS082</p>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-[#4CAF50]/15 text-[#4CAF50] text-[11px] font-semibold">
            Verified Student
          </span>
        </div>
      </div>

      {/* Account Info Details */}
      <div className="bg-white rounded-[16px] p-4 shadow-soft border border-[#1E1E1E]/5 divide-y divide-[#1E1E1E]/10">
        <div className="py-2.5 flex items-center justify-between text-[14px]">
          <div className="flex items-center gap-2.5 text-[#7A7670]">
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </div>
          <span className="font-medium text-[#1E1E1E]">alex.r@campus.edu</span>
        </div>

        <div className="py-2.5 flex items-center justify-between text-[14px]">
          <div className="flex items-center gap-2.5 text-[#7A7670]">
            <Phone className="w-4 h-4" />
            <span>Phone</span>
          </div>
          <span className="font-medium text-[#1E1E1E]">+91 98765 43210</span>
        </div>

        <div className="py-2.5 flex items-center justify-between text-[14px]">
          <div className="flex items-center gap-2.5 text-[#7A7670]">
            <CreditCard className="w-4 h-4" />
            <span>Campus Wallet</span>
          </div>
          <span className="font-bold text-[#4CAF50]">₹140.00</span>
        </div>
      </div>

      {/* Campus Print Policy Info */}
      <div className="bg-[#FDF8EF] rounded-[16px] p-4 border border-[#F5A623]/20 space-y-2">
        <h3 className="text-[14px] font-semibold text-[#1E1E1E] flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#F5A623]" />
          Print Station Guidelines
        </h3>
        <ul className="text-[12px] text-[#7A7670] space-y-1 list-disc list-inside">
          <li>Orders not collected within 48 hours are recycled.</li>
          <li>Ensure PDFs have standard A4 margins for best quality.</li>
          <li>For thesis binding, inquire directly at counter desk 1.</li>
        </ul>
      </div>

      {/* Reset Demo Data Affordance */}
      <div className="pt-3">
        <button
          type="button"
          onClick={resetDemoData}
          className="w-full py-2.5 text-[13px] text-[#7A7670] hover:text-[#1E1E1E] font-medium border border-dashed border-[#1E1E1E]/20 rounded-[14px] transition-colors"
        >
          Reset Demo Data
        </button>
      </div>
    </div>
  );
}
