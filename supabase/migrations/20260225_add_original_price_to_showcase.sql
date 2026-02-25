
-- Adicionar original_price aos itens da vitrine
alter table showcase_items add column if not exists original_price numeric;

-- Adicionar original_price às opções da vitrine
alter table showcase_options add column if not exists original_price numeric;

-- Comentários para documentação
comment on column showcase_items.original_price is 'Preço original (De) do produto principal';
comment on column showcase_options.original_price is 'Preço original (De) da variação específica';
