"use client";

import React from 'react';
import { LeadStatus } from '../../types';
import clsx from 'clsx';

interface Props {
  status: LeadStatus;
  className?: string;
}

const LeadStatusBadge: React.FC<Props> = ({ status, className }) => {
  const styles: Record<LeadStatus, string> = {
    novo: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    contatado: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    negociando: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    fechado: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    perdido: 'bg-zinc-800 text-zinc-500 border-white/5'
  };

  return (
    <span className={clsx(
      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
      styles[status],
      className
    )}>
      {status}
    </span>
  );
};

export default LeadStatusBadge;