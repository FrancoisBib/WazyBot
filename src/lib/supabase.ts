import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types matching the actual schema
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          full_name: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          full_name?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          full_name?: string | null
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          bio: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          updated_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          category_id: number | null
          stock_quantity: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          category_id?: number | null
          stock_quantity?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          category_id?: number | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          status: string
          total_amount: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          status: string
          total_amount: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          unit_price: number
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity: number
          unit_price: number
          created_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          unit_price?: number
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string | null
          customer_phone: string
          customer_name: string | null
          status: string | null
          last_message: string | null
          last_message_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          customer_phone: string
          customer_name?: string | null
          status?: string | null
          last_message?: string | null
          last_message_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          customer_phone?: string
          customer_name?: string | null
          status?: string | null
          last_message?: string | null
          last_message_at?: string | null
          updated_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string | null
          sender_type: string
          content: string
          message_type: string | null
          metadata: Record<string, any> | null
          created_at: string | null
        }
        Insert: {
          id?: string
          conversation_id?: string | null
          sender_type: string
          content: string
          message_type?: string | null
          metadata?: Record<string, any> | null
          created_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string | null
          sender_type?: string
          content?: string
          message_type?: string | null
          metadata?: Record<string, any> | null
        }
      }
      ai_settings: {
        Row: {
          id: string
          user_id: string | null
          assistant_name: string | null
          tone_of_voice: string | null
          language: string | null
          auto_respond: boolean | null
          product_recommendations: boolean | null
          order_processing: boolean | null
          welcome_message: string | null
          away_message: string | null
          custom_responses: Record<string, any> | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          assistant_name?: string | null
          tone_of_voice?: string | null
          language?: string | null
          auto_respond?: boolean | null
          product_recommendations?: boolean | null
          order_processing?: boolean | null
          welcome_message?: string | null
          away_message?: string | null
          custom_responses?: Record<string, any> | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          assistant_name?: string | null
          tone_of_voice?: string | null
          language?: string | null
          auto_respond?: boolean | null
          product_recommendations?: boolean | null
          order_processing?: boolean | null
          welcome_message?: string | null
          away_message?: string | null
          custom_responses?: Record<string, any> | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}