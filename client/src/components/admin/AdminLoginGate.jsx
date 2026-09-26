import React, { useState } from 'react';
import { Printer, Lock, Mail, ShieldAlert, ArrowRight, Loader2, X, Sparkles } from 'lucide-react';
import { authApi } from '../../api/authApi';

export default function AdminLoginGate({ onLoginSuccess, onClose }) {
  const [email, setEmail] = useState('admin@campusprint.edu');
  const [password, setPassword] = useState('adminpassword123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fillDemo = () => {
    setEmail('admin@campusprint.edu');
    setPassword('adminpassword123');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login(email, password);
      if (res.success && res.token) {
        localStorage.setItem('printflow_admin_token', res.token);
        localStorage.setItem('weprint_admin_token', res.token);
        onLoginSuccess(res.user);
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch (err) {
      setError(err.message || 'Could not connect to authentication service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 w-full">
      <div className="w-full max-w-sm bg-white rounded-[24px] p-6 sm:p-8 shadow-2xl border border-[#1E1E1E]/10 space-y-5 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#7A7670] hover:text-[#1E1E1E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-[#1E1E1E] text-[#F5A623] flex items-center justify-center mx-auto shadow-md">
            <Printer className="w-6 h-6" />
          </div>
          <h2 className="text-[20px] font-bold text-[#1E1E1E]">Shopkeeper Desk</h2>
          <p className="text-[12px] text-[#7A7670]">Sign in with authorized station credentials</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-[12px] text-[13px] text-red-600 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[12px] font-medium text-[#7A7670] block mb-1">Attendant Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@campusprint.edu"
                className="w-full pl-9 pr-3 py-2.5 rounded-[12px] border border-[#1E1E1E]/15 text-[13px] text-[#1E1E1E] focus:outline-none focus:border-[#F5A623]"
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-medium text-[#7A7670] block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-[12px] border border-[#1E1E1E]/15 text-[13px] text-[#1E1E1E] focus:outline-none focus:border-[#F5A623]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1E1E1E] hover:bg-black text-white font-semibold text-[14px] rounded-[14px] transition-colors flex items-center justify-center gap-2 shadow-soft disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#F5A623]" />
            ) : (
              <>
                <span>Enter Station</span>
                <ArrowRight className="w-4 h-4 text-[#F5A623]" />
              </>
            )}
          </button>
        </form>

        <div className="pt-1 text-center space-y-2">
          <button
            type="button"
            onClick={fillDemo}
            className="text-[12px] text-[#F5A623] hover:text-[#D9861A] font-medium flex items-center justify-center gap-1 mx-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-fill Demo Credentials</span>
          </button>
          <p className="text-[11px] text-[#7A7670]">
            Credentials: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">admin@campusprint.edu</code> / <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">adminpassword123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
