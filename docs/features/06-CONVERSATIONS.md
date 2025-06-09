# 💬 Gestion des Conversations - Documentation Complète

## 📋 Vue d'ensemble

Le système de gestion des conversations de WazyBot centralise tous les échanges WhatsApp entre vos clients et votre assistant IA. Il offre une interface intuitive pour monitorer, intervenir et analyser les interactions en temps réel.

## ✨ Fonctionnalités Principales

### 💬 Interface de Chat
- **Vue en temps réel** - Messages instantanés
- **Historique complet** - Toutes les conversations archivées
- **Statuts visuels** - Lu, livré, en cours de traitement
- **Types de messages** - Texte, images, produits, commandes

### 🤖 Monitoring IA
- **Confiance des réponses** - Score de certitude affiché
- **Escalade automatique** - Transfert vers humain si nécessaire
- **Intervention manuelle** - Prise de contrôle à tout moment
- **Suggestions IA** - Aide à la rédaction de réponses

### 📊 Analytics Conversations
- **Temps de réponse** - Métriques de performance
- **Taux de résolution** - Efficacité de l'IA
- **Satisfaction client** - Feedback et évaluations
- **Sujets populaires** - Analyse des demandes

## 🏗️ Architecture

### Structure des Données

```typescript
interface Conversation {
  id: string
  user_id: string
  customer_phone: string
  customer_name?: string
  status: 'active' | 'resolved' | 'pending' | 'ai_handled'
  last_message?: string
  last_message_at?: string
  created_at: string
  updated_at: string
}

interface Message {
  id: string
  conversation_id: string
  sender_type: 'customer' | 'ai' | 'human'
  content: string
  message_type: 'text' | 'product_recommendation' | 'order_summary'
  metadata?: {
    confidence?: number
    intent?: string
    escalated?: boolean
    products?: string[]
  }
  created_at: string
}
```

### Relations Base de Données

```sql
-- Table conversations
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  customer_phone text NOT NULL,
  customer_name text,
  status text DEFAULT 'active',
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table messages
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL,
  content text NOT NULL,
  message_type text DEFAULT 'text',
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
```

## 💻 Implémentation

### Service de Gestion des Conversations

