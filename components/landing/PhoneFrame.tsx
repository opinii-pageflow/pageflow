import React from 'react';
import clsx from 'clsx';

type Props = {
  children: React.ReactNode;
  className?: string;
  viewportClassName?: string;
  notch?: boolean;
};

const PhoneFrame: React.FC<Props> = ({ children, className, viewportClassName, notch = true }) => {
  return (
    <div
      className={clsx(
        'relative w-full h-full rounded-[2.5rem] bg-black border border-neon-blue/20 shadow-[0_0_50px_rgba(0,242,255,0.1)] backdrop-blur-3xl p-2.5 flex flex-col',
        className
      )}
    >
      {/* brilho/metal do frame */}
      <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_45%,rgba(255,255,255,0.06))]" />

      <div className="relative flex-1 w-full rounded-[2rem] bg-black border border-white/10 overflow-hidden flex flex-col">
        {notch && (
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-2 z-20">
            <div className="h-5 w-24 rounded-full bg-zinc-900/90 border border-white/10 shadow-sm" />
          </div>
        )}

        {/* Viewport com scroll real */}
        <div
          className={clsx(
            'relative w-full flex-1 overflow-y-auto overflow-x-hidden overscroll-contain no-scrollbar',
            viewportClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default PhoneFrame;