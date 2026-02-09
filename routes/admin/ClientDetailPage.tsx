import React from 'react';
import { useParams } from 'react-router-dom';
import { getStorage } from '../../lib/storage';
import TopBar from '../../components/common/TopBar';

const ClientDetailPage: React.FC = () => {
  const { clientId } = useParams();
  const data = getStorage();
  const client = data.clients.find(c => c.id === clientId);

  if (!client) return <div>Cliente não encontrado</div>;

  return (
    <div className="min-h-screen bg-black">
      <TopBar title={`Detalhes: ${client.name}`} showBack />
      <main className="max-w-7xl mx-auto p-6 lg:p-10 pt-28">
        <h1 className="text-3xl font-bold">{client.name}</h1>
        {/* Adicione mais detalhes conforme necessário */}
      </main>
    </div>
  );
};

export default ClientDetailPage;