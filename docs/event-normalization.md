# Sistema de Normalização de Eventos do Analytics

## 📋 Visão Geral

O sistema de normalização de eventos foi criado para eliminar o problema de "Desconhecido" e "Link Removido" nos relatórios de analytics, garantindo que todos os eventos sejam processados de forma consistente e com fallbacks robustos.

## 🎯 Objetivos

1. **Eliminar "Desconhecido"**: Nunca exibir "Desconhecido" ou strings vazias nos relatórios
2. **Fonte Única da Verdade**: Centralizar toda a lógica de processamento de eventos
3. **Compatibilidade**: Suportar eventos antigos (com `linkId` e `category`) e novos (com `assetId` e `assetType`)
4. **Fallbacks Robustos**: Sempre ter um valor padrão significativo

## 📁 Arquitetura

### Arquivo Principal: `lib/eventNormalizer.ts`

Contém três funções principais:

#### 1. `resolveAssetType(event: AnalyticsEvent): NormalizedAssetType`

Determina o tipo do asset com base no evento, seguindo esta ordem de prioridade:

1. `event.assetType` (campo novo)
2. `event.category` (campo legado)
3. Inferência pelo `event.type`
4. Fallback: `'unknown'`

**Tipos suportados:**
- `button` - Botões de ação
- `portfolio` - Itens do portfólio
- `catalog` - Produtos/serviços do catálogo
- `video` - Vídeos do YouTube
- `pix` - Cópias de chave PIX
- `nps` - Respostas de NPS
- `unknown` - Tipo desconhecido (último recurso)

#### 2. `resolveAssetLabel(event: AnalyticsEvent, profiles: Profile[]): string`

Resolve o label de um asset com fallback robusto. **NUNCA retorna "Desconhecido" ou string vazia.**

**Ordem de resolução:**

1. **Label salvo**: Se `event.assetLabel` existe, usar
2. **Busca no profile**: Procurar o asset pelo ID no profile correspondente
3. **Fallback por tipo**:
   - `button` → "Botão sem label"
   - `portfolio` → "Foto sem título"
   - `catalog` → "Produto sem título"
   - `video` → "Vídeo sem título"
   - `pix` → "Chave PIX"
   - `nps` → "Avaliação NPS"
   - `unknown` → "Sem label"

**Hardening:**
- Todos os arrays são protegidos com `?? []`
- Nunca faz `.find()` em arrays opcionais sem verificação

#### 3. `normalizeEvent(event: AnalyticsEvent, profiles: Profile[]): NormalizedEvent`

Função principal que normaliza um evento completo, retornando uma estrutura padronizada:

```typescript
interface NormalizedEvent {
  assetType: NormalizedAssetType;
  assetLabel: string; // NUNCA vazio, NUNCA "Desconhecido"
  assetId: string | undefined;
  profileId: string;
  clientId: string;
  type: string;
  ts: number;
  device?: 'mobile' | 'desktop' | 'tablet';
  source: string;
  utm?: UtmParams;
}
```

## 🔧 Uso

### No `analytics.ts`

```typescript
import { normalizeEvent } from './eventNormalizer';

clicks.forEach(c => {
    const normalized = normalizeEvent(c, data.profiles);
    
    // Usar normalized.assetType em vez de c.category
    if (normalized.assetType !== 'unknown') {
        categoryMap[normalized.assetType] = (categoryMap[normalized.assetType] || 0) + 1;
    }

    // Usar normalized.assetLabel em vez de resolver manualmente
    if (normalized.assetId) {
        linkDetailMap[normalized.assetId] = { 
            label: normalized.assetLabel, // NUNCA "Desconhecido"
            clicks: 0, 
            type: normalized.assetType 
        };
    }
});
```

### Em outros componentes

```typescript
import { normalizeEvent, resolveAssetLabel } from '@/lib/eventNormalizer';

// Normalizar um evento completo
const normalized = normalizeEvent(event, profiles);
console.log(normalized.assetLabel); // "Botão de WhatsApp" ou "Botão sem label"

// Ou apenas resolver o label
const label = resolveAssetLabel(event, profiles);
console.log(label); // NUNCA será "Desconhecido"
```

## ✅ Garantias

1. **Nunca retorna "Desconhecido"**: Todos os fallbacks são significativos
2. **Nunca retorna string vazia**: Sempre há um valor padrão
3. **Compatibilidade total**: Funciona com eventos antigos e novos
4. **Type-safe**: Totalmente tipado com TypeScript
5. **Defensivo**: Protegido contra arrays undefined/null

## 🔄 Migração de Eventos Antigos

O sistema suporta automaticamente eventos antigos que usam:
- `linkId` em vez de `assetId`
- `category` em vez de `assetType`

Não é necessário migrar eventos existentes no storage.

## 🚫 O que NÃO fazer

❌ **Não processar eventos manualmente:**
```typescript
// ERRADO
const label = event.category === 'button' 
  ? profile?.buttons.find(b => b.id === event.linkId)?.label || 'Desconhecido'
  : 'Desconhecido';
```

✅ **Sempre usar o normalizador:**
```typescript
// CORRETO
const normalized = normalizeEvent(event, profiles);
const label = normalized.assetLabel; // Nunca "Desconhecido"
```

## 📊 Impacto

- ✅ Elimina "Desconhecido" em todos os relatórios
- ✅ Elimina "Link Removido" (agora usa fallbacks descritivos)
- ✅ Melhora a experiência do usuário
- ✅ Facilita debugging (labels sempre significativos)
- ✅ Reduz código duplicado (fonte única da verdade)

## 🔮 Futuro

Para novos eventos, recomenda-se sempre salvar o snapshot do label no momento da criação:

```typescript
trackEvent({
  profileId,
  clientId,
  type: 'click',
  assetId: button.id,
  assetType: 'button',
  assetLabel: button.label, // Salvar snapshot
  source,
  utm
});
```

Isso garante que mesmo se o botão for deletado ou renomeado, o histórico permanece correto.
