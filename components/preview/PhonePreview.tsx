import React, { useMemo } from 'react';
import { Profile } from '../../types';
import {
  Check,
  Layout,
  Sparkles,
  Shield,
  Briefcase,
  UserCircle2,
  Grid3X3,
  Rows3,
  Newspaper,
  RectangleHorizontal,
  PanelLeft,
  Layers,
  Grip,
  Image as ImageIcon,
  // ⚠️ Columns3 e BadgeCheck podem não existir dependendo da versão do lucide-react
  // Columns3,
  // BadgeCheck,
  Columns2,
  Badge,
} from 'lucide-react';

interface Props {
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => void;
}

type Tpl = {
  id: string;
  label: string;
  icon: React.ReactNode;
  preview: React.ReactNode;
};

const ThumbShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="h-28 rounded-xl border border-white/10 bg-gradient-to-b from-white/6 to-white/2 overflow-hidden p-3 relative">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.08),transparent_55%),radial-gradient(circle_at_80%_85%,rgba(59,130,246,0.06),transparent_45%)]" />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

const Pill: React.FC<{ label: string; active?: boolean; icon?: React.ReactNode }> = ({
  label,
  active,
  icon,
}) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className={[
          'w-7 h-7 rounded-lg flex items-center justify-center border transition-colors',
          active ? 'border-blue-400/40 bg-blue-400/10 text-blue-200' : 'border-white/10 bg-white/5 text-white/60',
        ].join(' ')}
      >
        {icon}
      </div>
      <div
        className={[
          'text-sm font-medium transition-colors',
          active ? 'text-blue-300' : 'text-white/40',
        ].join(' ')}
      >
        {label}
      </div>
    </div>
  );
};

