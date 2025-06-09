# 🤖 Assistant IA - Documentation Complète

## 📋 Vue d'ensemble

L'Assistant IA de WazyBot est le cœur de la plateforme. Il utilise des modèles de langage avancés pour comprendre les intentions des clients, recommander des produits et automatiser les ventes via WhatsApp. L'IA est entièrement personnalisable et s'adapte au style de chaque entreprise.

## ✨ Fonctionnalités Principales

### 🧠 Compréhension du Langage Naturel
- **Analyse d'intention** - Comprend ce que veut le client
- **Extraction d'entités** - Identifie produits, prix, quantités
- **Analyse de sentiment** - Détecte l'humeur du client
- **Support multilingue** - Français, Anglais, Espagnol, Portugais

### 🎯 Personnalisation
- **Ton de voix** - Amical, professionnel, décontracté
- **Personnalité** - Nom et caractère de l'assistant
- **Messages personnalisés** - Accueil, absence, erreur
- **Contexte business** - Adapté à votre secteur d'activité

### 🛍️ Fonctionnalités E-commerce
- **Recommandations produits** - Suggestions intelligentes
- **Gestion des commandes** - Processus de vente automatisé
- **Calcul de prix** - Devis et totaux automatiques
- **Gestion du stock** - Vérification de disponibilité

## 🏗️ Architecture

### Composants Principaux

```
Client WhatsApp
    ↓
Webhook Handler
    ↓
Message Processor
    ↓
Intent Analyzer
    ↓
AI Engine (GPT-4)
    ↓
Response Generator
    ↓
WhatsApp API
```

### Structure des Données

```typescript
interface AISettings {
  id: string
  user_id: string
  assistant_name: string           // Nom de l'assistant
  tone_of_voice: string           // Ton de voix
  language: string                // Langue principale
  auto_respond: boolean           // Réponse automatique
  product_recommendations: boolean // Recommandations activées
  order_processing: boolean       // Traitement des commandes
  welcome_message: string         // Message d'accueil
  away_message: string           // Message d'absence
  custom_responses: any          // Réponses personnalisées
  created_at: string
  updated_at: string
}
```

## 💻 Implémentation

### Service IA Principal

```typescript
// src/services/aiService.ts
export class AIService {
  private openai: OpenAI
  private settings: AISettings

  constructor(settings: AISettings) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    this.settings = settings
  }

  async processMessage(message: string, context: ConversationContext): Promise<AIResponse> {
    try {
      // 1. Analyser l'intention
      const intent = await this.analyzeIntent(message)
      
      // 2. Extraire les entités
      const entities = await this.extractEntities(message)
      
      // 3. Générer la réponse
      const response = await this.generateResponse(intent, entities, context)
      
      return {
        intent,
        entities,
        response,
        confidence: response.confidence,
        shouldEscalate: response.confidence < 0.7
      }
    } catch (error) {
      console.error('AI processing error:', error)
      return this.getFallbackResponse()
    }
  }

  private async analyzeIntent(message: string): Promise<Intent> {
    const prompt = this.buildIntentPrompt(message)
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: this.getSystemPrompt()
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 150
    })

    return this.parseIntentResponse(completion.choices[0].message.content)
  }

  private getSystemPrompt(): string {
    return `
Tu es ${this.settings.assistant_name}, un assistant de vente IA pour ${this.settings.business_context?.name}.

Ton rôle :
- Aider les clients à trouver des produits
- Répondre aux questions sur les produits
- Traiter les commandes
- Fournir un excellent service client

Ton style :
- Ton de voix : ${this.settings.tone_of_voice}
- Langue : ${this.settings.language}
- Toujours poli et professionnel
- Concis mais informatif

Contexte business :
${this.settings.business_context?.description || ''}

Instructions spéciales :
- Si tu ne peux pas aider, propose de transférer vers un humain
- Toujours confirmer les commandes avant de les traiter
- Utilise les informations produits fournies
- Respecte le budget du client
    `
  }
}
```

### Analyseur d'Intentions

