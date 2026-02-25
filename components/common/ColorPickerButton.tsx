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
    // Only update if not dragging (simple check could be added, but relying on stability for now)
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

    // Ensure we capture the full range 0-100 correctly
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

  // Improved Gradient Logic to ensure proper saturation/value mixing
  // Layer 1: Hue (Background)
  // Layer 2: White to Transparent-White (Left to Right)
  // Layer 3: Traansparent-Black to Black (Top to Bottom) - OR Black to Transparent (Bottom to Top)

  // Standard CSS approach for S/V box:
  // background-color: hsl(hue, 100%, 50%)
  // background-image: 
  //   linear-gradient(to top, #000 0%, transparent 100%),
  //   linear-gradient(to right, #fff 0%, rgba(255,255,255,0) 100%)

  const svBackgroundStyle = {
    backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
    backgroundImage: `
      linear-gradient(to top, #000 0%, rgba(0,0,0,0) 100%), 
      linear-gradient(to right, #fff 0%, rgba(255,255,255,0) 100%)
    `
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
          className="absolute top-full left-0 mt-4 z-[150] w-64 bg-zinc-900 border border-white/10 rounded-3xl p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
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
            {/* Saturation/Value Picker */}
            <div
              ref={svRef}
              onMouseDown={(e) => { handleSvMove(e); startDragging(handleSvMove); }}
              onTouchStart={(e) => { handleSvMove(e); startDragging(handleSvMove); }}
              className="flex-1 relative cursor-crosshair"
            >
              {/* Box with Gradients - Rounded and Clipped */}
              <div
                className="absolute inset-0 rounded-2xl border border-white/10 overflow-hidden"
                style={svBackgroundStyle}
              />

              {/* Marker - Outside clipping but positioned relatively */}
              <div
                className="absolute w-4 h-4 border-2 border-white bg-transparent rounded-full -translate-x-1/2 -translate-y-1/2 shadow-xl pointer-events-none ring-1 ring-black/20"
                style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
              />
            </div>

            {/* Hue Slider */}
            <div
              ref={hueRef}
              onMouseDown={(e) => { handleHueMove(e); startDragging(handleHueMove); }}
              onTouchStart={(e) => { handleHueMove(e); startDragging(handleHueMove); }}
              className="w-8 rounded-2xl relative cursor-ns-resize border border-white/5 overflow-hidden"
              style={{ background: 'linear-gradient(to bottom, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}
            >
              <div
                className="absolute w-full h-2 bg-white border border-black/20 rounded-full left-0 -translate-y-1/2 shadow-lg pointer-events-none"
                style={{ top: `${(hsv.h / 360) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
            <div className="font-mono text-xs font-black uppercase text-white">{value}</div>
            <div className="w-6 h-6 rounded-md border border-white/10" style={{ backgroundColor: value }} />
          </div>

          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="grid grid-cols-7 gap-2">
              {[
                '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
                '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e'
              ].map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    const newHsv = hexToHsv(color);
                    setHsv(newHsv);
                    onChange(color);
                  }}
                  className="w-6 h-6 rounded-full border border-white/10 hover:scale-125 hover:border-white transition-all shadow-sm"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPickerButton;