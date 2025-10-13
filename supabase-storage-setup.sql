-- Configuração do Storage para fotos de perfil
-- Execute este script no SQL Editor do Supabase Dashboard

-- Criar bucket para fotos de perfil
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-photos',
    'profile-photos',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload de fotos de perfil
CREATE POLICY "Users can upload their own profile photos" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir visualização de fotos de perfil
CREATE POLICY "Profile photos are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');

-- Política para permitir atualização de fotos de perfil
CREATE POLICY "Users can update their own profile photos" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir exclusão de fotos de perfil
CREATE POLICY "Users can delete their own profile photos" ON storage.objects
FOR DELETE USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE id = 'profile-photos';