```typescript
// src/services/intentAnalyzer.ts
export enum IntentType {
  GREETING = 'greeting',
  PRODUCT_INQUIRY = 'product_inquiry',
  PRICE_REQUEST = 'price_request',
  ORDER_REQUEST = 'order_request',
  SUPPORT_REQUEST = 'support_request',
  GOODBYE = 'goodbye',
  UNKNOWN = 'unknown'
}

export interface Intent {
  type: IntentType
  confidence: number
  entities: Entity[]
  context?: any
}

export class IntentAnalyzer {
  private patterns = {
    [IntentType.GREETING]: [
      /^(salut|bonjour|hello|hi|hey)/i,
      /^(bonsoir|bonne nuit)/i
    ],
    [IntentType.PRODUCT_INQUIRY]: [
      /\b(cherche|recherche|veux|besoin|intéressé)\b.*\b(produit|article)/i,
      /\b(avez-vous|vendez-vous|proposez-vous)\b/i,
      /\b(montrez-moi|voir|regarder)\b/i
    ],
    [IntentType.PRICE_REQUEST]: [
      /\b(prix|coût|coûte|tarif|combien)\b/i,
      /\b(ça coûte|c'est combien)\b/i
    ],
    [IntentType.ORDER_REQUEST]: [
      /\b(commander|acheter|prendre|veux)\b/i,
      /\b(commande|achat|panier)\b/i
    ]
  }

  analyzeIntent(message: string): Intent {
    const normalizedMessage = message.toLowerCase().trim()
    
    for (const [intentType, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedMessage)) {
          return {
            type: intentType as IntentType,
            confidence: this.calculateConfidence(normalizedMessage, pattern),
            entities: this.extractEntities(message)
          }
        }
      }
    }

    return {
      type: IntentType.UNKNOWN,
      confidence: 0.1,
      entities: []
    }
  }

  private calculateConfidence(message: string, pattern: RegExp): number {
    const matches = message.match(pattern)
    if (!matches) return 0

    // Facteurs de confiance
    let confidence = 0.8
    
    // Longueur du message (plus c'est court, plus c'est confiant)
    if (message.length < 20) confidence += 0.1
    
    // Présence de mots-clés multiples
    const keywordCount = (message.match(/\b(produit|prix|commander|acheter)\b/gi) || []).length
    confidence += keywordCount * 0.05

    return Math.min(confidence, 1.0)
  }
}
```

### Extracteur d'Entités

```typescript
// src/services/entityExtractor.ts
export interface Entity {
  type: EntityType
  value: string
  confidence: number
  position: [number, number]
}

export enum EntityType {
  PRODUCT_NAME = 'product_name',
  QUANTITY = 'quantity',
  PRICE = 'price',
  COLOR = 'color',
  SIZE = 'size',
  BRAND = 'brand'
}

export class EntityExtractor {
  private patterns = {
    [EntityType.QUANTITY]: /\b(\d+)\s*(pièces?|unités?|exemplaires?)\b/i,
    [EntityType.PRICE]: /\b(\d+(?:[.,]\d{2})?)\s*(?:€|euros?|EUR)\b/i,
    [EntityType.COLOR]: /\b(rouge|bleu|vert|jaune|noir|blanc|rose|violet|orange|gris)\b/i,
    [EntityType.SIZE]: /\b(XS|S|M|L|XL|XXL|\d+)\b/i
  }

  extractEntities(message: string): Entity[] {
    const entities: Entity[] = []
    
    for (const [entityType, pattern] of Object.entries(this.patterns)) {
      const matches = [...message.matchAll(new RegExp(pattern, 'gi'))]
      
      for (const match of matches) {
        entities.push({
          type: entityType as EntityType,
          value: match[1] || match[0],
          confidence: 0.9,
          position: [match.index!, match.index! + match[0].length]
        })
      }
    }

    // Extraction des noms de produits (plus complexe)
    const productEntities = this.extractProductNames(message)
    entities.push(...productEntities)

    return entities
  }

  private extractProductNames(message: string): Entity[] {
    // Utiliser une liste de produits connus ou un modèle NER
    const knownProducts = [
      'iphone', 'samsung', 'laptop', 'ordinateur',
      'chaussures', 'robe', 'pantalon', 'chemise'
    ]

    const entities: Entity[] = []
    const words = message.toLowerCase().split(/\s+/)

    for (let i = 0; i < words.length; i++) {
      for (const product of knownProducts) {
        if (words[i].includes(product)) {
          entities.push({
            type: EntityType.PRODUCT_NAME,
            value: product,
            confidence: 0.8,
            position: [0, 0] // Simplification
          })
        }
      }
    }

    return entities
  }
}
```

## 🎨 Interface de Configuration

### Page de Configuration IA

