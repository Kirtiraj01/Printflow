import React from 'react';
import { Upload, Sliders, CreditCard, Check } from 'lucide-react';

export default function StepIndicator({ currentStep }) {
  const steps = [
    { id: 1, label: 'Upload', icon: Upload },
    { id: 2, label: 'Options', icon: Sliders },
    { id: 3, label: 'Payment', icon: CreditCard },
  ];

  return (
    <div className="w-full px-2 py-3 mb-4">
      <div className="flex items-center justify-between relative">
        {/* Background track */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-[2px] bg-[#1E1E1E]/10 -z-0" />
        {/* Filled track */}
        <div
          className="absolute top-1/2 left-6 -translate-y-1/2 h-[2px] bg-[#F5A623] transition-all duration-300 -z-0"
          style={{
            width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : 'calc(100% - 48px)',
          }}
        />

        {steps.map((step) => {
          const isDone = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-[#4CAF50] text-white'
                    : isCurrent
                    ? 'bg-[#F5A623] text-white shadow-soft ring-4 ring-[#F5A623]/20'
                    : 'bg-white border border-[#1E1E1E]/15 text-[#7A7670]'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={`mt-1.5 text-[12px] font-medium transition-colors ${
                  isCurrent ? 'text-[#1E1E1E] font-semibold' : 'text-[#7A7670]'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
