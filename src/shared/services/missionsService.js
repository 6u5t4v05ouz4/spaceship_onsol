/**
 * MissionsService - Manage missions and user progress
 */

/**
 * Get all missions with user progress
 * @param {object} supabase - Supabase client
 * @param {string} userId - User profile ID
 * @param {string} filter - Filter: 'all', 'completed', 'in_progress', 'not_started'
 * @returns {Promise<Array>} - Missions with progress
 */
export async function getMissions(supabase, userId, filter = 'all') {
  try {
    // Get all active missions
    const { data: missions, error: missionsError } = await supabase
      .from('missions')
      .select('*')
      .eq('is_active', true)
      .order('difficulty', { ascending: true })
      .order('reward_coins', { ascending: true });

    if (missionsError) {
      throw new Error('Failed to load missions: ' + missionsError.message);
    }

    // Get user progress for all missions
    const { data: progress, error: progressError } = await supabase
      .from('user_mission_progress')
      .select('*')
      .eq('user_id', userId);

    if (progressError && progressError.code !== 'PGRST116') {
      console.warn('⚠️ Could not load progress:', progressError);
    }

    // Merge missions with progress
    const missionsWithProgress = missions.map(mission => {
      const userProgress = progress?.find(p => p.mission_id === mission.id);
      return {
        ...mission,
        status: userProgress?.status || 'not_started',
        progress: userProgress?.progress || 0,
        completed_at: userProgress?.completed_at || null,
        user_progress_id: userProgress?.id || null
      };
    });

    // Apply filter
    if (filter !== 'all') {
      return missionsWithProgress.filter(m => m.status === filter);
    }

    return missionsWithProgress;
  } catch (error) {
    console.error('❌ Error in getMissions:', error);
    throw error;
  }
}

/**
 * Get mission details by ID
 * @param {object} supabase - Supabase client
 * @param {string} missionId - Mission ID
 * @param {string} userId - User profile ID
 * @returns {Promise<object>} - Mission with progress
 */
export async function getMissionDetails(supabase, missionId, userId) {
  try {
    // Get mission
    const { data: mission, error: missionError } = await supabase
      .from('missions')
      .select('*')
      .eq('id', missionId)
      .single();

    if (missionError) {
      throw new Error('Failed to load mission: ' + missionError.message);
    }

    // Get user progress
    const { data: userProgress, error: progressError } = await supabase
      .from('user_mission_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .maybeSingle();

    if (progressError) {
      console.warn('⚠️ Could not load progress:', progressError);
    }

    return {
      ...mission,
      status: userProgress?.status || 'not_started',
      progress: userProgress?.progress || 0,
      completed_at: userProgress?.completed_at || null,
      user_progress_id: userProgress?.id || null
    };
  } catch (error) {
    console.error('❌ Error in getMissionDetails:', error);
    throw error;
  }
}

/**
 * Start a mission (set status to in_progress)
 * @param {object} supabase - Supabase client
 * @param {string} userId - User profile ID
 * @param {string} missionId - Mission ID
 * @returns {Promise<object>} - Updated progress
 */
export async function startMission(supabase, userId, missionId) {
  try {
    // Check if progress exists
    const { data: existing } = await supabase
      .from('user_mission_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .maybeSingle();

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('user_mission_progress')
        .update({ status: 'in_progress' })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to start mission: ' + error.message);
      }

      return data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('user_mission_progress')
        .insert([{
          user_id: userId,
          mission_id: missionId,
          status: 'in_progress',
          progress: 0
        }])
        .select()
        .single();

      if (error) {
        throw new Error('Failed to start mission: ' + error.message);
      }

      return data;
    }
  } catch (error) {
    console.error('❌ Error in startMission:', error);
    throw error;
  }
}

/**
 * Update mission progress
 * @param {object} supabase - Supabase client
 * @param {string} userId - User profile ID
 * @param {string} missionId - Mission ID
 * @param {number} progress - Progress percentage (0-100)
 * @returns {Promise<object>} - Updated progress
 */
export async function updateMissionProgress(supabase, userId, missionId, progress) {
  try {
    const { data, error } = await supabase
      .from('user_mission_progress')
      .update({ 
        progress: Math.min(100, Math.max(0, progress)),
        status: progress >= 100 ? 'completed' : 'in_progress',
        completed_at: progress >= 100 ? new Date().toISOString() : null
      })
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update progress: ' + error.message);
    }

    return data;
  } catch (error) {
    console.error('❌ Error in updateMissionProgress:', error);
    throw error;
  }
}

/**
 * Complete a mission
 * @param {object} supabase - Supabase client
 * @param {string} userId - User profile ID
 * @param {string} missionId - Mission ID
 * @returns {Promise<object>} - Updated progress
 */
export async function completeMission(supabase, userId, missionId) {
  try {
    const { data, error } = await supabase
      .from('user_mission_progress')
      .update({ 
        status: 'completed',
        progress: 100,
        completed_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to complete mission: ' + error.message);
    }

    return data;
  } catch (error) {
    console.error('❌ Error in completeMission:', error);
    throw error;
  }
}

/**
 * Get mission statistics
 * @param {object} supabase - Supabase client
 * @param {string} userId - User profile ID
 * @returns {Promise<object>} - Statistics
 */
export async function getMissionStats(supabase, userId) {
  try {
    const { data, error } = await supabase
      .from('user_mission_progress')
      .select('status')
      .eq('user_id', userId);

    if (error && error.code !== 'PGRST116') {
      throw new Error('Failed to load stats: ' + error.message);
    }

    const stats = {
      total: data?.length || 0,
      completed: data?.filter(p => p.status === 'completed').length || 0,
      in_progress: data?.filter(p => p.status === 'in_progress').length || 0,
      not_started: 0 // Will be calculated from total missions
    };

    return stats;
  } catch (error) {
    console.error('❌ Error in getMissionStats:', error);
    throw error;
  }
}