```typescript
// src/pages/SettingsPage.tsx - Section IA
const AISettings: React.FC = () => {
  const { settings, updateSettings } = useAISettings()
  const [formData, setFormData] = useState({
    assistant_name: settings?.assistant_name || 'Assistant IA',
    tone_of_voice: settings?.tone_of_voice || 'friendly',
    language: settings?.language || 'fr',
    auto_respond: settings?.auto_respond ?? true,
    product_recommendations: settings?.product_recommendations ?? true,
    order_processing: settings?.order_processing ?? true,
    welcome_message: settings?.welcome_message || 'Bonjour ! Comment puis-je vous aider ?',
    away_message: settings?.away_message || 'Merci pour votre message ! Nous vous répondrons bientôt.'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateSettings(formData)
      toast.success('Paramètres IA mis à jour')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Configuration de la personnalité */}
      <div>
        <h3 className="font-bold text-gray-800 mb-4">Personnalité de l'Assistant</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'assistant
            </label>
            <input
              type="text"
              value={formData.assistant_name}
              onChange={(e) => setFormData({...formData, assistant_name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ton de voix
            </label>
            <select
              value={formData.tone_of_voice}
              onChange={(e) => setFormData({...formData, tone_of_voice: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="friendly">Amical et Professionnel</option>
              <option value="casual">Décontracté et Amical</option>
              <option value="formal">Formel et Professionnel</option>
              <option value="enthusiastic">Enthousiaste et Énergique</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fonctionnalités */}
      <div>
        <h3 className="font-bold text-gray-800 mb-4">Fonctionnalités</h3>
        <div className="space-y-4">
          <ToggleSwitch
            label="Réponse automatique"
            description="L'IA répond automatiquement aux messages clients"
            checked={formData.auto_respond}
            onChange={(checked) => setFormData({...formData, auto_respond: checked})}
          />
          
          <ToggleSwitch
            label="Recommandations produits"
            description="L'IA peut suggérer des produits pertinents"
            checked={formData.product_recommendations}
            onChange={(checked) => setFormData({...formData, product_recommendations: checked})}
          />
          
          <ToggleSwitch
            label="Traitement des commandes"
            description="L'IA peut aider à passer des commandes"
            checked={formData.order_processing}
            onChange={(checked) => setFormData({...formData, order_processing: checked})}
          />
        </div>
      </div>

      {/* Messages personnalisés */}
      <div>
        <h3 className="font-bold text-gray-800 mb-4">Messages Personnalisés</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message d'accueil
            </label>
            <textarea
              rows={3}
              value={formData.welcome_message}
              onChange={(e) => setFormData({...formData, welcome_message: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message d'absence
            </label>
            <textarea
              rows={3}
              value={formData.away_message}
              onChange={(e) => setFormData({...formData, away_message: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
      >
        Sauvegarder les paramètres IA
      </button>
    </form>
  )
}
```

### Composant de Test IA

```typescript
// src/components/AITestChat.tsx
const AITestChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const { settings } = useAISettings()

  const sendTestMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      // Simuler l'appel à l'IA
      const response = await aiService.processMessage(inputMessage, {
        userId: user!.id,
        conversationHistory: messages
      })

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        confidence: response.confidence
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Test AI error:', error)
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-bold text-gray-800 mb-4">Test de l'Assistant IA</h3>
      
      {/* Zone de chat */}
      <div className="h-64 border border-gray-200 rounded-lg p-4 overflow-y-auto mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-3 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              {message.confidence && (
                <p className="text-xs mt-1 opacity-70">
                  Confiance: {Math.round(message.confidence * 100)}%
                </p>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start mb-3">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Zone de saisie */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
          placeholder="Tapez votre message de test..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={sendTestMessage}
          disabled={!inputMessage.trim() || isTyping}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50"
        >
          Envoyer
        </button>
      </div>

      <p className="text-sm text-gray-500 mt-2">
        Testez votre assistant IA avec différents types de messages pour voir comment il répond.
      </p>
    </div>
  )
}
```

## 📊 Monitoring et Analytics

### Métriques IA

```typescript
interface AIMetrics {
  totalMessages: number
  successfulResponses: number
  averageConfidence: number
  escalationRate: number
  responseTime: number
  intentAccuracy: number
  customerSatisfaction: number
}

export const aiAnalytics = {
  async getMetrics(userId: string, timeRange: string): Promise<AIMetrics> {
    const { data: messages } = await supabase
      .from('messages')
      .select(`
        *,
        conversation:conversations(user_id)
      `)
      .eq('conversation.user_id', userId)
      .eq('sender_type', 'ai')
      .gte('created_at', getTimeRangeStart(timeRange))

    return {
      totalMessages: messages.length,
      successfulResponses: messages.filter(m => m.metadata?.confidence > 0.7).length,
      averageConfidence: messages.reduce((sum, m) => sum + (m.metadata?.confidence || 0), 0) / messages.length,
      escalationRate: messages.filter(m => m.metadata?.escalated).length / messages.length,
      responseTime: calculateAverageResponseTime(messages),
      intentAccuracy: calculateIntentAccuracy(messages),
      customerSatisfaction: await getCustomerSatisfactionScore(userId)
    }
  }
}
```

### Dashboard IA