```typescript
// src/services/conversationService.ts
export const conversationService = {
  async getConversations(
    userId: string, 
    filters?: ConversationFilters
  ): Promise<Conversation[]> {
    let query = supabase
      .from('conversations')
      .select(`
        *,
        messages!inner(
          id,
          sender_type,
          content,
          message_type,
          metadata,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    // Appliquer les filtres
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.search) {
      query = query.or(`
        customer_name.ilike.%${filters.search}%,
        customer_phone.ilike.%${filters.search}%,
        last_message.ilike.%${filters.search}%
      `)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getConversation(conversationId: string): Promise<ConversationWithMessages | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages(
          id,
          sender_type,
          content,
          message_type,
          metadata,
          created_at
        )
      `)
      .eq('id', conversationId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async createConversation(data: CreateConversationData): Promise<Conversation> {
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return conversation
  },

  async updateConversationStatus(
    conversationId: string, 
    status: ConversationStatus
  ): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    if (error) throw error
  },

  async addMessage(messageData: CreateMessageData): Promise<Message> {
    const { data: message, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single()

    if (error) throw error

    // Mettre à jour la conversation
    await this.updateLastMessage(
      messageData.conversation_id,
      messageData.content
    )

    return message
  },

  async updateLastMessage(
    conversationId: string, 
    lastMessage: string
  ): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({
        last_message: lastMessage,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    if (error) throw error
  },

  async escalateToHuman(
    conversationId: string, 
    reason: string
  ): Promise<void> {
    // Marquer la conversation comme nécessitant une intervention humaine
    await this.updateConversationStatus(conversationId, 'pending')

    // Ajouter un message système
    await this.addMessage({
      conversation_id: conversationId,
      sender_type: 'ai',
      content: `🔄 Conversation transférée vers un agent humain. Raison: ${reason}`,
      message_type: 'text',
      metadata: {
        escalated: true,
        escalation_reason: reason,
        escalated_at: new Date().toISOString()
      }
    })

    // Notifier l'équipe
    await this.notifyTeam(conversationId, reason)
  },

  async takeOverConversation(
    conversationId: string, 
    agentId: string
  ): Promise<void> {
    await supabase
      .from('conversations')
      .update({
        status: 'active',
        assigned_agent: agentId,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    // Message de prise en charge
    await this.addMessage({
      conversation_id: conversationId,
      sender_type: 'human',
      content: '👋 Un agent prend en charge votre demande. Comment puis-je vous aider ?',
      message_type: 'text',
      metadata: {
        agent_takeover: true,
        agent_id: agentId
      }
    })
  }
}
```

### Hook useConversations

```typescript
// src/hooks/useConversations.ts
export function useConversations(filters?: ConversationFilters) {
  const { user } = useAuthContext()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadConversations()
      setupRealTimeSubscription()
    }
  }, [user, filters])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const data = await conversationService.getConversations(user!.id, filters)
      setConversations(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const setupRealTimeSubscription = () => {
    const subscription = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${user!.id}`
        },
        (payload) => {
          handleConversationChange(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          handleNewMessage(payload.new as Message)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const handleConversationChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    setConversations(prev => {
      switch (eventType) {
        case 'INSERT':
          return [newRecord, ...prev]
        case 'UPDATE':
          return prev.map(conv => 
            conv.id === newRecord.id ? { ...conv, ...newRecord } : conv
          )
        case 'DELETE':
          return prev.filter(conv => conv.id !== oldRecord.id)
        default:
          return prev
      }
    })
  }

  const handleNewMessage = (message: Message) => {
    // Mettre à jour la conversation correspondante
    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === message.conversation_id) {
          return {
            ...conv,
            last_message: message.content,
            last_message_at: message.created_at
          }
        }
        return conv
      })
    )
  }

  const sendMessage = async (conversationId: string, content: string) => {
    try {
      await conversationService.addMessage({
        conversation_id: conversationId,
        sender_type: 'human',
        content,
        message_type: 'text'
      })

      // Envoyer via WhatsApp
      const conversation = conversations.find(c => c.id === conversationId)
      if (conversation) {
        await whatsappService.sendTextMessage(conversation.customer_phone, content)
      }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return {
    conversations,
    selectedConversation,
    setSelectedConversation,
    loading,
    error,
    sendMessage,
    refreshConversations: loadConversations
  }
}
```

## 🎨 Interface Utilisateur

### Page des Conversations

```typescript
// src/pages/ConversationsPage.tsx
const ConversationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<ConversationStatus>('all')
  
  const { 
    conversations, 
    selectedConversation, 
    setSelectedConversation,
    loading,
    sendMessage 
  } = useConversations({
    search: searchTerm,
    status: selectedFilter === 'all' ? undefined : selectedFilter
  })

  return (
    <DashboardLayout>
      <div className="h-full flex">
        {/* Liste des conversations */}
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation}
          onSelect={setSelectedConversation}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          loading={loading}
        />

        {/* Zone de chat */}
        {selectedConversation ? (
          <ChatArea
            conversationId={selectedConversation}
            onSendMessage={sendMessage}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </DashboardLayout>
  )
}
```

### Composant Liste des Conversations

```typescript
// src/components/ConversationList.tsx
const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
  searchTerm,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  loading
}) => {
  const getStatusColor = (status: ConversationStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'ai_handled': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: ConversationStatus) => {
    switch (status) {
      case 'active': return 'Actif'
      case 'ai_handled': return 'IA'
      case 'resolved': return 'Résolu'
      case 'pending': return 'En attente'
      default: return 'Inconnu'
    }
  }

  if (loading) {
    return <ConversationListSkeleton />
  }

  return (
    <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">Conversations</h1>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Recherche */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Filtre */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedFilter}
            onChange={(e) => onFilterChange(e.target.value as ConversationStatus)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
          >
            <option value="all">Toutes</option>
            <option value="active">Actives</option>
            <option value="ai_handled">Gérées par IA</option>
            <option value="pending">En attente</option>
            <option value="resolved">Résolues</option>
          </select>
        </div>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isSelected={selectedId === conversation.id}
            onClick={() => onSelect(conversation.id)}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
          />
        ))}
        
        {conversations.length === 0 && (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune conversation</p>
            <p className="text-sm text-gray-400">Les conversations apparaîtront ici</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

### Composant Zone de Chat

```typescript
// src/components/ChatArea.tsx
const ChatArea: React.FC<ChatAreaProps> = ({ conversationId, onSendMessage }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversation()
    setupMessageSubscription()
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversation = async () => {
    try {
      const data = await conversationService.getConversation(conversationId)
      setConversation(data)
      setMessages(data?.messages || [])
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
  }

  const setupMessageSubscription = () => {
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    try {
      setIsTyping(true)
      await onSendMessage(conversationId, inputMessage)
      setInputMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleTakeOver = async () => {
    try {
      await conversationService.takeOverConversation(conversationId, user!.id)
      toast.success('Conversation prise en charge')
    } catch (error) {
      toast.error('Erreur lors de la prise en charge')
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              {conversation?.customer_name?.charAt(0) || 'C'}
            </div>
            <div>
              <h2 className="font-bold text-gray-800">
                {conversation?.customer_name || conversation?.customer_phone}
              </h2>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  getStatusColor(conversation?.status)
                }`}>
                  {getStatusText(conversation?.status)}
                </span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">WhatsApp</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {conversation?.status === 'ai_handled' && (
              <button
                onClick={handleTakeOver}
                className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
              >
                Prendre en charge
              </button>
            )}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.sender_type === 'human'}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="bg-white border-t border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Tapez votre message..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              disabled={isTyping}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50"
          >
            {isTyping ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Envoyer'
            )}
          </button>
        </div>
        
        {/* Informations IA */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Bot className="w-4 h-4" />
              <span>IA active</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>94% de précision</span>
            </div>
          </div>
          <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            Paramètres IA
          </button>
        </div>
      </div>
    </div>
  )
}
```

## 🔧 Fonctionnalités Avancées

### Suggestions IA pour Agents

```typescript
// src/services/aiSuggestions.ts
export class AISuggestionService {
  async getSuggestions(
    conversationId: string,
    currentMessage: string
  ): Promise<AISuggestion[]> {
    const conversation = await conversationService.getConversation(conversationId)
    const context = this.buildContext(conversation, currentMessage)
    
    const suggestions = await aiService.generateSuggestions(context)
    
    return suggestions.map(suggestion => ({
      id: generateId(),
      text: suggestion.text,
      confidence: suggestion.confidence,
      type: suggestion.type, // 'response', 'question', 'action'
      metadata: suggestion.metadata
    }))
  }

