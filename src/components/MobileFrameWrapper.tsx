import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal } from 'lucide-react';

interface MobileFrameWrapperProps {
  children: React.ReactNode;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
}

export const MobileFrameWrapper: React.FC<MobileFrameWrapperProps> = ({
  children,
  isMobileFrame,
  onToggleMobileFrame,
}) => {
  const [time, setTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isMobileFrame) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 py-4 sm:py-8 px-2 flex flex-col items-center justify-center">
      {/* Top Floating Control Toolbar (Desktop helper) */}
      <div className="mb-3 flex items-center justify-between w-full max-w-[430px] px-2 text-slate-300">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <Smartphone className="w-4 h-4 text-blue-400" />
          <span>Simulasi Aplikasi Mobile</span>
        </div>
        <button
          onClick={onToggleMobileFrame}
          className="flex items-center gap-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-full border border-slate-700 shadow-sm transition-all"
        >
          <Monitor className="w-3.5 h-3.5 text-blue-400" />
          <span>Beralih ke Layar Desktop</span>
        </button>
      </div>

      {/* Realistic Smartphone Shell */}
      <div className="relative w-full max-w-[420px] h-[880px] max-h-[92vh] bg-slate-950 rounded-[48px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_2px_#334155] border-4 border-slate-800 flex flex-col overflow-hidden">
        
        {/* Smartphone Status Bar */}
        <div className="h-7 w-full bg-white text-slate-900 flex items-center justify-between px-6 pt-1 shrink-0 z-30 select-none">
          <span className="text-[12px] font-bold tracking-tight text-slate-900">{time}</span>
          
          {/* Dynamic Island Pill */}
          <div className="w-20 h-4 bg-slate-950 rounded-full flex items-center justify-end px-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-800">
            <Signal className="w-3.5 h-3.5 stroke-[2.5]" />
            <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
            <Battery className="w-4 h-4 stroke-[2.5] fill-slate-800" />
          </div>
        </div>

        {/* Screen Viewport with custom scrollbar */}
        <div className="flex-1 w-full bg-slate-50 overflow-y-auto overflow-x-hidden relative flex flex-col scrollbar-thin scrollbar-thumb-slate-300">
          {children}
        </div>

        {/* Smartphone Home Indicator Bar */}
        <div className="h-5 w-full bg-white flex items-center justify-center shrink-0 z-30">
          <div className="w-32 h-1 bg-slate-800 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
