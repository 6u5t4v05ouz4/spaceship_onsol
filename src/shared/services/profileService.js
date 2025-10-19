/**
 * ProfileService - Serviço de gerenciamento de perfil do usuário
 * Encapsula operações: buscar, validar, atualizar, upload de avatar
 */

/**
 * Buscar perfil do usuário
 * @param {object} supabase - Cliente Supabase
 * @param {string} userId - ID do usuário
 * @returns {Promise<object>} - Dados do perfil
 */
export async function getProfile(supabase, userId) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('google_email', userId) // Mudança: buscar por email, não por id
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw new Error('Erro ao buscar perfil: ' + error.message);
    }

    return data || { 
      id: userId,
      username: 'Usuário',
      bio: '',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Erro em getProfile:', error);
    throw error;
  }
}

/**
 * Validar dados do perfil
 * @param {object} profile - Dados do perfil
 * @returns {object|null} - Objeto com erros ou null se válido
 */
export function validateProfileData(profile) {
  const errors = {};

  // Validar username
  if (!profile.username || profile.username.trim().length === 0) {
    errors.username = 'Username é obrigatório';
  } else if (profile.username.trim().length < 3) {
    errors.username = 'Username deve ter pelo menos 3 caracteres';
  } else if (profile.username.length > 50) {
    errors.username = 'Username não pode exceder 50 caracteres';
  } else if (!/^[a-zA-Z0-9_]+$/.test(profile.username)) {
    errors.username = 'Username pode conter apenas letras, números e underscore';
  }

  // Validar bio
  if (profile.bio && profile.bio.length > 500) {
    errors.bio = 'Bio não pode exceder 500 caracteres';
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Atualizar perfil no Supabase
 * @param {object} supabase - Cliente Supabase
 * @param {string} userId - ID do usuário
 * @param {object} profileData - Dados a atualizar (username, bio, avatar_url)
 * @returns {Promise<object>} - Perfil atualizado
 */
export async function updateProfile(supabase, googleEmail, profileData) {
  try {
    // Validar antes de enviar
    const validationErrors = validateProfileData(profileData);
    if (validationErrors) {
      const errorMsg = Object.entries(validationErrors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join('; ');
      throw new Error(errorMsg);
    }

    // Preparar dados para atualizar
    const updateData = {
      username: profileData.username.trim(),
      bio: profileData.bio?.trim() || null,
      updated_at: new Date().toISOString()
    };

    // Se tem avatar_url, adicionar
    if (profileData.avatar_url) {
      updateData.avatar_url = profileData.avatar_url;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('google_email', googleEmail)
      .select()
      .single();

    if (error) {
      throw new Error('Erro ao salvar perfil: ' + error.message);
    }

    console.log('✅ Perfil atualizado:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro em updateProfile:', error);
    throw error;
  }
}

/**
 * Fazer upload de avatar
 * @param {object} supabase - Cliente Supabase
 * @param {string} googleEmail - Email do Google do usuário
 * @param {File} file - Arquivo de imagem
 * @returns {Promise<string>} - URL pública da imagem
 */
export async function uploadAvatar(supabase, googleEmail, file) {
  try {
    // Validar arquivo
    const validationError = validateAvatarFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    // Gerar nome único baseado no email (remover caracteres especiais)
    const emailPrefix = googleEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_');
    const ext = file.name.split('.').pop();
    const fileName = `${emailPrefix}-${Date.now()}.${ext}`;

    console.log('📤 Upload de avatar:', fileName);

    // Fazer upload
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      throw new Error('Erro ao fazer upload: ' + uploadError.message);
    }

    // Obter URL pública
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    console.log('✅ Avatar uploadado:', data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('❌ Erro em uploadAvatar:', error);
    throw error;
  }
}

/**
 * Validar arquivo de avatar
 * @param {File} file - Arquivo
 * @returns {string|null} - Mensagem de erro ou null se válido
 */
export function validateAvatarFile(file) {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  if (!file) {
    return 'Arquivo não selecionado';
  }

  if (file.size > MAX_SIZE) {
    return `Arquivo muito grande. Máximo: 5MB (seu arquivo: ${(file.size / 1024 / 1024).toFixed(2)}MB)`;
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Formato não suportado. Use: JPG, PNG ou WebP';
  }

  return null;
}

export default {
  getProfile,
  validateProfileData,
  updateProfile,
  uploadAvatar,
  validateAvatarFile
};
