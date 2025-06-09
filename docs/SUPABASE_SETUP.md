# Complete Supabase Project Setup Guide

## Step 1: Create New Supabase Project

1. **Go to Supabase Dashboard**
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sign in or create an account

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Project Name: `wazybot-saas-platform`
   - Database Password: Generate a strong password (save this securely)
   - Region: Choose closest to your target users (e.g., `us-east-1`, `eu-west-1`)
   - Pricing Plan: Start with Free tier

3. **Wait for Project Creation**
   - This takes 2-3 minutes
   - Note down your project URL and API keys when ready

## Step 2: Configure Environment Variables

Create a `.env` file in your project root with the following:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual project URL and anon key from the Supabase dashboard.

## Step 3: Database Schema Setup

Run the following SQL commands in the Supabase SQL Editor:

### 3.1 Enable Extensions and Create Core Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  business_name text,
  business_description text,
  phone_number text,
  whatsapp_number text,
  subscription_tier text DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'pro', 'business')),
  avatar_url text,
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  category_id integer REFERENCES public.categories(id),
  stock_quantity integer DEFAULT 0,
  image_url text,
  keywords text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  customer_phone text NOT NULL,
  customer_name text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'pending', 'ai_handled')),
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'ai', 'human')),
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'product_recommendation', 'order_summary')),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.conversations(id),
  customer_phone text NOT NULL,
  customer_name text,
  items jsonb NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create AI settings table
CREATE TABLE IF NOT EXISTS public.ai_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  assistant_name text DEFAULT 'AI Assistant',
  tone_of_voice text DEFAULT 'friendly',
  language text DEFAULT 'en',
  auto_respond boolean DEFAULT true,
  product_recommendations boolean DEFAULT true,
  order_processing boolean DEFAULT true,
  welcome_message text DEFAULT 'Hello! How can I help you today?',
  away_message text DEFAULT 'Thanks for your message! We''ll get back to you soon.',
  custom_responses jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 3.2 Create Indexes for Performance

```sql
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
```

### 3.3 Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
```

### 3.4 Create RLS Policies

```sql
-- Users table policies
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Profiles table policies
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Products table policies
CREATE POLICY "Users can read own products" ON public.products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON public.products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON public.products
  FOR DELETE USING (auth.uid() = user_id);

-- Conversations table policies
CREATE POLICY "Users can read own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages table policies
CREATE POLICY "Users can read messages from own conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own conversations" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

-- Orders table policies
CREATE POLICY "Users can read own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

-- AI settings table policies
CREATE POLICY "Users can read own ai_settings" ON public.ai_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai_settings" ON public.ai_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai_settings" ON public.ai_settings
  FOR UPDATE USING (auth.uid() = user_id);
```

### 3.5 Create Functions and Triggers

```sql
-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Insert into profiles table
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  
  -- Insert default AI settings
  INSERT INTO public.ai_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_settings_updated_at
  BEFORE UPDATE ON public.ai_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### 3.6 Insert Default Data

```sql
-- Insert default categories
INSERT INTO public.categories (name, description) VALUES
  ('Electronics', 'Electronic devices and gadgets'),
  ('Clothing', 'Fashion and apparel'),
  ('Accessories', 'Fashion accessories and add-ons'),
  ('Home & Garden', 'Home improvement and garden items'),
  ('Beauty', 'Beauty and personal care products'),
  ('Sports', 'Sports and fitness equipment')
ON CONFLICT (name) DO NOTHING;
```

## Step 4: Configure Authentication

1. **Go to Authentication > Settings in Supabase Dashboard**

2. **Configure Auth Settings:**
   - Site URL: `http://localhost:5173` (for development)
   - Redirect URLs: `http://localhost:5173/**`
   - Email confirmation: Disabled (for development)
   - Enable email signup: Yes

3. **Email Templates (Optional):**
   - Customize confirmation and reset password emails
   - Add your branding and styling

## Step 5: Configure Storage (Optional)

1. **Create Storage Bucket:**
   ```sql
   INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
   ```

2. **Set Storage Policies:**
   ```sql
   CREATE POLICY "Users can upload product images" ON storage.objects
     FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

   CREATE POLICY "Anyone can view product images" ON storage.objects
     FOR SELECT USING (bucket_id = 'product-images');
   ```

## Step 6: Test the Configuration

1. **Test Database Connection:**
   - Run a simple query in the SQL Editor
   - Verify all tables are created

2. **Test Authentication:**
   - Try signing up a new user
   - Verify user data is created in all tables

3. **Test RLS Policies:**
   - Create test data
   - Verify users can only access their own data

## Step 7: Production Configuration

When ready for production:

1. **Update Environment Variables:**
   - Add production Supabase URL and keys
   - Update redirect URLs in auth settings

2. **Configure Custom Domain (Optional):**
   - Set up custom domain in Supabase dashboard
   - Update DNS settings

3. **Enable Email Confirmation:**
   - Enable email confirmation in auth settings
   - Configure SMTP settings

4. **Set Up Monitoring:**
   - Enable database monitoring
   - Set up alerts for usage limits

## Security Checklist

- ✅ RLS enabled on all tables
- ✅ Proper policies for data access
- ✅ Secure functions with SECURITY DEFINER
- ✅ Input validation in application layer
- ✅ Environment variables secured
- ✅ API keys not exposed in frontend

## Backup and Recovery

1. **Enable Point-in-Time Recovery:**
   - Available on Pro plan and above
   - Automatic daily backups

2. **Export Schema:**
   - Regularly export database schema
   - Version control migration files

## Support and Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

---

**Next Steps:**
1. Follow this guide step by step
2. Update your `.env` file with the new project credentials
3. Test the application with the new database
4. Deploy to production when ready