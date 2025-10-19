/**
 * SettingsService - Manage user preferences and settings
 * All text in English US only (no i18n)
 */

/**
 * Get user profile ID from google email
 * @param {object} supabase - Supabase client
 * @param {string} googleEmail - Google email
 * @returns {Promise<string>} - User profile ID
 */
async function getProfileId(supabase, googleEmail) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('google_email', googleEmail)
    .single();

  if (error) {
    throw new Error('Failed to get profile: ' + error.message);
  }

  return data.id;
}

/**
 * Get user settings from database
 * @param {object} supabase - Supabase client
 * @param {string} googleEmail - Google email from auth
 * @returns {Promise<object>} - User settings
 */
export async function getUserSettings(supabase, googleEmail) {
  try {
    // Get profile ID from email
    const profileId = await getProfileId(supabase, googleEmail);

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', profileId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw new Error('Failed to load settings: ' + error.message);
    }

    // Return settings or defaults if not found
    return data || {
      notifications_enabled: true,
      sound_enabled: true
    };
  } catch (error) {
    console.error('❌ Error in getUserSettings:', error);
    throw error;
  }
}

/**
 * Update notification setting
 * @param {object} supabase - Supabase client
 * @param {string} googleEmail - Google email from auth
 * @param {boolean} enabled - Enable/disable notifications
 * @returns {Promise<object>} - Updated settings
 */
export async function updateNotifications(supabase, googleEmail, enabled) {
  try {
    // Get profile ID from email
    const profileId = await getProfileId(supabase, googleEmail);

    // Check if settings exist
    const { data: existing } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', profileId)
      .single();

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('user_settings')
        .update({ notifications_enabled: enabled })
        .eq('user_id', profileId)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to update notifications: ' + error.message);
      }

      return data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('user_settings')
        .insert([{
          user_id: profileId,
          notifications_enabled: enabled
        }])
        .select()
        .single();

      if (error) {
        throw new Error('Failed to create settings: ' + error.message);
      }

      return data;
    }
  } catch (error) {
    console.error('❌ Error in updateNotifications:', error);
    throw error;
  }
}

/**
 * Update sound setting
 * @param {object} supabase - Supabase client
 * @param {string} googleEmail - Google email from auth
 * @param {boolean} enabled - Enable/disable sound
 * @returns {Promise<object>} - Updated settings
 */
export async function updateSound(supabase, googleEmail, enabled) {
  try {
    // Get profile ID from email
    const profileId = await getProfileId(supabase, googleEmail);

    // Check if settings exist
    const { data: existing } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', profileId)
      .single();

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('user_settings')
        .update({ sound_enabled: enabled })
        .eq('user_id', profileId)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to update sound: ' + error.message);
      }

      return data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('user_settings')
        .insert([{
          user_id: profileId,
          sound_enabled: enabled
        }])
        .select()
        .single();

      if (error) {
        throw new Error('Failed to create settings: ' + error.message);
      }

      return data;
    }
  } catch (error) {
    console.error('❌ Error in updateSound:', error);
    throw error;
  }
}

/**
 * Update all settings at once
 * @param {object} supabase - Supabase client
 * @param {string} googleEmail - Google email from auth
 * @param {object} settings - Settings object
 * @returns {Promise<object>} - Updated settings
 */
export async function updateSettings(supabase, googleEmail, settings) {
  try {
    // Get profile ID from email
    const profileId = await getProfileId(supabase, googleEmail);

    // Check if settings exist
    const { data: existing } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', profileId)
      .single();

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('user_settings')
        .update(settings)
        .eq('user_id', profileId)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to update settings: ' + error.message);
      }

      return data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('user_settings')
        .insert([{
          user_id: profileId,
          ...settings
        }])
        .select()
        .single();

      if (error) {
        throw new Error('Failed to create settings: ' + error.message);
      }

      return data;
    }
  } catch (error) {
    console.error('❌ Error in updateSettings:', error);
    throw error;
  }
}

