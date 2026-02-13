"use client";

import React, { useState, useRef, useEffect } from 'react';
import { hexToHsv, hsvToHex, HSV } from '../../lib/colorPicker';
import { X, Pipette } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

const ColorPickerButton: React.FC<Props> = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hsv, setHsv] = useState<HSV>(hexToHsv(value));
  const popoverRef = useRef<HTMLDivElement>(null);
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHsv(hexToHsv(value));
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const updateAll = (newHsv: HSV) => {
    setHsv(newHsv);
    onChange(hsvToHex(newHsv));
  };

  const handleSvMove = (e: any) => {
    if (!svRef.current) return;
    const rect = svRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const s = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const v = Math.min(100, Math.max(0, (1 - (clientY - rect.top) / rect.height) * 100));
    updateAll({ ...hsv, s, v });
  };

  const handleHueMove = (e: any) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const h = Math.min(360, Math.max(0, ((clientY - rect.top) / rect.height) * 360));
    updateAll({ ...hsv, h });
  };

  const startDragging = (handler: (e: any) => void) => {
    const onMove = (e: any) => handler(e);
    const onEnd = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

  return (
    <div className="relative flex items-center gap-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-[10px] border border-white/20 shadow-lg active:scale-95 transition-transform flex-shrink-0"
        style={{ backgroundColor: value }}
        title={label}
      />
      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{label}</span>

      {isOpen && (
        <div 
          ref={popoverRef}
          className="absolute bottom-full left-0 mb-4 z-[150] w-64 bg-zinc-900 border border-white/10 rounded-3xl p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Pipette size={14} className="text-zinc-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-600 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="flex gap-4 h-40 mb-4">
            <div 
              ref={svRef}
              onMouseDown={(e) => { handleSvMove(e); startDragging(handleSvMove); }}
              className="flex-1 rounded-2xl relative cursor-crosshair overflow-hidden border border-white/5"
              style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <div 
                className="absolute w-4 h-4 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-xl"
                style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
              />
            </div>
            <div 
              ref={hueRef}
              onMouseDown={(e) => { handleHueMove(e); startDragging(handleHueMove); }}
              className="w-8 rounded-2xl relative cursor-ns-resize border border-white/5"
              style={{ background: 'linear-gradient(to bottom, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}
            >
              <div 
                className="absolute w-full h-2 bg-white border border-black/20 rounded-full left-0 -translate-y-1/2 shadow-lg"
                style={{ top: `${(hsv.h / 360) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
            <div className="font-mono text-xs font-black uppercase text-white">{value}</div>
            <div className="w-6 h-6 rounded-md border border-white/10" style={{ backgroundColor: value }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPickerButton;