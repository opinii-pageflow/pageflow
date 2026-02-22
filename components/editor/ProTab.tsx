import React, { useRef } from 'react';
import {
  Plus,
  Trash2,
  Lock,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Image,
  Youtube,
  QrCode,
  Upload,
  Calendar,
  Clock,
  Link as LinkIcon,
  AlertCircle,
  Smartphone,
  Star
} from 'lucide-react';
import clsx from 'clsx';
import { CatalogItem, PortfolioItem, Profile, YoutubeVideoItem, PlanType, SchedulingSlot } from '../../types';
import { canAccessFeature } from '../../lib/permissions';
import { getStorage } from '../../lib/storage';

type Props = {
  profile: Profile;
  client?: any;
  clientPlan?: PlanType;
  onUpdate: (updates: Partial<Profile>) => void;
};

const DAYS_OF_WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const ProTab: React.FC<Props> = ({ profile, client, clientPlan, onUpdate }) => {
  const [slotFilter, setSlotFilter] = React.useState<'all' | 'pending' | 'booked' | 'available'>('all');
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const portfolioFileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const hasProAccess = canAccessFeature(clientPlan, 'catalog');
  const hasBusinessAccess = canAccessFeature(clientPlan, 'scheduling');

  if (!hasProAccess) {
    return (
      <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-10 text-center">
        <div className="mx-auto w-16 h-16 rounded-[1.8rem] bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <Lock size={28} className="text-zinc-500" />
        </div>
        <h2 className="text-2xl font-black mb-2 tracking-tight">Recursos Pro</h2>
        <p className="text-zinc-500 text-sm leading-relaxed max-w-md mx-auto">
          Catálogo, portfólio, vídeos, Pix, captura de leads e NPS ficam disponíveis apenas no <b>Plano Pro</b>.
        </p>
      </div>
    );
  }

  const isGlobalSchedule = client?.schedulingScope === 'global';

  const catalog = (profile.catalogItems || []) as CatalogItem[];
  const portfolio = (profile.portfolioItems || []) as PortfolioItem[];
  const videos = (profile.youtubeVideos || []) as YoutubeVideoItem[];

  // Slots Logic: Global vs Profile
  const slots = isGlobalSchedule
    ? (client?.globalSlots || []) as SchedulingSlot[]
    : (profile.nativeSlots || []) as SchedulingSlot[];

  const updateCatalog = (items: CatalogItem[]) => onUpdate({ catalogItems: items });
  const updatePortfolio = (items: PortfolioItem[]) => onUpdate({ portfolioItems: items });
  const updateVideos = (items: YoutubeVideoItem[]) => onUpdate({ youtubeVideos: items });

  const updateSlots = (newSlots: SchedulingSlot[]) => {
    if (isGlobalSchedule) {
      console.warn('Global slots update not supported here. Use Command Center.');
    } else {
      onUpdate({ nativeSlots: newSlots });
    }
  };

  // Hack para reatividade simples do Global Mode sem contexto pesado
  const [globalSlotsVersion, setGlobalSlotsVersion] = React.useState(0);
  React.useEffect(() => {
    if (isGlobalSchedule) {
      setGlobalSlotsVersion(v => v + 1);
    }
  }, [client?.globalSlots]); // Isso não vai funcionar bem sem observer.

  // Vamos simplificar: Se for global, ler do storage a cada render? Não é performático mas funciona.
  // Melhor: O componente pai passa profile, mas não client.
  // Vou aceitar que o updateStorage persiste, e para a UI refletir, vou usar um state local que sincroniza com o 'updateSlots' customizado.
  const [localGlobalSlots, setLocalGlobalSlots] = React.useState<SchedulingSlot[]>(client?.globalSlots || []);

  // Sincronizar slots locais quando os slots do cliente (do storage/DB) mudarem
  React.useEffect(() => {
    if (isGlobalSchedule && client?.globalSlots) {
      setLocalGlobalSlots(client.globalSlots);
    }
  }, [client?.globalSlots, isGlobalSchedule]);

  // Override slots reference para display
  const activeSlots = isGlobalSchedule ? localGlobalSlots : slots;

  const handleUpdateSlots = (newSlots: SchedulingSlot[]) => {
    if (isGlobalSchedule) {
      console.warn('Global slots update not supported here. Use Command Center.');
    } else {
      onUpdate({ nativeSlots: newSlots });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCatalog(catalog.map(c => c.id === itemId ? { ...c, imageUrl: reader.result as string } : c));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePortfolioImageUpload = (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePortfolio(portfolio.map(p => p.id === itemId ? { ...p, imageUrl: reader.result as string } : p));
      };
      reader.readAsDataURL(file);
    }
  };

  const move = <T,>(arr: T[], from: number, to: number): T[] => {
    const next = [...arr];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  };

  const addSlot = () => {
    const next: SchedulingSlot = {
      id: crypto.randomUUID(),
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '18:00',
      isActive: true,
      status: 'available'
    };
    handleUpdateSlots([...activeSlots, next]);
  };

  const isExternalUrlMissing = profile.enableScheduling && profile.schedulingMode === 'external' && !profile.externalBookingUrl;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Sparkles size={18} className="text-emerald-400" />
            </span>
            Pro & Business
          </h2>
          <p className="text-zinc-500 text-sm mt-2">Expanda as funcionalidades do seu perfil com módulos avançados.</p>
        </div>
      </div>

      {/* AGENDAMENTO */}
      <section className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 space-y-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Calendar size={18} />
            </div>
            <div>
              <div className="font-black text-lg flex items-center gap-2">
                Agenda e Agendamento
                {!hasBusinessAccess && <Lock size={14} className="text-zinc-600" />}
              </div>
              <p className="text-zinc-500 text-xs">Permita que clientes reservem seu tempo direto no perfil.</p>
            </div>
          </div>
          <button
            disabled={!hasBusinessAccess}
            onClick={() => onUpdate({ enableScheduling: !profile.enableScheduling })}
            className={clsx(
              "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              profile.enableScheduling ? "bg-white text-black" : "bg-white/5 border border-white/10 text-zinc-500",
              !hasBusinessAccess && "opacity-30 cursor-not-allowed"
            )}
          >
            {profile.enableScheduling ? 'Ativo' : 'Inativo'}
          </button>
        </div>

        {!hasBusinessAccess && (
          <div className="bg-blue-600/5 border border-blue-600/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-xl"><Smartphone className="text-blue-400" size={20} /></div>
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Recurso Business</div>
              <div className="text-xs text-zinc-500 font-medium">Faça upgrade para o Plano Business para liberar o agendamento nativo.</div>
            </div>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
              Upgrade
            </button>
          </div>
        )}

        {profile.enableScheduling && hasBusinessAccess && (
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 flex flex-col items-center text-center space-y-3 animate-in fade-in duration-500">
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-400 mb-1">
              <Calendar size={24} />
            </div>
            <div>
              <h4 className="font-black text-white uppercase tracking-wider text-sm">Gestão de Agenda</h4>
              <p className="text-zinc-500 text-xs mt-1 max-w-xs mx-auto">
                A gestão completa de horários, slots e disponibilidade foi movida para o painel principal.
              </p>
            </div>
            <div className="pt-2">
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                Acesse Menu Principal &gt; Agenda
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Pix */}
      <section className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <QrCode size={18} className="text-zinc-400" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Pix</div>
              <div className="font-black text-lg">Chave Pix</div>
            </div>
          </div>
          <label className="flex items-center gap-3 text-xs font-bold text-zinc-400">
            <input
              type="checkbox"
              checked={!!profile.pixKey}
              onChange={(e) => onUpdate({ pixKey: e.target.checked ? '' : '' })}
              className="accent-white"
            />
            Ativo
          </label>
        </div>
        <input
          value={profile.pixKey || ''}
          onChange={(e) => onUpdate({ pixKey: e.target.value })}
          placeholder="Cole aqui sua chave Pix (CPF, e-mail, telefone ou aleatória)"
          className="w-full rounded-2xl bg-black/30 border border-white/10 px-5 py-4 text-sm outline-none focus:border-white/30"
        />
      </section>

      {/* Toggles (CRM e NPS protegidos pelo plano Business) */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[{
            key: 'enableLeadCapture',
            feature: 'leads_capture' as const,
            title: 'Captura de Leads',
            desc: 'Formulário para o visitante deixar nome/contato.'
          }, {
            key: 'enableNps',
            feature: 'nps' as const,
            title: 'Avaliação NPS',
            desc: 'Nota 0-10 e comentário para virar dashboard.'
          }].map((t) => {
            const hasFeatureAccess = canAccessFeature(clientPlan, t.feature);
            return (
              <div key={t.key} className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-6 flex items-center justify-between gap-4 relative overflow-hidden">
                <div className="min-w-0">
                  <div className="font-black text-base flex items-center gap-2">
                    {t.title}
                    {!hasFeatureAccess && <Lock size={12} className="text-zinc-600" />}
                  </div>
                  <div className="text-zinc-500 text-xs">{t.desc}</div>
                  {!hasFeatureAccess && <div className="text-[8px] font-black uppercase text-blue-500 mt-2">Disponível no Business</div>}
                </div>
                <button
                  disabled={!hasFeatureAccess}
                  onClick={() => onUpdate({ [t.key]: !((profile as any)[t.key]) } as any)}
                  className={clsx(
                    "px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                    (profile as any)[t.key] ? "bg-white text-black" : "bg-white/5 border border-white/10 text-zinc-400",
                    !hasFeatureAccess && "opacity-30 cursor-not-allowed"
                  )}
                >
                  {(profile as any)[t.key] ? 'Ligado' : 'Desligado'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Campo adicional para URL do Google Meu Negócio se NPS estiver ativo */}
        {profile.enableNps && canAccessFeature(clientPlan, 'nps') && (
          <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Star size={18} className="text-amber-400" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Google Review</div>
                <div className="font-black text-lg">Direcionamento NPS</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Link do Google Meu Negócio</label>
              <input
                value={profile.npsRedirectUrl || ''}
                onChange={(e) => onUpdate({ npsRedirectUrl: e.target.value })}
                placeholder="Ex: https://g.page/r/..."
                className="w-full rounded-2xl bg-black/30 border border-white/10 px-5 py-4 text-sm outline-none focus:border-white/30"
              />
              <p className="text-[10px] text-zinc-500 ml-1">
                Se preenchido, usuários que avaliarem com 9 ou 10 verão um botão para avaliar também no Google.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Catálogo */}
      <section className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Catálogo</div>
            <div className="font-black text-lg">Produtos e Serviços</div>
          </div>
          <button
            onClick={() => {
              const next: CatalogItem = {
                id: crypto.randomUUID(),
                profileId: profile.id,
                kind: 'service',
                title: 'Novo item',
                description: '',
                priceText: '',
                imageUrl: '',
                ctaLabel: 'Chamar',
                ctaLink: '',
                sortOrder: catalog.length,
                isActive: true,
                clientId: profile.clientId
              };
              updateCatalog([...catalog, next]);
            }}
            className="px-6 py-3 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95"
          >
            <Plus size={14} /> Adicionar
          </button>
        </div>

        <div className="space-y-6">
          {catalog.length === 0 && (
            <div className="text-zinc-500 text-sm">Nenhum item ainda. Adicione produtos ou serviços para vender direto do perfil.</div>
          )}

          {catalog
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((item, idx) => (
              <div key={item.id} className="rounded-[1.8rem] border border-white/10 bg-black/20 p-6">
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => idx > 0 && updateCatalog(move(catalog, idx, idx - 1).map((x, i) => ({ ...x, sortOrder: i })))}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 active:scale-95"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => idx < catalog.length - 1 && updateCatalog(move(catalog, idx, idx + 1).map((x, i) => ({ ...x, sortOrder: i })))}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 active:scale-95"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Item {idx + 1}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCatalog(catalog.map(c => c.id === item.id ? { ...c, isActive: !c.isActive } : c))}
                      className={clsx(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95",
                        item.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-zinc-400 border-white/10"
                      )}
                    >
                      {item.isActive ? 'Ativo' : 'Oculto'}
                    </button>
                    <button
                      onClick={() => updateCatalog(catalog.filter(c => c.id !== item.id).map((x, i) => ({ ...x, sortOrder: i })))}
                      className="p-2 rounded-xl bg-red-500/5 text-red-500/40 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image Upload Area */}
                  <div className="flex-shrink-0">
                    <div
                      onClick={() => fileInputRefs.current[item.id]?.click()}
                      className="relative w-32 h-32 rounded-3xl bg-black/40 border border-white/10 flex flex-col items-center justify-center cursor-pointer group overflow-hidden hover:border-white/30 transition-all"
                    >
                      {item.imageUrl ? (
                        <>
                          <img src={item.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Upload size={20} className="text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="text-zinc-600 flex flex-col items-center gap-1 group-hover:text-zinc-400">
                          <Image size={24} />
                          <span className="text-[8px] font-black uppercase tracking-widest">Upload</span>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={el => fileInputRefs.current[item.id] = el}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, item.id)}
                      />
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Título do Item</label>
                      <input
                        value={item.title}
                        onChange={(e) => updateCatalog(catalog.map(c => c.id === item.id ? { ...c, title: e.target.value } : c))}
                        className="w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Tipo</label>
                      <select
                        value={item.kind}
                        onChange={(e) => updateCatalog(catalog.map(c => c.id === item.id ? { ...c, kind: e.target.value as any } : c))}
                        className="w-full rounded-2xl bg-black border border-white/10 px-4 py-3 text-sm font-bold text-white outline-none appearance-none cursor-pointer [&>option]:bg-zinc-950 [&>option]:text-white"
                      >
                        <option value="service" className="bg-zinc-950 text-white">Serviço</option>
                        <option value="product" className="bg-zinc-950 text-white">Produto</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Descrição Curta</label>
                      <input
                        value={item.description || ''}
                        onChange={(e) => updateCatalog(catalog.map(c => c.id === item.id ? { ...c, description: e.target.value } : c))}
                        className="w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Preço ou Condição</label>
                      <input
                        value={item.priceText || ''}
                        onChange={(e) => updateCatalog(catalog.map(c => c.id === item.id ? { ...c, priceText: e.target.value } : c))}
                        placeholder="Ex: R$ 99,00"
                        className="w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Rótulo do Botão</label>
                      <input
                        value={item.ctaLabel || ''}
                        onChange={(e) => updateCatalog(catalog.map(c => c.id === item.id ? { ...c, ctaLabel: e.target.value } : c))}
                        placeholder="Ex: Comprar"
                        className="w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/30"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Link de Ação</label>
                      <input
                        value={item.ctaLink || ''}
                        onChange={(e) => updateCatalog(catalog.map(c => c.id === item.id ? { ...c, ctaLink: e.target.value } : c))}
                        placeholder="Ex: https://wa.me/..."
                        className="w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/30"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Portfólio */}
      <section className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Image size={18} className="text-zinc-400" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Portfólio</div>
              <div className="font-black text-lg">Fotos / Trabalhos</div>
            </div>
          </div>
          <button
            onClick={() => {
              const next: PortfolioItem = {
                id: crypto.randomUUID(),
                profileId: profile.id,
                title: '',
                imageUrl: 'https://picsum.photos/800/800?random=' + Math.floor(Math.random() * 1000),
                sortOrder: portfolio.length,
                isActive: true,
                clientId: profile.clientId
              };
              updatePortfolio([...portfolio, next]);
            }}
            className="px-6 py-3 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95"
          >
            <Plus size={14} /> Adicionar
          </button>
        </div>
        <div className="space-y-3">
          {portfolio.length === 0 && <div className="text-zinc-500 text-sm">Adicione imagens para mostrar seu trabalho.</div>}
          {portfolio
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((item, idx) => (
              <div key={item.id} className="rounded-[1.8rem] border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => idx > 0 && updatePortfolio(move(portfolio, idx, idx - 1).map((x, i) => ({ ...x, sortOrder: i })))}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 active:scale-95"
                      title="Subir"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => idx < portfolio.length - 1 && updatePortfolio(move(portfolio, idx, idx + 1).map((x, i) => ({ ...x, sortOrder: i })))}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 active:scale-95"
                      title="Descer"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">#{idx + 1}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updatePortfolio(portfolio.map(p => p.id === item.id ? { ...p, isActive: !p.isActive } : p))}
                      className={clsx(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95",
                        item.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-zinc-400 border-white/10"
                      )}
                    >
                      {item.isActive ? 'Ativo' : 'Oculto'}
                    </button>
                    <button
                      onClick={() => updatePortfolio(portfolio.filter(p => p.id !== item.id).map((x, i) => ({ ...x, sortOrder: i })))}
                      className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 active:scale-95"
                      title="Remover"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Portfolio Image Upload */}
                  <div className="flex-shrink-0">
                    <div
                      onClick={() => portfolioFileInputRefs.current[item.id]?.click()}
                      className="relative w-32 h-32 rounded-3xl bg-black/40 border border-white/10 flex flex-col items-center justify-center cursor-pointer group overflow-hidden hover:border-white/30 transition-all"
                    >
                      {item.imageUrl ? (
                        <>
                          <img src={item.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Upload size={20} className="text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="text-zinc-600 flex flex-col items-center gap-1 group-hover:text-zinc-400">
                          <Image size={24} />
                          <span className="text-[8px] font-black uppercase tracking-widest">Upload</span>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={el => portfolioFileInputRefs.current[item.id] = el}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handlePortfolioImageUpload(e, item.id)}
                      />
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Imagem (URL)</label>
                      <input
                        value={item.imageUrl}
                        onChange={(e) => updatePortfolio(portfolio.map(p => p.id === item.id ? { ...p, imageUrl: e.target.value } : p))}
                        className="w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/30"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Título (opcional)</label>
                      <input
                        value={item.title || ''}
                        onChange={(e) => updatePortfolio(portfolio.map(p => p.id === item.id ? { ...p, title: e.target.value } : p))}
                        className="w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/30"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Vídeos */}
      <section className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Youtube size={18} className="text-zinc-400" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">YouTube</div>
              <div className="font-black text-lg">Vídeos</div>
            </div>
          </div>
          <button
            onClick={() => {
              const next: YoutubeVideoItem = {
                id: crypto.randomUUID(),
                profileId: profile.id,
                title: '',
                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                sortOrder: videos.length,
                isActive: true,
                clientId: profile.clientId
              };
              updateVideos([...videos, next]);
            }}
            className="px-6 py-3 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95"
          >
            <Plus size={14} /> Adicionar
          </button>
        </div>
        <div className="space-y-3">
          {videos.length === 0 && <div className="text-zinc-500 text-sm">Adicione links de vídeos do YouTube para provar autoridade.</div>}
          {videos
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((item, idx) => (
              <div key={item.id} className="rounded-[1.8rem] border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => idx > 0 && updateVideos(move(videos, idx, idx - 1).map((x, i) => ({ ...x, sortOrder: i })))}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 active:scale-95"
                      title="Subir"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => idx < videos.length - 1 && updateVideos(move(videos, idx, idx + 1).map((x, i) => ({ ...x, sortOrder: i })))}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 active:scale-95"
                      title="Descer"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">#{idx + 1}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateVideos(videos.map(v => v.id === item.id ? { ...v, isActive: !v.isActive } : v))}
                      className={clsx(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95",
                        item.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-zinc-400 border-white/10"
                      )}
                    >
                      {item.isActive ? 'Ativo' : 'Oculto'}
                    </button>
                    <button
                      onClick={() => updateVideos(videos.filter(v => v.id !== item.id).map((x, i) => ({ ...x, sortOrder: i })))}
                      className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 active:scale-95"
                      title="Remover"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">URL do YouTube</label>
                    <input
                      value={item.url}
                      onChange={(e) => updateVideos(videos.map(v => v.id === item.id ? { ...v, url: e.target.value } : v))}
                      className="w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Título (opcional)</label>
                    <input
                      value={item.title || ''}
                      onChange={(e) => updateVideos(videos.map(v => v.id === item.id ? { ...v, title: e.target.value } : v))}
                      className="w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/30"
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default ProTab;