# WazyBot Database Schema Documentation

## Overview
This document describes the complete database schema for the WazyBot SaaS platform.

## Tables

### 1. users
Extends Supabase auth.users with additional business information.

```sql
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Relationships:**
- References `auth.users(id)` with CASCADE delete
- One-to-one with `profiles`
- One-to-many with `products`, `conversations`, `orders`, `ai_settings`

### 2. profiles
User profile information and business details.

```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES public.users(id),
  username text UNIQUE,
  business_name text,
  business_description text,
  phone_number text,
  whatsapp_number text,
  subscription_tier text DEFAULT 'starter',
  avatar_url text,
  updated_at timestamptz DEFAULT now()
);
```

**Constraints:**
- `subscription_tier` must be one of: 'starter', 'pro', 'business'

### 3. categories
Product categories for organization.

```sql
CREATE TABLE public.categories (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);
```

### 4. products
Product catalog managed by users.

```sql
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id),
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
```

### 5. conversations
WhatsApp conversations between users and customers.

```sql
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id),
  customer_phone text NOT NULL,
  customer_name text,
  status text DEFAULT 'active',
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Constraints:**
- `status` must be one of: 'active', 'resolved', 'pending', 'ai_handled'

### 6. messages
Individual messages within conversations.

```sql
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid REFERENCES public.conversations(id),
  sender_type text NOT NULL,
  content text NOT NULL,
  message_type text DEFAULT 'text',
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
```

**Constraints:**
- `sender_type` must be one of: 'customer', 'ai', 'human'
- `message_type` must be one of: 'text', 'product_recommendation', 'order_summary'

### 7. orders
Customer orders processed through the system.

```sql
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id),
  conversation_id uuid REFERENCES public.conversations(id),
  customer_phone text NOT NULL,
  customer_name text,
  items jsonb NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending',
  payment_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Constraints:**
- `status` must be one of: 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
- `payment_status` must be one of: 'pending', 'paid', 'failed', 'refunded'

### 8. ai_settings
AI assistant configuration per user.

```sql
CREATE TABLE public.ai_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) UNIQUE,
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

## Indexes

Performance indexes are created on frequently queried columns:

- `idx_products_user_id` - Products by user
- `idx_products_category` - Products by category
- `idx_products_active` - Active products
- `idx_conversations_user_id` - Conversations by user
- `idx_conversations_status` - Conversations by status
- `idx_messages_conversation_id` - Messages by conversation
- `idx_orders_user_id` - Orders by user
- `idx_orders_status` - Orders by status

## Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only access their own data:

### Users Table
- Read: Users can read their own data
- Update: Users can update their own data

### Profiles Table
- Read: Users can read their own profile
- Insert: Users can insert their own profile
- Update: Users can update their own profile

### Products Table
- Read: Users can read their own products
- Insert: Users can insert their own products
- Update: Users can update their own products
- Delete: Users can delete their own products

### Conversations Table
- Read: Users can read their own conversations
- Insert: Users can insert their own conversations
- Update: Users can update their own conversations

### Messages Table
- Read: Users can read messages from their own conversations
- Insert: Users can insert messages to their own conversations

### Orders Table
- Read: Users can read their own orders
- Insert: Users can insert their own orders
- Update: Users can update their own orders

### AI Settings Table
- Read: Users can read their own AI settings
- Insert: Users can insert their own AI settings
- Update: Users can update their own AI settings

## Functions and Triggers

### handle_new_user()
Automatically creates user profile and AI settings when a new user signs up.

### update_updated_at_column()
Automatically updates the `updated_at` timestamp when records are modified.

## Storage

### product-images bucket
- Public bucket for storing product images
- Users can upload, view, update, and delete their product images
- File size limit: 50MB per file

## Default Data

The following categories are pre-populated:
- Electronics
- Clothing
- Accessories
- Home & Garden
- Beauty
- Sports

## Security Considerations

1. **Row Level Security**: All tables have RLS enabled
2. **Data Isolation**: Users can only access their own data
3. **Secure Functions**: All functions use SECURITY DEFINER
4. **Input Validation**: Application layer validates all inputs
5. **API Key Security**: Anon key is safe for frontend use
6. **Service Role**: Service role key should only be used server-side

## Backup and Recovery

- Point-in-time recovery available on Pro plans
- Daily automated backups
- Schema versioning through migration files
- Regular exports recommended for critical data