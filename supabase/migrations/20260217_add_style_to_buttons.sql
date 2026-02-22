-- ============================================
-- ADD STYLE COLUMN TO PROFILE_BUTTONS
-- ============================================

ALTER TABLE profile_buttons 
ADD COLUMN IF NOT EXISTS style JSONB DEFAULT '{}';

-- Comentário para documentação
COMMENT ON COLUMN profile_buttons.style IS 'Configurações de estilo customizadas para o botão (cores, bordas, etc)';
