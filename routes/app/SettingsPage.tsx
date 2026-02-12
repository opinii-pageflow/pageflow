import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getStorage } from '../../lib/storage';
import TopBar from '../../components/common/TopBar';
import { Shield, Zap, Mail, Trash2 } from 'lucide-react';
import { PLANS } from '../../lib/plans';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const data = getStorage();
  const client = data.clients.find(c => c.id === user?.clientId);

  return (
    <div className="min-h-screen bg-black">
      <TopBar title="Configurações" />
      <main className="max-w-4xl mx-auto p-6 lg:p-10 pt-28">
        <h1 className="text-3xl font-bold mb-10">Sua Conta</h1>

        <div className="space-y-8">
          <section className="bg-zinc-900 border border-white/5 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-500/10 text-blue-500 p-3 rounded-2xl"><Shield size={24} /></div>
              <h3 className="text-xl font-bold">Perfil da Empresa</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nome</label>
                <div className="bg-black/50 border border-white/10 p-4 rounded-xl text-gray-300">{client?.name}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">E-mail</label>
                <div className="bg-black/50 border border-white/10 p-4 rounded-xl text-gray-300">{user?.email}</div>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900 border border-white/5 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-purple-500/10 text-purple-500 p-3 rounded-2xl"><Zap size={24} /></div>
              <h3 className="text-xl font-bold">Plano e Assinatura</h3>
            </div>
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl border border-purple-500/20">
              <div>
                <div className="text-lg font-bold">Plano {PLANS[client?.plan || 'starter'].name}</div>
                <div className="text-sm text-gray-400">Ativo até {new Date(new Date().getTime() + 30*24*60*60*1000).toLocaleDateString()}</div>
              </div>
              <button 
                onClick={() => navigate('/app/upgrade')}
                className="bg-white text-black px-6 py-2 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all active:scale-95"
              >
                Alterar Plano
              </button>
            </div>
          </section>

          <section className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-red-500/10 text-red-500 p-3 rounded-2xl"><Trash2 size={24} /></div>
              <h3 className="text-xl font-bold text-red-500">Zona de Perigo</h3>
            </div>
            <p className="text-gray-500 text-sm mb-6">Uma vez que você deletar sua conta, não há volta. Todos os seus perfis e analytics serão perdidos.</p>
            <button className="bg-red-600/10 text-red-500 border border-red-500/20 px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all">
              Deletar Minha Conta Permanentemente
            </button>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;