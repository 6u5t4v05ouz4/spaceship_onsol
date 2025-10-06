-- Tabela para perfis de usuário unificados
-- Esta tabela vincula contas Google e carteiras Solana

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    google_email TEXT UNIQUE,
    wallet_address TEXT UNIQUE,
    display_name TEXT NOT NULL DEFAULT 'Space Pilot',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_google_email ON user_profiles(google_email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_wallet_address ON user_profiles(wallet_address);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Política RLS (Row Level Security) - permitir leitura para usuários autenticados
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios perfis
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (
        auth.email() = google_email OR 
        auth.jwt() ->> 'wallet_address' = wallet_address
    );

-- Política para permitir inserção de novos perfis
CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (
        auth.email() = google_email OR 
        auth.jwt() ->> 'wallet_address' = wallet_address
    );

-- Política para permitir atualização de perfis próprios
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (
        auth.email() = google_email OR 
        auth.jwt() ->> 'wallet_address' = wallet_address
    );

-- Comentários para documentação
COMMENT ON TABLE user_profiles IS 'Perfis unificados de usuários que vinculam contas Google e carteiras Solana';
COMMENT ON COLUMN user_profiles.google_email IS 'Email da conta Google do usuário';
COMMENT ON COLUMN user_profiles.wallet_address IS 'Endereço da carteira Solana do usuário';
COMMENT ON COLUMN user_profiles.display_name IS 'Nome de exibição do usuário';
COMMENT ON COLUMN user_profiles.created_at IS 'Data de criação do perfil';
COMMENT ON COLUMN user_profiles.updated_at IS 'Data da última atualização do perfil';
