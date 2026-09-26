import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, CreditCard, HelpCircle, Shield, Edit3, Check, Loader2, Plus, ChevronRight, Store } from 'lucide-react';
import { usePrintOrder } from '../../context/PrintOrderContext';

export default function StudentProfile({ onOpenShopkeeperLogin }) {
  const { studentProfile, updateStudentProfile, topUpWallet, resetDemoData } = usePrintOrder();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [toppingUp, setToppingUp] = useState(false);
  const [showTopUpOptions, setShowTopUpOptions] = useState(false);

  useEffect(() => {
    if (studentProfile) {
      setName(studentProfile.name || '');
      setPhone(studentProfile.phone || '');
      setEmail(studentProfile.email || '');
      setDepartment(studentProfile.department || 'Computer Science');
      setRollNumber(studentProfile.rollNumber || '2024CS082');
    }
  }, [studentProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateStudentProfile({
        name,
        phone,
        email,
        department,
        rollNumber,
      });
      setIsEditing(false);
    } catch (e) {
      // Handled in context notification
    } finally {
      setSaving(false);
    }
  };

  const initials = (name || 'Alex Rivera')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const walletDisplay = (studentProfile?.walletBalance ?? 140.0).toFixed(2);

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-[#1E1E1E]">Student profile</h1>
          <p className="text-[13px] text-[#7A7670] mt-0.5">Anonymous Device Session</p>
        </div>
        <button
          onClick={() => {
            if (isEditing) handleSave();
            else setIsEditing(true);
          }}
          disabled={saving}
          className="px-3 py-1.5 rounded-[12px] bg-[#FDF8EF] border border-[#F5A623]/30 text-[#1E1E1E] text-[12px] font-semibold flex items-center gap-1.5 hover:bg-[#faeed6] transition-colors"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F5A623]" />
          ) : isEditing ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#4CAF50]" />
              <span>Save</span>
            </>
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5 text-[#F5A623]" />
              <span>Edit</span>
            </>
          )}
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-[20px] p-5 shadow-soft border border-[#1E1E1E]/5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#F5A623]/20 border-2 border-[#F5A623] flex items-center justify-center text-[#D9861A] font-bold text-[18px] shrink-0">
          {initials}
        </div>
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={name}
              placeholder="Your full name"
              onChange={(e) => setName(e.target.value)}
              className="w-full font-bold text-[16px] text-[#1E1E1E] border-b border-[#F5A623] focus:outline-none bg-transparent pb-0.5"
            />
          ) : (
            <h2 className="text-[17px] font-bold text-[#1E1E1E]">
              {name || 'Student (Not set)'}
            </h2>
          )}

          <p className="text-[13px] text-[#7A7670] mt-0.5">
            {department} · Roll #{rollNumber}
          </p>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-[#4CAF50]/15 text-[#4CAF50] text-[11px] font-semibold">
            Active Campus Device
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
          {isEditing ? (
            <input
              type="email"
              value={email}
              placeholder="student@campus.edu"
              onChange={(e) => setEmail(e.target.value)}
              className="text-right text-[13px] text-[#1E1E1E] border-b border-gray-300 focus:outline-none"
            />
          ) : (
            <span className="font-medium text-[#1E1E1E]">{email || 'Not configured'}</span>
          )}
        </div>

        <div className="py-2.5 flex items-center justify-between text-[14px]">
          <div className="flex items-center gap-2.5 text-[#7A7670]">
            <Phone className="w-4 h-4" />
            <span>Phone</span>
          </div>
          {isEditing ? (
            <input
              type="text"
              value={phone}
              placeholder="+91 00000 00000"
              onChange={(e) => setPhone(e.target.value)}
              className="text-right text-[13px] text-[#1E1E1E] border-b border-gray-300 focus:outline-none"
            />
          ) : (
            <span className="font-medium text-[#1E1E1E]">{phone || 'Not configured'}</span>
          )}
        </div>

        <div className="py-2.5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[14px]">
            <div className="flex items-center gap-2.5 text-[#7A7670]">
              <CreditCard className="w-4 h-4" />
              <span>Campus Wallet</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#4CAF50] text-[15px]">₹{walletDisplay}</span>
              <button
                type="button"
                onClick={() => setShowTopUpOptions(!showTopUpOptions)}
                className="px-2 py-0.5 rounded-lg bg-[#4CAF50]/15 text-[#4CAF50] text-[11px] font-semibold hover:bg-[#4CAF50]/25 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Top Up</span>
              </button>
            </div>
          </div>

          {showTopUpOptions && (
            <div className="p-3 bg-[#FDF8EF] rounded-[12px] border border-[#F5A623]/20 space-y-2 animate-in fade-in duration-150">
              <span className="text-[11px] text-[#7A7670] font-medium block">Select quick amount to add:</span>
              <div className="grid grid-cols-3 gap-2">
                {[50, 100, 200].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    disabled={toppingUp}
                    onClick={async () => {
                      setToppingUp(true);
                      try {
                        await topUpWallet(amt);
                        setShowTopUpOptions(false);
                      } finally {
                        setToppingUp(false);
                      }
                    }}
                    className="py-1.5 px-2 bg-white hover:bg-[#F5A623] hover:text-white text-[#1E1E1E] text-[12px] font-semibold rounded-[8px] border border-[#1E1E1E]/10 transition-all shadow-sm flex items-center justify-center gap-1"
                  >
                    {toppingUp ? <Loader2 className="w-3 h-3 animate-spin" /> : `+₹${amt}`}
                  </button>
                ))}
              </div>
            </div>
          )}
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

      {/* Attendant & Shop Owner Access */}
      <div className="bg-white rounded-[16px] p-4 shadow-soft border border-[#1E1E1E]/5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#1E1E1E] text-[#F5A623] flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[14px] font-semibold text-[#1E1E1E]">Shopkeeper Desk</h4>
            <p className="text-[12px] text-[#7A7670]">Station attendants sign in to manage print orders & hardware</p>
          </div>
        </div>

        {onOpenShopkeeperLogin && (
          <button
            type="button"
            onClick={onOpenShopkeeperLogin}
            className="px-3.5 py-2 rounded-[12px] bg-[#1E1E1E] hover:bg-black text-white text-[12px] font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-soft"
          >
            <span>Login</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#F5A623]" />
          </button>
        )}
      </div>

      {/* Reset Demo Data Button */}
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
