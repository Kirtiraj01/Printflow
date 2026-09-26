import React, { useState } from 'react';
import { X, Settings, Printer, IndianRupee, Power, Check, Loader2 } from 'lucide-react';
import { usePrintOrder } from '../../context/PrintOrderContext';

export default function AdminStationSettingsModal({ isOpen, onClose }) {
  const { stationConfig, updateStationConfig } = usePrintOrder();

  const [stationName, setStationName] = useState(stationConfig?.stationName || 'PrintFlow Desk #2 · Central Campus Library');
  const [isOpenDesk, setIsOpenDesk] = useState(stationConfig?.isOpen ?? true);
  const [printerModel, setPrinterModel] = useState(stationConfig?.printerModel || 'Canon iR-ADV C5560');
  const [printerStatus, setPrinterStatus] = useState(stationConfig?.printerStatus || 'Ready');
  const [bwPerPage, setBwPerPage] = useState(stationConfig?.rates?.bwPerPage ?? 2);
  const [colorPerPage, setColorPerPage] = useState(stationConfig?.rates?.colorPerPage ?? 8);
  const [a3Multiplier, setA3Multiplier] = useState(stationConfig?.rates?.a3Multiplier ?? 1.5);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateStationConfig({
        stationName,
        isOpen: isOpenDesk,
        printerModel,
        printerStatus,
        rates: {
          bwPerPage: Number(bwPerPage),
          colorPerPage: Number(colorPerPage),
          a3Multiplier: Number(a3Multiplier),
        },
      });
      onClose();
    } catch (err) {
      // Notification handled in context
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1E1E1E]/10 flex items-center justify-between bg-[#FDF8EF]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[#1E1E1E] text-[#F5A623] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-[#1E1E1E]">Station & Pricing Settings</h3>
              <p className="text-[12px] text-[#7A7670]">Manage print rates and hardware status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#7A7670] hover:text-[#1E1E1E] shadow-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5">
          {/* Station Status Toggle */}
          <div className="flex items-center justify-between p-4 rounded-[16px] bg-[#FDF8EF] border border-[#1E1E1E]/10">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                isOpenDesk ? 'bg-[#4CAF50]/15 text-[#4CAF50]' : 'bg-[#E24B4A]/15 text-[#E24B4A]'
              }`}>
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[14px] font-semibold text-[#1E1E1E]">
                  Counter Desk Status
                </h4>
                <p className="text-[12px] text-[#7A7670]">
                  {isOpenDesk ? 'Accepting student print jobs' : 'Closed / Paused'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpenDesk(!isOpenDesk)}
              className={`px-4 py-2 rounded-[12px] text-[13px] font-semibold transition-all ${
                isOpenDesk
                  ? 'bg-[#4CAF50] text-white hover:bg-[#43A047]'
                  : 'bg-[#E24B4A] text-white hover:bg-[#D32F2F]'
              }`}
            >
              {isOpenDesk ? 'Open' : 'Closed'}
            </button>
          </div>

          {/* Station Name & Printer Model */}
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-[#7A7670] mb-1">Station Desk Title</label>
              <input
                type="text"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#1E1E1E]/15 text-[13px] text-[#1E1E1E] focus:outline-none focus:border-[#F5A623]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#7A7670] mb-1">Printer Model</label>
                <input
                  type="text"
                  value={printerModel}
                  onChange={(e) => setPrinterModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#1E1E1E]/15 text-[13px] text-[#1E1E1E] focus:outline-none focus:border-[#F5A623]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#7A7670] mb-1">Printer Hardware Status</label>
                <select
                  value={printerStatus}
                  onChange={(e) => setPrinterStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#1E1E1E]/15 text-[13px] text-[#1E1E1E] focus:outline-none focus:border-[#F5A623] bg-white"
                >
                  <option value="Ready">Ready</option>
                  <option value="Printing">Printing</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing Rates */}
          <div className="pt-2">
            <h4 className="text-[14px] font-semibold text-[#1E1E1E] mb-2 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-[#F5A623]" />
              <span>Print Pricing Rates</span>
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-[#FDF8EF] rounded-[14px] border border-[#1E1E1E]/10">
                <label className="block text-[11px] font-medium text-[#7A7670] mb-1">B&W (per page)</label>
                <div className="flex items-center gap-1 text-[16px] font-bold text-[#1E1E1E]">
                  <span>₹</span>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={bwPerPage}
                    onChange={(e) => setBwPerPage(e.target.value)}
                    className="w-full bg-transparent border-b border-[#F5A623] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-[#FDF8EF] rounded-[14px] border border-[#1E1E1E]/10">
                <label className="block text-[11px] font-medium text-[#7A7670] mb-1">Color (per page)</label>
                <div className="flex items-center gap-1 text-[16px] font-bold text-[#1E1E1E]">
                  <span>₹</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={colorPerPage}
                    onChange={(e) => setColorPerPage(e.target.value)}
                    className="w-full bg-transparent border-b border-[#F5A623] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-[#FDF8EF] rounded-[14px] border border-[#1E1E1E]/10">
                <label className="block text-[11px] font-medium text-[#7A7670] mb-1">A3 Multiplier</label>
                <div className="flex items-center gap-1 text-[16px] font-bold text-[#1E1E1E]">
                  <span>x</span>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={a3Multiplier}
                    onChange={(e) => setA3Multiplier(e.target.value)}
                    className="w-full bg-transparent border-b border-[#F5A623] focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
            <p className="text-[11px] text-[#7A7670] mt-1.5">
              Price calculations for new student uploads will immediately reflect these updated rates.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#1E1E1E]/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-[12px] border border-[#1E1E1E]/15 text-[#7A7670] hover:text-[#1E1E1E] text-[13px] font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-[12px] bg-[#F5A623] hover:bg-[#D9861A] text-white text-[13px] font-semibold shadow-soft flex items-center gap-1.5 transition-colors disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
