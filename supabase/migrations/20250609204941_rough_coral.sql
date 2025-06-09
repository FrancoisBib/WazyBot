/*
  # Fix Supabase user signup database error

  1. Database Configuration
    - Enable RLS on users table with proper policies
    - Fix profiles table policies for trigger compatibility
    - Create proper trigger functions for user creation

  2. Security
    - Add RLS policies for users table
    - Update profiles policies to work with triggers
    - Add AI settings policies for service role

  3. Triggers
    - Create handle_new_user function for profile creation
    - Create handle_new_user_ai_settings function for AI settings
    - Set up triggers on auth.users table
*/

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for users table (fix type casting)
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Update profiles table policies to work better with triggers
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new policies that work with both triggers and user operations
CREATE POLICY "Enable insert for authenticated users and service role"
  ON profiles
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create or replace the trigger function for handling new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure the trigger function has proper permissions
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;

-- Create default AI settings for new users
CREATE OR REPLACE FUNCTION handle_new_user_ai_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ai_settings (
    user_id,
    assistant_name,
    tone_of_voice,
    language,
    auto_respond,
    product_recommendations,
    order_processing,
    welcome_message,
    away_message
  ) VALUES (
    NEW.id,
    'AI Assistant',
    'friendly',
    'en',
    true,
    true,
    true,
    'Hello! How can I help you today?',
    'Thanks for your message! We''ll get back to you soon.'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for AI settings
DROP TRIGGER IF EXISTS on_auth_user_created_ai_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_ai_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_ai_settings();

-- Grant permissions
GRANT EXECUTE ON FUNCTION handle_new_user_ai_settings() TO service_role;

-- Add policy for AI settings creation via trigger
CREATE POLICY "Enable insert for service role on ai_settings"
  ON ai_settings
  FOR INSERT
  TO service_role
  WITH CHECK (true);