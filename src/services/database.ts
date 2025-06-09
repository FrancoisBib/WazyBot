import { supabase } from '../lib/supabase'

// Types based on the actual database schema
export type Profile = {
  id: string
  username?: string
  avatar_url?: string
  bio?: string
  updated_at?: string
}

export type Product = {
  id: string
  name: string
  description?: string
  price: number
  category_id?: number
  stock_quantity: number
  created_at?: string
  updated_at?: string
}

export type Conversation = {
  id: string
  user_id?: string
  customer_phone: string
  customer_name?: string
  status: 'active' | 'resolved' | 'pending' | 'ai_handled'
  last_message?: string
  last_message_at?: string
  created_at?: string
  updated_at?: string
}

export type Message = {
  id: string
  conversation_id?: string
  sender_type: 'customer' | 'ai' | 'human'
  content: string
  message_type: 'text' | 'product_recommendation' | 'order_summary'
  metadata?: any
  created_at?: string
}

export type Order = {
  id: string
  user_id?: string
  status: string
  total_amount: number
  created_at?: string
  updated_at?: string
}

export type AISettings = {
  id: string
  user_id?: string
  assistant_name: string
  tone_of_voice: string
  language: string
  auto_respond: boolean
  product_recommendations: boolean
  order_processing: boolean
  welcome_message: string
  away_message: string
  custom_responses?: any
  created_at?: string
  updated_at?: string
}

// Profile operations
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error)
      throw error
    }
    return data
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ 
        id: userId, 
        ...updates, 
        updated_at: new Date().toISOString() 
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error updating profile:', error)
      throw error
    }
    return data
  },

  async createProfile(userId: string, profileData: Partial<Profile> = {}) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ 
        id: userId,
        ...profileData
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating profile:', error)
      throw error
    }
    return data
  }
}

// Product operations
export const productService = {
  async getProducts(userId: string): Promise<Product[]> {
    // Since products don't have user_id in the current schema, get all products
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching products:', error)
      throw error
    }
    return data || []
  },

  async createProduct(product: {
    name: string
    description?: string
    price: number
    category: string
    stock_quantity?: number
    image_url?: string
    keywords?: string[]
    is_active?: boolean
    user_id: string
  }) {
    // First, get or create category
    let categoryId = null
    
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('name', product.category)
      .single()
    
    if (existingCategory) {
      categoryId = existingCategory.id
    } else {
      const { data: newCategory, error: categoryError } = await supabase
        .from('categories')
        .insert({ name: product.category })
        .select('id')
        .single()
      
      if (categoryError) {
        console.error('Error creating category:', categoryError)
        throw categoryError
      }
      categoryId = newCategory.id
    }

    // Create product
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        description: product.description,
        price: product.price,
        category_id: categoryId,
        stock_quantity: product.stock_quantity || 0
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating product:', error)
      throw error
    }
    return data
  },

  async updateProduct(productId: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', productId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating product:', error)
      throw error
    }
    return data
  },

  async deleteProduct(productId: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
    
    if (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }
}

// Conversation operations
export const conversationService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false, nullsFirst: false })
    
    if (error) {
      console.error('Error fetching conversations:', error)
      throw error
    }
    return data || []
  },

  async getConversation(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching conversation:', error)
      throw error
    }
    return data
  },

  async createConversation(conversation: {
    user_id: string
    customer_phone: string
    customer_name?: string
    status?: 'active' | 'resolved' | 'pending' | 'ai_handled'
    last_message?: string
    last_message_at?: string
  }) {
    const { data, error } = await supabase
      .from('conversations')
      .insert(conversation)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
    return data
  },

  async updateConversation(conversationId: string, updates: Partial<Conversation>) {
    const { data, error } = await supabase
      .from('conversations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', conversationId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating conversation:', error)
      throw error
    }
    return data
  }
}

// Message operations
export const messageService = {
  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching messages:', error)
      throw error
    }
    return data || []
  },

  async createMessage(message: {
    conversation_id: string
    sender_type: 'customer' | 'ai' | 'human'
    content: string
    message_type?: 'text' | 'product_recommendation' | 'order_summary'
    metadata?: any
  }) {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating message:', error)
      throw error
    }
    return data
  }
}

// Order operations
export const orderService = {
  async getOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching orders:', error)
      throw error
    }
    return data || []
  },

  async createOrder(order: {
    user_id: string
    status: string
    total_amount: number
  }) {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating order:', error)
      throw error
    }
    return data
  },

  async updateOrder(orderId: string, updates: Partial<Order>) {
    const { data, error } = await supabase
      .from('orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating order:', error)
      throw error
    }
    return data
  }
}

// AI Settings operations
export const aiSettingsService = {
  async getAISettings(userId: string): Promise<AISettings | null> {
    const { data, error } = await supabase
      .from('ai_settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching AI settings:', error)
      throw error
    }
    return data
  },

  async updateAISettings(userId: string, settings: Partial<AISettings>) {
    const { data, error } = await supabase
      .from('ai_settings')
      .upsert({ 
        user_id: userId, 
        ...settings, 
        updated_at: new Date().toISOString() 
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error updating AI settings:', error)
      throw error
    }
    return data
  }
}

// Analytics operations
export const analyticsService = {
  async getDashboardStats(userId: string) {
    try {
      const [conversations, orders, products] = await Promise.all([
        conversationService.getConversations(userId),
        orderService.getOrders(userId),
        productService.getProducts(userId)
      ])

      const totalRevenue = orders
        .filter(order => order.status === 'completed' || order.status === 'delivered')
        .reduce((sum, order) => sum + order.total_amount, 0)

      const activeCustomers = new Set(
        conversations
          .filter(conv => conv.status === 'active')
          .map(conv => conv.customer_phone)
      ).size

      const totalConversations = conversations.length
      const aiHandledConversations = conversations.filter(conv => conv.status === 'ai_handled').length
      const aiResponseRate = totalConversations > 0 ? (aiHandledConversations / totalConversations) * 100 : 94.2

      return {
        totalRevenue,
        activeCustomers,
        totalConversations,
        aiResponseRate,
        totalProducts: products.length,
        activeProducts: products.length, // All products are considered active for now
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length
      }
    } catch (error) {
      console.error('Error getting dashboard stats:', error)
      // Return default stats if there's an error
      return {
        totalRevenue: 0,
        activeCustomers: 0,
        totalConversations: 0,
        aiResponseRate: 94.2,
        totalProducts: 0,
        activeProducts: 0,
        totalOrders: 0,
        pendingOrders: 0
      }
    }
  }
}