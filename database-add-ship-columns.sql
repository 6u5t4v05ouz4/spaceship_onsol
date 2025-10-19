-- Adicionar colunas de nave na tabela user_profiles
-- Executar este script no Supabase SQL Editor

-- Adicionar coluna ship_type (tipo da nave)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS ship_type TEXT DEFAULT 'default_idle';

-- Adicionar coluna ship_rarity (raridade da nave)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS ship_rarity TEXT DEFAULT 'Comum';

-- Comentários nas colunas
COMMENT ON COLUMN user_profiles.ship_type IS 'Tipo da nave do usuário: default_idle (padrão sem NFT) ou nft_custom (com NFT)';
COMMENT ON COLUMN user_profiles.ship_rarity IS 'Raridade da nave: Comum, Incomum, Raro, Épico, Lendário';

-- Atualizar usuários existentes para terem a nave padrão
UPDATE user_profiles 
SET ship_type = 'default_idle', 
    ship_rarity = 'Comum'
WHERE ship_type IS NULL OR ship_rarity IS NULL;

-- Criar índice para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_ship_type ON user_profiles(ship_type);

-- Log de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Colunas de nave adicionadas com sucesso!';
    RAISE NOTICE '   - ship_type: Identifica qual sprite usar (default_idle ou nft_custom)';
    RAISE NOTICE '   - ship_rarity: Define características e cor da nave';
END $$;

