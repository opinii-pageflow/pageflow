# Backend Implementation - Setup Guide

## 🚀 Quick Start

### 1. Configurar Supabase

1. **Criar projeto no Supabase**:
   - Acesse [https://app.supabase.com](https://app.supabase.com)
   - Clique em "New Project"
   - Escolha nome, senha do banco, e região (recomendado: `sa-east-1` para Brasil)

2. **Aplicar migrations**:
   ```bash
   # Instalar Supabase CLI (se ainda não tiver)
   npm install -g supabase
   
   # Login
   supabase login
   
   # Link com seu projeto
   supabase link --project-ref your-project-ref
   
   # Aplicar migration
   supabase db push
   ```

3. **Configurar variáveis de ambiente**:
   ```bash
   # Copiar arquivo de exemplo
   cp .env.example .env
   
   # Editar .env e adicionar suas credenciais
   # VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
   ```

### 2. Testar Conexão

```bash
# Iniciar aplicação
npm run dev

# Abrir console do navegador e verificar:
# ✅ Sem erros de "Supabase não configurado"
# ✅ Analytics sendo enviados (verificar Network tab)
```

### 3. Validar no Supabase Dashboard

1. Acesse: `https://app.supabase.com/project/your-project/editor`
2. Verifique que as tabelas foram criadas:
   - `clients`
   - `profiles`
   - `analytics_events`
   - etc.

3. Teste inserir um evento manualmente:
   ```sql
   INSERT INTO analytics_events (client_id, profile_id, type, source)
   VALUES (
     'a0000000-0000-0000-0000-000000000001',
     gen_random_uuid(),
     'view',
     'direct'
   );
   ```

---

## 📊 Sistema de Analytics

### Como Funciona

1. **Batch Processing**: Eventos são agrupados em lotes de 50
2. **Flush Automático**: A cada 5 segundos, eventos pendentes são enviados
3. **Backup Local**: Eventos são salvos em localStorage como backup
4. **Retry Automático**: Eventos pendentes são reenviados na próxima sessão

### Uso

```typescript
import { trackEvent } from '@/lib/api/analytics';

// Rastrear visualização
trackEvent({
  profileId: 'profile-123',
  clientId: 'client-456',
  type: 'view',
  source: 'qr',
  device: 'mobile',
});

// Rastrear clique em botão
trackEvent({
  profileId: 'profile-123',
  clientId: 'client-456',
  type: 'click',
  assetType: 'button',
  assetId: 'button-789',
  assetLabel: 'WhatsApp',
});
```

### Monitoramento

```typescript
import { getAnalyticsSummary } from '@/lib/api/analytics';

// Buscar resumo dos últimos 7 dias
const summary = await getAnalyticsSummary('profile-123', 7);
console.log(summary); // { totalViews, totalClicks, ctr }
```

---

## 🔐 Row Level Security (RLS)

### Políticas Atuais

**Acesso Público** (sem autenticação):
- ✅ Leitura de perfis públicos
- ✅ Leitura de botões/catálogo/portfólio de perfis públicos
- ✅ Inserção de eventos de analytics
- ✅ Inserção de leads
- ✅ Inserção de NPS

**Acesso Autenticado** (Fase 2):
- ⏳ CRUD completo de perfis próprios
- ⏳ Leitura de analytics próprios
- ⏳ Gestão de leads próprios

---

## 📁 Estrutura de Arquivos

```
PageFlow/
├── supabase/
│   └── migrations/
│       └── 20260217_initial_schema.sql   # Schema completo
├── lib/
│   ├── supabase.ts                       # Cliente Supabase
│   └── api/
│       └── analytics.ts                  # Sistema de analytics
├── types/
│   └── database.ts                       # Tipos do banco
└── .env.example                          # Variáveis de ambiente
```

---

## 🧪 Próximos Passos

### Fase 1: Analytics (Atual) ✅
- [x] Schema do banco
- [x] Sistema de batch processing
- [x] Backup em localStorage
- [ ] **PRÓXIMO**: Substituir `trackEvent` em `lib/analytics.ts`

### Fase 2: Authentication
- [ ] Configurar Supabase Auth
- [ ] Políticas RLS autenticadas
- [ ] Migrar LoginPage/RegisterPage

### Fase 3: CRUD Operations
- [ ] API de profiles
- [ ] API de leads
- [ ] API de catálogo/portfólio

---

## 🐛 Troubleshooting

### Erro: "Supabase não configurado"
- Verifique se o arquivo `.env` existe
- Confirme que as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão preenchidas
- Reinicie o servidor de desenvolvimento

### Eventos não aparecem no Supabase
- Abra o DevTools → Network
- Procure por requisições para `analytics_events`
- Verifique se há erros (403 = RLS bloqueando, 401 = auth issue)
- Confirme que as políticas RLS estão ativas: `ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;`

### Migration falhou
```bash
# Resetar banco (CUIDADO: apaga todos os dados)
supabase db reset

# Reaplicar migrations
supabase db push
```

---

## 📚 Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
