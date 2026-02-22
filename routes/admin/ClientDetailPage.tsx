import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { clientsApi } from '../../lib/api/clients';
import { Client } from '../../types';
import { Zap } from 'lucide-react';
import clsx from 'clsx';
import TopBar from '../../components/common/TopBar';

const ClientDetailPage: React.FC = () => {
  const { clientId } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientId) {
      clientsApi.getById(clientId).then(data => {
        setClient(data);
        setLoading(false);
      });
    }
  }, [clientId]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!client) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-zinc-500">Cliente não encontrado</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-white">
      <TopBar title={`Detalhes: ${client.name}`} showBack />
      <main className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-10 pt-28">
        <h1 className="text-4xl font-black tracking-tighter mb-8">{client.name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-black tracking-tight border-b border-white/5 pb-4 mb-2">Informações Base</h3>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block mb-1">Nome da Company</span>
                <div className="text-lg font-bold">{client.name}</div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block mb-1">E-mail de Contato</span>
                <div className="text-zinc-300 transition-colors hover:text-white cursor-pointer">{client.email || 'Não informado'}</div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block mb-1">Identificador (Slug)</span>
                <div className="inline-flex px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg font-mono text-sm leading-none items-center">
                  /{client.slug}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-black tracking-tight border-b border-white/5 pb-4 mb-2">Plano & Status</h3>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block mb-1">Nível de Assinatura</span>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-xl font-black text-xs uppercase tracking-widest">
                  <Zap size={10} />
                  {client.plan}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block mb-1">Capacidade de Perfis</span>
                <div className="text-xl font-black tabular-nums">{client.maxProfiles} <span className="text-zinc-600 text-sm font-medium uppercase tracking-widest ml-1">slots</span></div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block mb-1">Status Operacional</span>
                <div className={clsx(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-widest border",
                  client.isActive
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                )}>
                  <span className={clsx("w-1.5 h-1.5 rounded-full", client.isActive ? "bg-emerald-500" : "bg-red-500")} />
                  {client.isActive ? 'Ativo' : 'Bloqueado'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDetailPage;