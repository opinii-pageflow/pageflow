# 🚀 Aplicar Migration no Supabase

## Método Recomendado: SQL Editor (2 minutos)

### Passo 1: Abrir SQL Editor

1. Acesse: [https://app.supabase.com/project/fdihrngybdmppuomjgcn/sql/new](https://app.supabase.com/project/fdihrngybdmppuomjgcn/sql/new)
2. Você verá o **SQL Editor** do Supabase

### Passo 2: Copiar Migration SQL

1. Abra o arquivo: `supabase/migrations/20260217_initial_schema.sql`
2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)

### Passo 3: Executar Migration

1. **Cole** o SQL no editor (Ctrl+V)
2. Clique em **"Run"** (ou pressione Ctrl+Enter)
3. Aguarde ~5 segundos

### Passo 4: Verificar Sucesso

Você deve ver:
- ✅ "Success. No rows returned"
- ✅ 10 tabelas criadas no painel esquerdo:
  - `clients`
  - `profiles`
  - `profile_buttons`
  - `analytics_events`
  - `leads`
  - `nps_entries`
  - `catalog_items`
  - `portfolio_items`
  - `youtube_videos`
  - `scheduling_slots`

---

## Verificação Rápida

Execute esta query no SQL Editor para confirmar:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Deve retornar 10 tabelas.

---

## ✅ Próximos Passos

Após aplicar a migration:

1. **Reiniciar dev server** (para carregar .env):
   ```bash
   # Parar servidor atual (Ctrl+C)
   npm run dev
   ```

2. **Testar rastreamento**:
   - Abrir: `http://localhost:5173/israel`
   - Clicar em botões
   - Verificar Network tab (DevTools)
   - Ver eventos no Supabase Dashboard

3. **Validar dados**:
   ```sql
   SELECT * FROM analytics_events ORDER BY ts DESC LIMIT 10;
   ```

---

## 🆘 Troubleshooting

### Erro: "permission denied"
- Você precisa ser **Owner** do projeto
- Verifique em Settings → General → Transfer ownership

### Erro: "relation already exists"
- Tabelas já foram criadas antes
- Pode pular este passo ou fazer DROP TABLE primeiro

### Erro: "syntax error"
- Certifique-se de copiar TODO o arquivo SQL
- Não copie apenas parte do código
