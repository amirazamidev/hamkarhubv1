import React from 'react';
import { Wifi, Users, Coffee, Router, CheckCircle2, Shield } from 'lucide-react';
import { HotspotSession } from '../types';

interface HeaderProps {
  activeTab: 'portal' | 'members' | 'cafe' | 'admin';
  setActiveTab: (tab: 'portal' | 'members' | 'cafe' | 'admin') => void;
  session: HotspotSession;
  onOpenHotspotModal: () => void;
  onOpenAccountModal: () => void;
  onlineCount: number;
  hubTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  session,
  onOpenHotspotModal,
  onOpenAccountModal,
  onlineCount,
  hubTitle = 'همکار هاب',
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-6 h-16">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 border border-amber-500/30 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-amber-500/20">
            ⚡
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            {hubTitle}
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-xs lg:text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('portal')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer pb-1 ${
              activeTab === 'portal'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white text-slate-400'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>کپتیو پورتال و چت</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer pb-1 ${
              activeTab === 'members'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white text-slate-400'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>حاضرین ({onlineCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('cafe')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer pb-1 ${
              activeTab === 'cafe'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white text-slate-400'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>کافه و سفارشات</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer pb-1 ${
              activeTab === 'admin'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white text-slate-400'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>پنل ادمین و میکروتیک</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action / User Profile Pill */}
        <div className="flex items-center gap-3 shrink-0">
          {session.isConnected ? (
            <button
              onClick={onOpenAccountModal}
              title="مشاهده حساب کاربری، حجم مصرفی و تغییر رمز"
              className="px-3.5 py-2 text-xs font-medium rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900/60 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">حساب کاربری:</span>
              <span className="font-mono text-emerald-200 font-bold">{session.username}</span>
            </button>
          ) : (
            <button
              onClick={onOpenHotspotModal}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
            >
              <Wifi className="w-4 h-4" />
              <span>ورود به اینترنت</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav tabs */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-900/95 py-2 px-1 text-[11px]">
        <button
          onClick={() => setActiveTab('portal')}
          className={`flex flex-col items-center gap-1 py-1 px-1.5 rounded cursor-pointer ${
            activeTab === 'portal' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Wifi className="w-4 h-4" />
          <span>پورتال و چت</span>
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex flex-col items-center gap-1 py-1 px-1.5 rounded cursor-pointer ${
            activeTab === 'members' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>حاضرین</span>
        </button>
        <button
          onClick={() => setActiveTab('cafe')}
          className={`flex flex-col items-center gap-1 py-1 px-1.5 rounded cursor-pointer ${
            activeTab === 'cafe' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>کافه منو</span>
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center gap-1 py-1 px-1.5 rounded cursor-pointer ${
            activeTab === 'admin' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>پنل ادمین</span>
        </button>
      </div>
    </header>
  );
};
