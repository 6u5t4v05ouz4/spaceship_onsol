-- ============================================================================
-- MISSIONS SCHEMA
-- ============================================================================
-- Tables for missions system: missions and user_mission_progress
-- ============================================================================

-- Create missions table
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  objective TEXT NOT NULL,
  reward_coins INTEGER NOT NULL DEFAULT 0 CHECK (reward_coins >= 0),
  reward_exp INTEGER NOT NULL DEFAULT 0 CHECK (reward_exp >= 0),
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  icon TEXT, -- emoji or icon identifier
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_mission_progress table
CREATE TABLE IF NOT EXISTS public.user_mission_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, mission_id)
);

-- Add comments
COMMENT ON TABLE public.missions IS 'Available missions in the game';
COMMENT ON TABLE public.user_mission_progress IS 'User progress on missions';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_missions_difficulty ON public.missions(difficulty);
CREATE INDEX IF NOT EXISTS idx_missions_is_active ON public.missions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_mission_progress_user_id ON public.user_mission_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mission_progress_mission_id ON public.user_mission_progress(mission_id);
CREATE INDEX IF NOT EXISTS idx_user_mission_progress_status ON public.user_mission_progress(status);

-- Enable RLS
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mission_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for missions (public read)
CREATE POLICY "Anyone can view active missions"
  ON public.missions FOR SELECT
  USING (is_active = true);

-- RLS Policies for user_mission_progress
CREATE POLICY "Users can view their own mission progress"
  ON public.user_mission_progress FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE google_email = (auth.jwt() ->> 'email')
    )
  );

CREATE POLICY "Users can insert their own mission progress"
  ON public.user_mission_progress FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE google_email = (auth.jwt() ->> 'email')
    )
  );

CREATE POLICY "Users can update their own mission progress"
  ON public.user_mission_progress FOR UPDATE
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE google_email = (auth.jwt() ->> 'email')
    )
  );

-- Grant permissions
GRANT SELECT ON public.missions TO authenticated, anon;
GRANT ALL ON public.user_mission_progress TO authenticated;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_missions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER missions_updated_at
  BEFORE UPDATE ON public.missions
  FOR EACH ROW
  EXECUTE FUNCTION update_missions_updated_at();

CREATE TRIGGER user_mission_progress_updated_at
  BEFORE UPDATE ON public.user_mission_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_missions_updated_at();

-- ============================================================================
-- SEED DATA - Sample Missions
-- ============================================================================

INSERT INTO public.missions (title, description, objective, reward_coins, reward_exp, difficulty, icon) VALUES
('First Steps in Space', 'Welcome to Space Crypto Miner! Complete your first mining session to get started.', 'Complete 1 mining session', 100, 50, 'easy', '🚀'),
('Asteroid Hunter', 'Mine resources from 5 different asteroids to prove your mining skills.', 'Mine from 5 asteroids', 500, 200, 'easy', '⛏️'),
('Resource Collector', 'Collect 100 units of any resource to fill your cargo hold.', 'Collect 100 resource units', 300, 150, 'easy', '📦'),
('Space Explorer', 'Discover 3 new planets in the vast universe.', 'Discover 3 planets', 1000, 500, 'medium', '🌍'),
('Combat Ready', 'Win your first PvP battle against another player.', 'Win 1 PvP battle', 800, 400, 'medium', '⚔️'),
('Master Miner', 'Complete 20 mining sessions to become a master miner.', 'Complete 20 mining sessions', 2000, 1000, 'medium', '💎'),
('Treasure Hunter', 'Find and collect 3 rare resources in the galaxy.', 'Collect 3 rare resources', 1500, 750, 'hard', '🏆'),
('Battle Champion', 'Win 10 PvP battles to prove your combat superiority.', 'Win 10 PvP battles', 5000, 2500, 'hard', '👑'),
('Galaxy Dominator', 'Discover 10 planets and claim them as your territory.', 'Discover 10 planets', 10000, 5000, 'hard', '🌌'),
('Legendary Miner', 'Mine 1000 units of resources to achieve legendary status.', 'Mine 1000 resource units', 20000, 10000, 'hard', '⭐')
ON CONFLICT DO NOTHING;

