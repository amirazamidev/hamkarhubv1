import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Smartphone,
  HardDrive,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wifi,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { HotspotSession } from '../types';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: HotspotSession;
  onLogout: () => void;
  onSessionUpdate?: (updated: Partial<HotspotSession>) => void;
}

interface AccountDetails {
  username: string;
  profile: string;
  isConnected: boolean;
  bytesIn: number;
  bytesOut: number;
  totalBytesUsed: number;
  limitBytesTotal: number;
  remainingBytes: number | null;
  activeDevicesCount: number;
  maxSharedUsers: number;
  activeDevices: Array<{
    id: string;
    address: string;
    macAddress: string;
    uptime: string;
  }>;
  uptime: string;
  comment: string;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  session,
  onLogout,
}) => {
  const [accountData, setAccountData] = useState<AccountDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Change password form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwStatus, setPwStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  const fetchAccount = async () => {
    if (!session.username) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/user/account?username=${encodeURIComponent(session.username)}`);
      if (res.ok) {
        const data = await res.json();
        setAccountData(data);
      }
    } catch (err) {
      console.error('Error fetching account:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && session.username) {
      fetchAccount();
      setPwStatus({ type: 'idle', message: '' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, session.username]);

  if (!isOpen) return null;

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '۰ مگابایت';
    if (bytes >= 1073741824) {
      return `${(bytes / 1073741824).toFixed(2)} گیگابایت`;
    }
    return `${(bytes / 1048576).toFixed(1)} مگابایت`;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setPwStatus({ type: 'error', message: 'رمز عبور جدید باید حداقل ۴ کاراکتر باشد' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwStatus({ type: 'error', message: 'تکرار رمز عبور با رمز جدید مطابقت ندارد' });
      return;
    }

    setPwStatus({ type: 'loading', message: 'در حال ذخیره و اعمال روی روتر میکروتیک...' });
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: session.username,
          oldPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'خطا در تغییر رمز عبور');
      }
      setPwStatus({ type: 'success', message: 'رمز عبور اینترنت شما با موفقیت تغییر یافت!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwStatus({ type: 'error', message: err.message || 'خطا در تغییر رمز' });
    }
  };

  const totalUsed = accountData ? accountData.totalBytesUsed : (session.bytesInNum || 0) + (session.bytesOutNum || 0);
  const totalLimit = accountData ? accountData.limitBytesTotal : (session.limitBytesTotal || 0);
  const activeDev = accountData ? accountData.activeDevicesCount : (session.activeDevicesCount || 1);
  const maxDev = accountData ? accountData.maxSharedUsers : (session.maxSharedUsers || 2);

  const percentUsed = totalLimit > 0 ? Math.min(100, Math.round((totalUsed / totalLimit) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-lg font-bold">
              👤
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>پنل حساب کاربری وای‌فای</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  {session.username}
                </span>
              </h3>
              <p className="text-xs text-slate-400">وضعیت مصرف ترافیک، دستگاه‌های متصل و تغییر رمز</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAccount}
              disabled={isLoading}
              title="بروزرسانی داده‌ها"
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* TRAFFIC CARD */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  حجم ترافیک مصرفی
                </span>
                <span className="font-mono text-amber-400">
                  {totalLimit > 0 ? `${percentUsed}٪` : 'نامحدود'}
                </span>
              </div>

              <div>
                <div className="text-base font-black text-white font-mono">
                  {formatBytes(totalUsed)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {totalLimit > 0 ? (
                    <>سقف مجاز: <span className="font-mono text-slate-200">{formatBytes(totalLimit)}</span></>
                  ) : (
                    <span className="text-emerald-400">پلن نامحدود فضای کار</span>
                  )}
                </div>
              </div>

              {totalLimit > 0 && (
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      percentUsed > 85 ? 'bg-rose-500' : percentUsed > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
              )}
            </div>

            {/* DEVICES CARD */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  دستگاه‌های متصل
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  {activeDev} از {maxDev}
                </span>
              </div>

              <div>
                <div className="text-base font-black text-white font-mono">
                  {activeDev} دستگاه فعال
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  سقف همزمان: <span className="font-mono text-slate-200">{maxDev} دستگاه</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono">{session.ip || '192.168.88.102'}</span>
              </div>
            </div>
          </div>

          {/* CONNECTED DEVICES LIST */}
          {accountData?.activeDevices && accountData.activeDevices.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                نشست‌های آنلاین در میکروتیک
              </h4>
              <div className="space-y-1.5">
                {accountData.activeDevices.map((dev, idx) => (
                  <div
                    key={dev.id || idx}
                    className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="font-mono text-white">{dev.address}</span>
                      <span className="text-[11px] font-mono text-slate-500">({dev.macAddress})</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {dev.uptime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHANGE PASSWORD ACCORDION/FORM */}
          <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <KeyRound className="w-4 h-4" />
              <span>تغییر کلمه عبور اینترنت وای‌فای</span>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">کلمه عبور قبلی (در صورت داشتن رمز قبلی)</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="رمز عبور فعلی"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">کلمه عبور جدید</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="حداقل ۴ کاراکتر"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">تکرار کلمه عبور جدید</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="تکرار رمز عبور جدید"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition font-mono"
                  />
                </div>
              </div>

              {pwStatus.message && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    pwStatus.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : pwStatus.type === 'error'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {pwStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{pwStatus.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={pwStatus.type === 'loading'}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>ذخیره رمز جدید در روتر میکروتیک</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج از شبکه وای‌فای</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