```typescript
// src/components/AIDashboard.tsx
const AIDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AIMetrics | null>(null)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    loadMetrics()
  }, [timeRange])

  const loadMetrics = async () => {
    try {
      const data = await aiAnalytics.getMetrics(user!.id, timeRange)
      setMetrics(data)
    } catch (error) {
      console.error('Error loading AI metrics:', error)
    }
  }

  if (!metrics) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Messages Traités"
          value={metrics.totalMessages.toString()}
          icon={MessageSquare}
          color="blue"
        />
        
        <MetricCard
          title="Taux de Succès"
          value={`${Math.round((metrics.successfulResponses / metrics.totalMessages) * 100)}%`}
          icon={CheckCircle}
          color="green"
        />
        
        <MetricCard
          title="Confiance Moyenne"
          value={`${Math.round(metrics.averageConfidence * 100)}%`}
          icon={Brain}
          color="purple"
        />
        
        <MetricCard
          title="Temps de Réponse"
          value={`${metrics.responseTime}ms`}
          icon={Clock}
          color="orange"
        />
      </div>

      {/* Graphiques détaillés */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ConfidenceChart data={metrics} />
        <IntentDistributionChart data={metrics} />
      </div>
    </div>
  )
}
```

## 🔧 Optimisations

### Cache des Réponses

```typescript
// src/lib/aiCache.ts
class AIResponseCache {
  private cache = new Map<string, { response: string, timestamp: number }>()
  private TTL = 10 * 60 * 1000 // 10 minutes

  generateKey(message: string, context: any): string {
    return crypto
      .createHash('md5')
      .update(JSON.stringify({ message: message.toLowerCase(), context }))
      .digest('hex')
  }

  get(key: string): string | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }

    return cached.response
  }

  set(key: string, response: string): void {
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    })
  }
}
```

### Optimisation des Prompts

```typescript
// src/lib/promptOptimizer.ts
export class PromptOptimizer {
  optimizeForContext(basePrompt: string, context: ConversationContext): string {
    let optimizedPrompt = basePrompt

    // Ajouter le contexte produit si pertinent
    if (context.recentProducts?.length > 0) {
      optimizedPrompt += `\n\nProduits récemment consultés: ${context.recentProducts.join(', ')}`
    }

    // Ajouter l'historique de conversation
    if (context.conversationHistory?.length > 0) {
      const recentHistory = context.conversationHistory.slice(-3)
      optimizedPrompt += `\n\nHistorique récent: ${recentHistory.map(m => `${m.sender}: ${m.content}`).join('\n')}`
    }

    // Adapter selon l'heure
    const hour = new Date().getHours()
    if (hour < 12) {
      optimizedPrompt += '\n\nC\'est le matin, soyez énergique.'
    } else if (hour > 18) {
      optimizedPrompt += '\n\nC\'est le soir, soyez plus détendu.'
    }

    return optimizedPrompt
  }
}
```

## 🧪 Tests et Validation

### Tests de l'IA

```typescript
// tests/ai.test.ts
describe('AI Service', () => {
  test('should analyze intent correctly', async () => {
    const message = 'Je cherche un téléphone pas cher'
    const intent = await aiService.analyzeIntent(message)
    
    expect(intent.type).toBe(IntentType.PRODUCT_INQUIRY)
    expect(intent.confidence).toBeGreaterThan(0.7)
    expect(intent.entities).toContainEqual(
      expect.objectContaining({
        type: EntityType.PRODUCT_NAME,
        value: 'téléphone'
      })
    )
  })

  test('should generate appropriate response', async () => {
    const context = {
      intent: { type: IntentType.PRODUCT_INQUIRY },
      entities: [{ type: EntityType.PRODUCT_NAME, value: 'téléphone' }],
      userProfile: { budget: 'low' }
    }
    
    const response = await aiService.generateResponse(context)
    
    expect(response).toContain('téléphone')
    expect(response).toContain('prix')
    expect(response.length).toBeLessThan(500) // Réponse concise
  })
})
```

### Tests A/B

```typescript
// src/lib/abTesting.ts
export class AIABTesting {
  async getVariant(userId: string, testName: string): Promise<string> {
    const hash = crypto.createHash('md5').update(userId + testName).digest('hex')
    const variant = parseInt(hash.substring(0, 8), 16) % 100
    
    return variant < 50 ? 'A' : 'B'
  }

  async trackConversion(userId: string, testName: string, variant: string) {
    await supabase
      .from('ab_test_results')
      .insert({
        user_id: userId,
        test_name: testName,
        variant,
        converted: true,
        timestamp: new Date().toISOString()
      })
  }
}
```

---

🤖 **IA Intelligente** : Un assistant IA bien configuré peut transformer votre business !