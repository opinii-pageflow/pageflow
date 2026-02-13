import React from 'react';
import clsx from 'clsx';

type Props = {
  /** Conteúdo renderizado “dentro da tela” */
  children: React.ReactNode;
  /** Ajustes no container externo (o “corpo do celular”) */
  className?: string;
  /** Ajustes no viewport (a “tela” com scroll) */
  viewportClassName?: string;
  /** Exibe notch/ilha no topo */
  notch?: boolean;
};

const PhoneFrame: React.FC<Props> = ({ children, className, viewportClassName, notch = true }) => {
  return (
    <div
      className={clsx(
        'relative w-full rounded-[2.8rem] bg-zinc-950/60 border border-white/10 shadow-2xl backdrop-blur-3xl p-3',
        className
      )}
    >
      {/* brilho/metal do frame */}
      <div className="pointer-events-none absolute inset-0 rounded-[2.8rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_45%,rgba(255,255,255,0.06))]" />

      <div className="relative rounded-[2.3rem] bg-black border border-white/10 overflow-hidden">
        {notch ? (
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-2 z-20">
            <div className="h-6 w-28 rounded-full bg-zinc-900/80 border border-white/10 shadow-sm" />
            <div className="absolute right-4 top-1.5 h-2 w-2 rounded-full bg-white/10" />
          </div>
        ) : null}

        {/* Viewport com scroll real */}
        <div
          className={clsx(
            'relative w-full overflow-y-auto overflow-x-hidden overscroll-contain no-scrollbar',
            // altura padrão do “telefone” (pode ser sobrescrita)
            'h-[520px] md:h-[560px]',
            viewportClassName
          )}
        >
          {/* safe area para o notch */}
          <div className={clsx(notch ? 'pt-10' : 'pt-0')}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default PhoneFrame;