const TemplatesTab: React.FC<Props> = ({ profile, onUpdate }) => {
  const templates: Tpl[] = useMemo(() => {
    const t: Tpl[] = [
      /**
       * IMPORTANT:
       * - NÃO remover templates existentes (compatibilidade com perfis já criados).
       * - Pode adicionar novos ids, desde que o renderer tenha fallback (PublicProfileRenderer já tem).
       * - Previews aqui são “miniaturas” apenas (ThumbShell), mas devem ser visualmente bem diferentes.
       */

      // 1) Capa / Hero (capa mais presente e contrastada)
      {
        id: 'Cover Clean',
        label: 'Hero Cover (Clean)',
        icon: <ImageIcon size={14} />,
        preview: (
          <div className="h-full flex flex-col relative">
            <div className="h-14 rounded-lg bg-gradient-to-b from-white/30 via-white/16 to-white/8 border border-white/14 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.25),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.18),transparent_55%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/25" />
            </div>
            <div className="-mt-6 mx-auto w-12 h-12 rounded-full bg-white/14 border border-white/22 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/26 mx-auto" />
            <div className="mt-1 w-1/2 h-1 rounded-full bg-white/14 mx-auto" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 rounded-xl bg-white/9 border border-white/12"
                />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Hero Banner',
        label: 'Hero Cover (Banner)',
        icon: <RectangleHorizontal size={14} />,
        preview: (
          <div className="h-full flex flex-col relative">
            <div className="h-12 rounded-lg bg-gradient-to-r from-blue-500/25 via-indigo-500/18 to-emerald-500/18 border border-white/12 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_60%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/35" />
            </div>
            <div className="-mt-5 mx-auto w-10 h-10 rounded-full bg-white/14 border border-white/22" />
            <div className="mt-2 w-3/4 h-1 rounded-full bg-white/24 mx-auto" />
            <div className="mt-1 w-1/2 h-1 rounded-full bg-white/12 mx-auto" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },

      // ✅ NOVOS (capa ocupa mais o topo)
      {
        id: 'Cover Full',
        label: 'Hero Cover (Full)',
        icon: <ImageIcon size={14} />,
        preview: (
          <div className="h-full flex flex-col relative">
            <div className="h-20 rounded-lg bg-gradient-to-b from-white/28 via-white/14 to-white/6 border border-white/14 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.28),transparent_55%),radial-gradient(circle_at_80%_65%,rgba(16,185,129,0.18),transparent_55%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/15 to-black/70" />
            </div>
            <div className="-mt-7 mx-auto w-14 h-14 rounded-full bg-white/14 border border-white/22 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/26 mx-auto" />
            <div className="mt-1 w-1/2 h-1 rounded-full bg-white/14 mx-auto" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'Cover Full Glass',
        label: 'Hero Cover (Full Glass)',
        icon: <Sparkles size={14} />,
        preview: (
          <div className="h-full flex flex-col relative">
            <div className="h-20 rounded-lg border border-white/14 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.25),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.18),transparent_55%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/14 via-white/6 to-white/0" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/65" />
              <div className="absolute inset-0 backdrop-blur-[2px]" />
            </div>
            <div className="-mt-7 mx-auto w-14 h-14 rounded-full bg-white/12 border border-white/22 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/24 mx-auto" />
            <div className="mt-1 w-1/2 h-1 rounded-full bg-white/12 mx-auto" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/8 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },

      // 2) Split / Sidebar / Avatar grande (novos ids com fallback)
      {
        id: 'Side Profile',
        label: 'Side Profile',
        icon: <PanelLeft size={14} />,
        preview: (
          <div className="h-full flex gap-3">
            <div className="w-12 rounded-lg bg-white/6 border border-white/12 flex flex-col items-center pt-2 gap-2">
              <div className="w-7 h-7 rounded-full bg-white/12 border border-white/16" />
              <div className="w-8 h-1 rounded-full bg-white/14" />
              <div className="w-6 h-1 rounded-full bg-white/10" />
            </div>
            <div className="flex-1 flex flex-col">
              <div className="h-7 rounded-lg bg-white/5 border border-white/10" />
              <div className="mt-2 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12" />
                ))}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'Avatar Focus',
        label: 'Avatar Focus',
        icon: <UserCircle2 size={14} />,
        preview: (
          <div className="h-full flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-white/14 border border-white/22 mt-1" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/24" />
            <div className="mt-1 w-1/2 h-1 rounded-full bg-white/12" />
            <div className="mt-3 w-full space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },

      // 3) Botões em Grid
      {
        id: 'Button Grid',
        label: 'Button Grid',
        icon: <Grid3X3 size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/12 border border-white/18" />
              <div className="flex-1">
                <div className="w-1/2 h-1 rounded-full bg-white/22" />
                <div className="mt-1 w-1/3 h-1 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 rounded-lg bg-white/7 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },

      // 4) Lista Clean
      {
        id: 'Minimal Card',
        label: 'Minimal Card',
        icon: <Layout size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/12 border border-white/18" />
              <div className="flex-1">
                <div className="w-1/2 h-1 rounded-full bg-white/22" />
                <div className="mt-1 w-1/3 h-1 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/9 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },

      // 5) Lista com separador / rows
      {
        id: 'Rows Clean',
        label: 'Rows Clean',
        icon: <Rows3 size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/12 border border-white/18" />
              <div className="flex-1">
                <div className="w-1/2 h-1 rounded-full bg-white/22" />
                <div className="mt-1 w-1/3 h-1 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/7 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },

      // 6) Magazine
      {
        id: 'Magazine',
        label: 'Magazine',
        icon: <Newspaper size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="h-10 rounded-lg bg-gradient-to-r from-white/8 via-white/4 to-white/2 border border-white/12" />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="h-12 rounded-lg bg-white/6 border border-white/10" />
              <div className="h-12 rounded-lg bg-white/6 border border-white/10" />
            </div>
            <div className="mt-2 space-y-2">
              <div className="h-3 rounded-xl bg-white/8 border border-white/12" />
              <div className="h-3 rounded-xl bg-white/8 border border-white/12" />
            </div>
          </div>
        ),
      },

      // 7) Colunas (2)
      {
        id: 'Columns 2',
        label: 'Columns 2',
        icon: <Columns2 size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/12 border border-white/18" />
              <div className="flex-1">
                <div className="w-1/2 h-1 rounded-full bg-white/22" />
                <div className="mt-1 w-1/3 h-1 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 rounded-lg bg-white/7 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },

      // 8) Camadas / stacked cards
      {
        id: 'Stacked',
        label: 'Stacked',
        icon: <Layers size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/12 border border-white/18" />
              <div className="flex-1">
                <div className="w-1/2 h-1 rounded-full bg-white/22" />
                <div className="mt-1 w-1/3 h-1 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-6 rounded-lg bg-white/7 border border-white/12" />
              <div className="h-6 rounded-lg bg-white/6 border border-white/10 translate-x-1" />
              <div className="h-6 rounded-lg bg-white/5 border border-white/8 translate-x-2" />
            </div>
          </div>
        ),
      },

      // 9) Premium / badge feel
      {
        id: 'Premium',
        label: 'Premium',
        icon: <Badge size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="h-10 rounded-lg bg-gradient-to-r from-amber-500/10 via-white/6 to-blue-500/10 border border-white/12" />
            <div className="-mt-4 mx-auto w-10 h-10 rounded-full bg-white/12 border border-white/18" />
            <div className="mt-2 w-2/3 h-1 rounded-full bg-white/20 mx-auto" />
            <div className="mt-1 w-1/2 h-1 rounded-full bg-white/10 mx-auto" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/8 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },

      // 10) Segurança / corporate
      {
        id: 'Corporate',
        label: 'Corporate',
        icon: <Briefcase size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/16" />
              <div className="flex-1">
                <div className="w-1/2 h-1 rounded-full bg-white/20" />
                <div className="mt-1 w-1/3 h-1 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 rounded-xl bg-white/8 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },

      // 11) Shield / trust
      {
        id: 'Trust',
        label: 'Trust',
        icon: <Shield size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/16" />
              <div className="flex-1">
                <div className="w-1/2 h-1 rounded-full bg-white/20" />
                <div className="mt-1 w-1/3 h-1 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 rounded-lg bg-white/7 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },

      // 12) Reordenar / grip
      {
        id: 'Compact',
        label: 'Compact',
        icon: <Grip size={14} />,
        preview: (
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/12 border border-white/18" />
              <div className="flex-1">
                <div className="w-1/2 h-1 rounded-full bg-white/22" />
                <div className="mt-1 w-1/3 h-1 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-2.5 rounded-xl bg-white/8 border border-white/12" />
              ))}
            </div>
          </div>
        ),
      },
    ];

    // ✅ proteção: remove duplicados por id
    const seen = new Set<string>();
    return t.filter((tpl) => {
      const key = (tpl.id || '').trim();
      if (!key) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, []);

  const uniqueLabelOk = useMemo(() => {
    const labels = new Set<string>();
    return templates.filter((tpl) => {
      const key = (tpl.label || '').trim().toLowerCase();
      if (!key) return false;
      if (labels.has(key)) return false;
      labels.add(key);
      return true;
    });
  }, [templates]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-white/90">Templates</h3>
          <p className="text-sm text-white/50">
            Escolha um layout pronto. Você pode personalizar cores, fontes e background depois.
          </p>
        </div>

        <Pill
          label={(profile.layoutTemplate || 'Minimal Card').trim()}
          active
          icon={<Layout size={14} />}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {uniqueLabelOk.map((tpl) => {
          const active = (profile.layoutTemplate || 'Minimal Card').trim() === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onUpdate({ layoutTemplate: tpl.id })}
              className={[
                'group active:scale-95 transition-transform text-left',
                'rounded-2xl border',
                active ? 'border-blue-400/35 bg-blue-500/5' : 'border-white/10 bg-white/3 hover:bg-white/5',
              ].join(' ')}
            >
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={[
                      'w-7 h-7 rounded-lg flex items-center justify-center border',
                      active
                        ? 'border-blue-400/40 bg-blue-400/10 text-blue-200'
                        : 'border-white/10 bg-white/5 text-white/65',
                    ].join(' ')}
                  >
                    {tpl.icon}
                  </div>
                  <div className="text-sm font-medium text-white/80">{tpl.label}</div>
                </div>

                <div
                  className={[
                    'w-6 h-6 rounded-full border flex items-center justify-center',
                    active ? 'border-blue-400/35 bg-blue-400/10' : 'border-white/10 bg-white/5',
                  ].join(' ')}
                >
                  {active ? <Check size={14} className="text-blue-200" /> : null}
                </div>
              </div>

              <div className="px-3 pb-3">
                <ThumbShell>{tpl.preview}</ThumbShell>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TemplatesTab;