  private buildContext(conversation: any, currentMessage: string) {
    return {
      conversationHistory: conversation.messages.slice(-10),
      customerProfile: this.extractCustomerProfile(conversation),
      currentMessage,
      businessContext: conversation.user.business_context
    }
  }
}
```

### Analytics des Conversations

```typescript
// src/services/conversationAnalytics.ts
export const conversationAnalytics = {
  async getMetrics(userId: string, timeRange: string): Promise<ConversationMetrics> {
    const conversations = await conversationService.getConversations(userId, {
      dateRange: getTimeRange(timeRange)
    })

    const messages = await this.getAllMessages(conversations.map(c => c.id))

    return {
      totalConversations: conversations.length,
      activeConversations: conversations.filter(c => c.status === 'active').length,
      averageResponseTime: this.calculateAverageResponseTime(messages),
      resolutionRate: this.calculateResolutionRate(conversations),
      customerSatisfaction: await this.getCustomerSatisfaction(conversations),
      topIssues: this.analyzeTopIssues(messages),
      aiPerformance: this.analyzeAIPerformance(messages)
    }
  },

  calculateAverageResponseTime(messages: Message[]): number {
    const responseTimes: number[] = []
    
    for (let i = 0; i < messages.length - 1; i++) {
      const current = messages[i]
      const next = messages[i + 1]
      
      if (current.sender_type === 'customer' && 
          (next.sender_type === 'ai' || next.sender_type === 'human')) {
        const responseTime = new Date(next.created_at).getTime() - 
                           new Date(current.created_at).getTime()
        responseTimes.push(responseTime)
      }
    }

    return responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 1000)
      : 0
  },

  analyzeTopIssues(messages: Message[]): TopIssue[] {
    const issues = new Map<string, number>()
    
    messages
      .filter(m => m.sender_type === 'customer')
      .forEach(message => {
        const intent = this.extractIntent(message.content)
        issues.set(intent, (issues.get(intent) || 0) + 1)
      })

    return Array.from(issues.entries())
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }
}
```

## 📊 Monitoring en Temps Réel

### Dashboard Live

```typescript
// src/components/LiveConversationDashboard.tsx
const LiveConversationDashboard: React.FC = () => {
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    activeConversations: 0,
    pendingMessages: 0,
    aiResponseRate: 0,
    averageWaitTime: 0
  })

  useEffect(() => {
    const subscription = supabase
      .channel('live-metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, 
        () => updateMetrics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, 
        () => updateMetrics())
      .subscribe()

    updateMetrics()
    const interval = setInterval(updateMetrics, 30000) // Mise à jour toutes les 30s

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [])

  const updateMetrics = async () => {
    try {
      const metrics = await conversationAnalytics.getLiveMetrics(user!.id)
      setLiveMetrics(metrics)
    } catch (error) {
      console.error('Error updating live metrics:', error)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <LiveMetricCard
        title="Conversations Actives"
        value={liveMetrics.activeConversations}
        icon={MessageSquare}
        color="blue"
        trend="+5"
      />
      <LiveMetricCard
        title="Messages en Attente"
        value={liveMetrics.pendingMessages}
        icon={Clock}
        color="yellow"
        trend="-2"
      />
      <LiveMetricCard
        title="Taux IA"
        value={`${liveMetrics.aiResponseRate}%`}
        icon={Bot}
        color="purple"
        trend="+1.2%"
      />
      <LiveMetricCard
        title="Temps d'Attente"
        value={`${liveMetrics.averageWaitTime}s`}
        icon={Timer}
        color="green"
        trend="-5s"
      />
    </div>
  )
}
```

## 🧪 Tests

### Tests d'Intégration

```typescript
// tests/conversations.test.ts
describe('Conversation Management', () => {
  test('should create conversation and add message', async () => {
    const conversation = await conversationService.createConversation({
      user_id: 'test-user',
      customer_phone: '+33123456789',
      customer_name: 'Test Customer'
    })

    expect(conversation.id).toBeDefined()
    expect(conversation.status).toBe('active')

    const message = await conversationService.addMessage({
      conversation_id: conversation.id,
      sender_type: 'customer',
      content: 'Hello',
      message_type: 'text'
    })

    expect(message.id).toBeDefined()
    expect(message.content).toBe('Hello')
  })

  test('should escalate conversation to human', async () => {
    const conversationId = 'test-conversation'
    
    await conversationService.escalateToHuman(conversationId, 'Complex query')
    
    const conversation = await conversationService.getConversation(conversationId)
    expect(conversation.status).toBe('pending')
    
    const lastMessage = conversation.messages[conversation.messages.length - 1]
    expect(lastMessage.metadata.escalated).toBe(true)
  })
})
```

---

💬 **Conversations Centralisées** : Une gestion efficace des conversations améliore l'expérience client !