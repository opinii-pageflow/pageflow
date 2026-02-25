-- ============================================
-- FIX ANALYTICS & LEADS
-- Migration: 20260223_fix_analytics_and_leads
-- ============================================

-- 1. Atualizar constraint de analytics_events para incluir 'scheduling' e 'lead'
-- Como a constraint original é inline (sem nome fixo no script inicial), 
-- vamos recriar a coluna com a nova constraint para garantir consistência.

DO $$ 
BEGIN
    -- Tenta remover a constraint antiga se existir (o nome default costuma seguir este padrão)
    ALTER TABLE analytics_events DROP CONSTRAINT IF EXISTS analytics_events_asset_type_check;
    
    -- Aplica a nova constraint
    ALTER TABLE analytics_events 
    ADD CONSTRAINT analytics_events_asset_type_check 
    CHECK (asset_type IN ('button', 'portfolio', 'catalog', 'video', 'pix', 'nps', 'scheduling', 'lead', 'unknown'));
END $$;

-- 2. Adicionar colunas UTM na tabela leads (Idempotente)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='utm_source') THEN
        ALTER TABLE public.leads ADD COLUMN utm_source text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='utm_medium') THEN
        ALTER TABLE public.leads ADD COLUMN utm_medium text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='utm_campaign') THEN
        ALTER TABLE public.leads ADD COLUMN utm_campaign text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='utm_content') THEN
        ALTER TABLE public.leads ADD COLUMN utm_content text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='utm_term') THEN
        ALTER TABLE public.leads ADD COLUMN utm_term text;
    END IF;
END $$;

-- 3. Criar RPC get_analytics_summary_v1
-- Esta função consolida visualizações e cliques em um único retorno, otimizando o dashboard.

CREATE OR REPLACE FUNCTION public.get_analytics_summary_v1(
    p_profile_id uuid default null,
    p_client_id uuid default null,
    p_start_date timestamptz default now() - interval '7 days',
    p_end_date timestamptz default now(),
    p_source_filter text default 'all'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    total_views bigint;
    total_clicks bigint;
BEGIN
    -- 1. Contagem Total de Views
    SELECT count(*) INTO total_views
    FROM analytics_events
    WHERE type = 'view'
      AND (p_profile_id IS NULL OR profile_id = p_profile_id)
      AND (p_client_id IS NULL OR client_id = p_client_id)
      AND ts >= p_start_date
      AND ts <= p_end_date
      AND (p_source_filter = 'all' OR source = p_source_filter);

    -- 2. Contagem Total de Cliques/Interações
    SELECT count(*) INTO total_clicks
    FROM analytics_events
    WHERE type != 'view' AND type != 'nps_response'
      AND (p_profile_id IS NULL OR profile_id = p_profile_id)
      AND (p_client_id IS NULL OR client_id = p_client_id)
      AND ts >= p_start_date
      AND ts <= p_end_date
      AND (p_source_filter = 'all' OR source = p_source_filter);

    -- 3. Montar JSON final
    result = jsonb_build_object(
        'totalViews', total_views,
        'totalClicks', total_clicks,
        'daily', (
            SELECT jsonb_agg(d) FROM (
                SELECT 
                    date_trunc('day', ts) as day,
                    count(*) filter (where type = 'view') as views,
                    count(*) filter (where type != 'view' AND type != 'nps_response') as clicks
                FROM analytics_events
                WHERE (p_profile_id IS NULL OR profile_id = p_profile_id)
                  AND (p_client_id IS NULL OR client_id = p_client_id)
                  AND ts >= p_start_date
                  AND ts <= p_end_date
                  AND (p_source_filter = 'all' OR source = p_source_filter)
                GROUP BY 1
                ORDER BY 1
            ) d
        ),
        'sources', (
            SELECT jsonb_agg(s) FROM (
                SELECT source as name, count(*) as count
                FROM analytics_events
                WHERE type = 'view'
                  AND (p_profile_id IS NULL OR profile_id = p_profile_id)
                  AND (p_client_id IS NULL OR client_id = p_client_id)
                  AND ts >= p_start_date
                  AND ts <= p_end_date
                  AND (p_source_filter = 'all' OR source = p_source_filter)
                GROUP BY 1
                ORDER BY 2 DESC
            ) s
        ),
        'devices', (
            SELECT jsonb_agg(dev) FROM (
                SELECT device as name, count(*) as count
                FROM analytics_events
                WHERE type = 'view'
                  AND (p_profile_id IS NULL OR profile_id = p_profile_id)
                  AND (p_client_id IS NULL OR client_id = p_client_id)
                  AND ts >= p_start_date
                  AND ts <= p_end_date
                  AND (p_source_filter = 'all' OR source = p_source_filter)
                GROUP BY 1
                ORDER BY 2 DESC
            ) dev
        ),
        'topAssets', (
            SELECT jsonb_agg(a) FROM (
                SELECT asset_label as label, asset_type as type, count(*) as clicks
                FROM analytics_events
                WHERE type != 'view' AND type != 'nps_response'
                  AND asset_label IS NOT NULL
                  AND (p_profile_id IS NULL OR profile_id = p_profile_id)
                  AND (p_client_id IS NULL OR client_id = p_client_id)
                  AND ts >= p_start_date
                  AND ts <= p_end_date
                  AND (p_source_filter = 'all' OR source = p_source_filter)
                GROUP BY 1, 2
                ORDER BY 3 DESC
                LIMIT 10
            ) a
        ),
        'byCategory', (
            SELECT jsonb_agg(c) FROM (
                SELECT asset_type as category, count(*) as count
                FROM analytics_events
                WHERE type != 'view' AND type != 'nps_response'
                  AND (p_profile_id IS NULL OR profile_id = p_profile_id)
                  AND (p_client_id IS NULL OR client_id = p_client_id)
                  AND ts >= p_start_date
                  AND ts <= p_end_date
                  AND (p_source_filter = 'all' OR source = p_source_filter)
                GROUP BY 1
            ) c
        )
    );

    RETURN result;
END;
$$;

-- 4. RLS - Permitir que donos de perfis vejam seus próprios analytics
-- Primeiro removemos qualquer política conflitante
DROP POLICY IF EXISTS "Owners can view their own analytics" ON analytics_events;

CREATE POLICY "Owners can view their own analytics"
  ON analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.client_members cm
      WHERE cm.client_id = analytics_events.client_id
      AND cm.user_id = auth.uid()
    )
  );

-- Garantir acesso para leads também
DROP POLICY IF EXISTS "Owners can view their own leads" ON leads;

CREATE POLICY "Owners can view their own leads"
  ON leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.client_members cm
      WHERE cm.client_id = leads.client_id
      AND cm.user_id = auth.uid()
    )
  );
