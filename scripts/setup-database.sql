-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
  code VARCHAR(2) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  flag VARCHAR(10) NOT NULL,
  is_schengen BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Schengen countries
INSERT INTO countries (code, name, flag, is_schengen) VALUES
('AT', 'Austria', '🇦🇹', true),
('BE', 'Belgium', '🇧🇪', true),
('BG', 'Bulgaria', '🇧🇬', true),
('HR', 'Croatia', '🇭🇷', true),
('CY', 'Cyprus', '🇨🇾', true),
('CZ', 'Czech Republic', '🇨🇿', true),
('DK', 'Denmark', '🇩🇰', true),
('EE', 'Estonia', '🇪🇪', true),
('FI', 'Finland', '🇫🇮', true),
('FR', 'France', '🇫🇷', true),
('DE', 'Germany', '🇩🇪', true),
('GR', 'Greece', '🇬🇷', true),
('HU', 'Hungary', '🇭🇺', true),
('IS', 'Iceland', '🇮🇸', true),
('IT', 'Italy', '🇮🇹', true),
('LV', 'Latvia', '🇱🇻', true),
('LI', 'Liechtenstein', '🇱🇮', true),
('LT', 'Lithuania', '🇱🇹', true),
('LU', 'Luxembourg', '🇱🇺', true),
('MT', 'Malta', '🇲🇹', true),
('NL', 'Netherlands', '🇳🇱', true),
('NO', 'Norway', '🇳🇴', true),
('PL', 'Poland', '🇵🇱', true),
('PT', 'Portugal', '🇵🇹', true),
('RO', 'Romania', '🇷🇴', true),
('SK', 'Slovakia', '🇸🇰', true),
('SI', 'Slovenia', '🇸🇮', true),
('ES', 'Spain', '🇪🇸', true),
('SE', 'Sweden', '🇸🇪', true),
('CH', 'Switzerland', '🇨🇭', true)
ON CONFLICT (code) DO NOTHING;

-- Create user profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  country_code VARCHAR(5) DEFAULT '+1',
  home_country VARCHAR(2) REFERENCES countries(code),
  travel_reason VARCHAR(50),
  profile_completed BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  analytics_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create visa entries table
CREATE TABLE IF NOT EXISTS visa_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  country_code VARCHAR(2) REFERENCES countries(code) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trip collections table (for grouping related trips)
CREATE TABLE IF NOT EXISTS trip_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL DEFAULT 'My Trip',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trip_collection_id to visa_entries
ALTER TABLE visa_entries 
ADD COLUMN IF NOT EXISTS trip_collection_id UUID REFERENCES trip_collections(id) ON DELETE SET NULL;

-- Create analytics events table (privacy-compliant)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- 'calculation', 'signup', 'destination_selected', etc.
  country_code VARCHAR(2) REFERENCES countries(code), -- destination country
  home_country VARCHAR(2) REFERENCES countries(code), -- user's home country (anonymized)
  trip_duration_days INTEGER, -- length of trip
  days_remaining INTEGER, -- calculated remaining days
  session_id VARCHAR(100), -- anonymous session identifier
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily analytics summary table (pre-aggregated for performance)
CREATE TABLE IF NOT EXISTS analytics_daily_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  total_calculations INTEGER DEFAULT 0,
  total_signups INTEGER DEFAULT 0,
  unique_sessions INTEGER DEFAULT 0,
  popular_destinations JSONB, -- {'ES': 45, 'FR': 32, 'IT': 28}
  home_country_breakdown JSONB, -- {'US': 123, 'CA': 45, 'AU': 23}
  avg_trip_duration DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily_summary ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin access to profiles (for analytics)
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Create RLS policies for visa_entries
CREATE POLICY "Users can view own visa entries" ON visa_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visa entries" ON visa_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visa entries" ON visa_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own visa entries" ON visa_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Admin access to visa entries (for analytics)
CREATE POLICY "Admins can view all visa entries" ON visa_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Create RLS policies for trip_collections
CREATE POLICY "Users can view own trip collections" ON trip_collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trip collections" ON trip_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trip collections" ON trip_collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trip collections" ON trip_collections
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policy for countries (public read)
CREATE POLICY "Anyone can view countries" ON countries
  FOR SELECT USING (true);

-- Analytics events policies
CREATE POLICY "System can insert analytics events" ON analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view analytics events" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Analytics summary policies
CREATE POLICY "System can manage analytics summary" ON analytics_daily_summary
  FOR ALL USING (true);

CREATE POLICY "Admins can view analytics summary" ON analytics_daily_summary
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name, home_country)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'home_country', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visa_entries_updated_at
  BEFORE UPDATE ON visa_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to aggregate daily analytics (to be run via cron)
CREATE OR REPLACE FUNCTION aggregate_daily_analytics(target_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS void AS $$
DECLARE
  daily_stats RECORD;
BEGIN
  -- Calculate daily statistics
  SELECT 
    COUNT(CASE WHEN event_type = 'calculation' THEN 1 END) as total_calculations,
    COUNT(CASE WHEN event_type = 'signup' THEN 1 END) as total_signups,
    COUNT(DISTINCT session_id) as unique_sessions,
    AVG(trip_duration_days) as avg_trip_duration
  INTO daily_stats
  FROM analytics_events 
  WHERE DATE(created_at) = target_date;

  -- Get popular destinations
  WITH destination_counts AS (
    SELECT country_code, COUNT(*) as count
    FROM analytics_events 
    WHERE DATE(created_at) = target_date 
      AND event_type = 'destination_selected'
      AND country_code IS NOT NULL
    GROUP BY country_code
    ORDER BY count DESC
    LIMIT 10
  )
  -- Insert or update daily summary
  INSERT INTO analytics_daily_summary (
    date, 
    total_calculations, 
    total_signups, 
    unique_sessions, 
    avg_trip_duration,
    popular_destinations,
    home_country_breakdown
  )
  SELECT 
    target_date,
    daily_stats.total_calculations,
    daily_stats.total_signups,
    daily_stats.unique_sessions,
    daily_stats.avg_trip_duration,
    COALESCE(json_object_agg(country_code, count), '{}'::json),
    '{}'::json
  FROM destination_counts
  ON CONFLICT (date) 
  DO UPDATE SET
    total_calculations = EXCLUDED.total_calculations,
    total_signups = EXCLUDED.total_signups,
    unique_sessions = EXCLUDED.unique_sessions,
    avg_trip_duration = EXCLUDED.avg_trip_duration,
    popular_destinations = EXCLUDED.popular_destinations;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for analytics performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_date ON analytics_events(DATE(created_at));
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_country ON analytics_events(country_code);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_summary_date ON analytics_daily_summary(date);
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_analytics_consent ON profiles(analytics_consent);
