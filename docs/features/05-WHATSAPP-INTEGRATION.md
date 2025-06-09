# 📱 Intégration WhatsApp Business - Documentation Complète

## 📋 Vue d'ensemble

L'intégration WhatsApp Business API est le pont entre vos clients et votre assistant IA. Elle permet de recevoir les messages, les traiter avec l'IA, et renvoyer des réponses automatiques personnalisées en temps réel.

## ✨ Fonctionnalités Principales

### 📨 Gestion des Messages
- **Réception en temps réel** - Webhooks instantanés
- **Envoi automatique** - Réponses IA immédiates
- **Types de messages** - Texte, images, documents, boutons
- **Statuts de livraison** - Envoyé, livré, lu

### 🔄 Webhooks Avancés
- **Sécurisation** - Vérification des signatures
- **Retry logic** - Gestion des échecs
- **Rate limiting** - Protection contre le spam
- **Logging complet** - Traçabilité des échanges

### 🎯 Fonctionnalités Business
- **Messages templates** - Messages pré-approuvés
- **Boutons interactifs** - Actions rapides
- **Listes de produits** - Catalogues intégrés
- **Notifications** - Confirmations de commande

## 🏗️ Architecture

### Flux de Communication

```
Client WhatsApp
    ↓ (Message entrant)
WhatsApp Business API
    ↓ (Webhook)
Serveur WazyBot
    ↓ (Traitement)
Assistant IA
    ↓ (Réponse)
WhatsApp Business API
    ↓ (Message sortant)
Client WhatsApp
```

### Structure des Webhooks

```typescript
interface WhatsAppWebhook {
  object: 'whatsapp_business_account'
  entry: WebhookEntry[]
}

interface WebhookEntry {
  id: string
  changes: WebhookChange[]
}

interface WebhookChange {
  value: {
    messaging_product: 'whatsapp'
    metadata: {
      display_phone_number: string
      phone_number_id: string
    }
    contacts?: Contact[]
    messages?: Message[]
    statuses?: MessageStatus[]
  }
  field: 'messages'
}
```

## 💻 Implémentation

### Service WhatsApp Principal

```typescript
// src/services/whatsappService.ts
export class WhatsAppService {
  private accessToken: string
  private phoneNumberId: string
  private webhookVerifyToken: string

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN!
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!
    this.webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN!
  }

  async sendMessage(to: string, message: WhatsAppMessage): Promise<SendMessageResponse> {
    const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`
    
    const payload = {
      messaging_product: 'whatsapp',
      to,
      ...message
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new WhatsAppError(data.error?.message || 'Failed to send message', data.error?.code)
      }

      // Logger l'envoi
      await this.logMessage('outgoing', to, payload, data)
      
      return data
    } catch (error) {
      console.error('WhatsApp send error:', error)
      throw error
    }
  }

  async sendTextMessage(to: string, text: string): Promise<SendMessageResponse> {
    return this.sendMessage(to, {
      type: 'text',
      text: { body: text }
    })
  }

  async sendProductRecommendation(
    to: string, 
    products: Product[], 
    message?: string
  ): Promise<SendMessageResponse> {
    const sections = [{
      title: 'Nos Recommandations',
      rows: products.slice(0, 10).map(product => ({
        id: product.id,
        title: product.name,
        description: `€${product.price} - ${product.description?.substring(0, 60)}...`
      }))
    }]

    return this.sendMessage(to, {
      type: 'interactive',
      interactive: {
        type: 'list',
        header: {
          type: 'text',
          text: 'Produits Recommandés'
        },
        body: {
          text: message || 'Voici nos recommandations pour vous :'
        },
        footer: {
          text: 'Sélectionnez un produit pour plus d\'infos'
        },
        action: {
          button: 'Voir les produits',
          sections
        }
      }
    })
  }

  async sendOrderConfirmation(
    to: string, 
    order: Order
  ): Promise<SendMessageResponse> {
    const orderText = this.formatOrderConfirmation(order)
    
    return this.sendMessage(to, {
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: orderText
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: `confirm_order_${order.id}`,
                title: 'Confirmer'
              }
            },
            {
              type: 'reply',
              reply: {
                id: `modify_order_${order.id}`,
                title: 'Modifier'
              }
            },
            {
              type: 'reply',
              reply: {
                id: `cancel_order_${order.id}`,
                title: 'Annuler'
              }
            }
          ]
        }
      }
    })
  }

  private formatOrderConfirmation(order: Order): string {
    let text = `🛒 **Récapitulatif de votre commande**\n\n`
    
    order.items.forEach((item: any) => {
      text += `• ${item.quantity}x ${item.name} - €${(item.price * item.quantity).toFixed(2)}\n`
    })
    
    text += `\n💰 **Total: €${order.total_amount.toFixed(2)}**\n\n`
    text += `📦 Livraison estimée: 2-3 jours ouvrés\n`
    text += `📞 Questions? Répondez à ce message!`
    
    return text
  }

  async markAsRead(messageId: string): Promise<void> {
    const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`
    
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      })
    })
  }

  private async logMessage(
    direction: 'incoming' | 'outgoing',
    phoneNumber: string,
    payload: any,
    response?: any
  ): Promise<void> {
    await supabase
      .from('whatsapp_logs')
      .insert({
        direction,
        phone_number: phoneNumber,
        payload,
        response,
        timestamp: new Date().toISOString()
      })
  }
}
```

### Gestionnaire de Webhooks

```typescript
// src/api/webhooks/whatsapp.ts
export async function handleWhatsAppWebhook(request: Request): Promise<Response> {
  const method = request.method
  const url = new URL(request.url)

  // Vérification du webhook (GET)
  if (method === 'GET') {
    return handleWebhookVerification(url.searchParams)
  }

  // Traitement des messages (POST)
  if (method === 'POST') {
    return handleIncomingMessage(request)
  }

  return new Response('Method not allowed', { status: 405 })
}

async function handleWebhookVerification(params: URLSearchParams): Response {
  const mode = params.get('hub.mode')
  const token = params.get('hub.verify_token')
  const challenge = params.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log('Webhook verified successfully')
    return new Response(challenge, { status: 200 })
  }

  console.log('Webhook verification failed')
  return new Response('Forbidden', { status: 403 })
}

async function handleIncomingMessage(request: Request): Promise<Response> {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-hub-signature-256')

    // Vérifier la signature
    if (!verifyWebhookSignature(body, signature)) {
      return new Response('Invalid signature', { status: 401 })
    }

    const webhook: WhatsAppWebhook = JSON.parse(body)
    
    // Traiter chaque entrée
    for (const entry of webhook.entry) {
      for (const change of entry.changes) {
        if (change.field === 'messages') {
          await processMessageChange(change.value)
        }
      }
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

async function processMessageChange(value: any): Promise<void> {
  const { messages, contacts, statuses } = value

  // Traiter les nouveaux messages
  if (messages) {
    for (const message of messages) {
      await processIncomingMessage(message, contacts)
    }
  }

  // Traiter les statuts de livraison
  if (statuses) {
    for (const status of statuses) {
      await processMessageStatus(status)
    }
  }
}

async function processIncomingMessage(
  message: any, 
  contacts: any[]
): Promise<void> {
  try {
    const customerPhone = message.from
    const messageContent = extractMessageContent(message)
    const customerName = contacts?.find(c => c.wa_id === customerPhone)?.profile?.name

    // Marquer comme lu
    await whatsappService.markAsRead(message.id)

    // Trouver ou créer la conversation
    const conversation = await findOrCreateConversation(
      customerPhone, 
      customerName, 
      messageContent
    )

    // Sauvegarder le message
    await saveMessage(conversation.id, message, messageContent)

    // Traiter avec l'IA si activé
    if (conversation.user?.ai_settings?.auto_respond) {
      await processWithAI(conversation, messageContent, customerPhone)
    }

  } catch (error) {
    console.error('Error processing incoming message:', error)
    // Envoyer un message d'erreur générique
    await whatsappService.sendTextMessage(
      message.from,
      "Désolé, nous rencontrons un problème technique. Nous vous répondrons bientôt."
    )
  }
}

function extractMessageContent(message: any): string {
  switch (message.type) {
    case 'text':
      return message.text.body
    case 'interactive':
      if (message.interactive.type === 'button_reply') {
        return message.interactive.button_reply.title
      }
      if (message.interactive.type === 'list_reply') {
        return message.interactive.list_reply.title
      }
      return 'Interactive message'
    case 'image':
      return '[Image]'
    case 'document':
      return '[Document]'
    case 'audio':
      return '[Audio]'
    default:
      return `[${message.type}]`
  }
}

async function processWithAI(
  conversation: any,
  messageContent: string,
  customerPhone: string
): Promise<void> {
  try {
    // Analyser avec l'IA
    const aiResponse = await aiService.processMessage(messageContent, {
      conversationId: conversation.id,
      userId: conversation.user_id,
      customerPhone,
      conversationHistory: await getConversationHistory(conversation.id)
    })

    // Envoyer la réponse
    if (aiResponse.response) {
      if (aiResponse.type === 'product_recommendation' && aiResponse.products) {
        await whatsappService.sendProductRecommendation(
          customerPhone,
          aiResponse.products,
          aiResponse.response
        )
      } else {
        await whatsappService.sendTextMessage(customerPhone, aiResponse.response)
      }

      // Sauvegarder la réponse IA
      await saveMessage(conversation.id, null, aiResponse.response, 'ai')
    }

    // Escalader vers humain si nécessaire
    if (aiResponse.shouldEscalate) {
      await escalateToHuman(conversation, aiResponse.reason)
    }

  } catch (error) {
    console.error('AI processing error:', error)
    // Fallback vers message générique
    await whatsappService.sendTextMessage(
      customerPhone,
      "Je n'ai pas bien compris votre message. Un membre de notre équipe vous répondra bientôt."
    )
  }
}
```

### Vérification des Signatures

```typescript
// src/lib/webhookSecurity.ts
import crypto from 'crypto'

export function verifyWebhookSignature(
  payload: string,
  signature: string | null
): boolean {
  if (!signature) return false

  const expectedSignature = crypto
    .createHmac('sha256', process.env.WHATSAPP_APP_SECRET!)
    .update(payload)
    .digest('hex')

  const receivedSignature = signature.replace('sha256=', '')

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(receivedSignature, 'hex')
  )
}

export function generateWebhookSignature(payload: string): string {
  return crypto
    .createHmac('sha256', process.env.WHATSAPP_APP_SECRET!)
    .update(payload)
    .digest('hex')
}
```

## 🎨 Interface de Monitoring

### Dashboard WhatsApp

```typescript
// src/components/WhatsAppDashboard.tsx
const WhatsAppDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<WhatsAppMetrics | null>(null)
  const [recentMessages, setRecentMessages] = useState<Message[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('connected')

  useEffect(() => {
    loadMetrics()
    loadRecentMessages()
    checkConnectionStatus()
  }, [])

  return (
    <div className="space-y-6">
      {/* Statut de connexion */}
      <div className={`p-4 rounded-lg border ${
        connectionStatus === 'connected' 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <div>
            <p className={`font-medium ${
              connectionStatus === 'connected' ? 'text-green-800' : 'text-red-800'
            }`}>
              WhatsApp Business {connectionStatus === 'connected' ? 'Connecté' : 'Déconnecté'}
            </p>
            <p className={`text-sm ${
              connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'
            }`}>
              {connectionStatus === 'connected' 
                ? 'Votre assistant IA est opérationnel'
                : 'Vérifiez votre configuration WhatsApp'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Messages Reçus"
          value={metrics?.messagesReceived || 0}
          icon={MessageCircle}
          color="blue"
          change="+12%"
        />
        <MetricCard
          title="Réponses IA"
          value={metrics?.aiResponses || 0}
          icon={Bot}
          color="purple"
          change="+8%"
        />
        <MetricCard
          title="Taux de Réponse"
          value={`${metrics?.responseRate || 0}%`}
          icon={TrendingUp}
          color="green"
          change="+2%"
        />
        <MetricCard
          title="Temps Moyen"
          value={`${metrics?.averageResponseTime || 0}s`}
          icon={Clock}
          color="orange"
          change="-0.5s"
        />
      </div>

      {/* Messages récents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Messages Récents</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentMessages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender_type === 'customer' 
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-purple-100 text-purple-600'
                }`}>
                  {message.sender_type === 'customer' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-800">
                      {message.sender_type === 'customer' ? 'Client' : 'IA'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-600">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

## 🔧 Configuration Avancée

### Templates de Messages

```typescript
// src/services/messageTemplates.ts
export class MessageTemplateService {
  async createTemplate(template: MessageTemplate): Promise<string> {
    const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(template)
    })

    const data = await response.json()
    return data.id
  }

  async sendTemplate(
    to: string, 
    templateName: string, 
    parameters: any[] = []
  ): Promise<SendMessageResponse> {
    return whatsappService.sendMessage(to, {
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: 'fr'
        },
        components: parameters.length > 0 ? [{
          type: 'body',
          parameters
        }] : undefined
      }
    })
  }

  // Templates prédéfinis
  async sendWelcomeTemplate(to: string, customerName: string): Promise<SendMessageResponse> {
    return this.sendTemplate('welcome_message', [
      { type: 'text', text: customerName }
    ])
  }

  async sendOrderConfirmationTemplate(
    to: string, 
    orderNumber: string, 
    total: string
  ): Promise<SendMessageResponse> {
    return this.sendTemplate('order_confirmation', [
      { type: 'text', text: orderNumber },
      { type: 'text', text: total }
    ])
  }
}
```

### Gestion des Erreurs

```typescript
// src/lib/whatsappErrors.ts
export class WhatsAppError extends Error {
  constructor(
    message: string,
    public code?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'WhatsAppError'
  }
}

export const whatsappErrorHandler = {
  async handleError(error: WhatsAppError, context: any): Promise<void> {
    // Logger l'erreur
    console.error('WhatsApp Error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      context
    })

    // Sauvegarder en base
    await supabase
      .from('error_logs')
      .insert({
        service: 'whatsapp',
        error_type: error.name,
        message: error.message,
        code: error.code,
        details: error.details,
        context,
        timestamp: new Date().toISOString()
      })

    // Notifier l'équipe si critique
    if (this.isCriticalError(error)) {
      await this.notifyTeam(error, context)
    }

    // Retry automatique pour certaines erreurs
    if (this.shouldRetry(error)) {
      await this.scheduleRetry(context)
    }
  },

  isCriticalError(error: WhatsAppError): boolean {
    const criticalCodes = [
      131000, // Generic user error
      131005, // Message undeliverable
      131021, // Recipient not available
    ]
    return criticalCodes.includes(error.code || 0)
  },

  shouldRetry(error: WhatsAppError): boolean {
    const retryableCodes = [
      131008, // Message could not be sent due to an unknown error
      131009, // Cloud API temporary error
    ]
    return retryableCodes.includes(error.code || 0)
  }
}
```

## 📊 Monitoring et Analytics

### Métriques WhatsApp

```typescript
interface WhatsAppMetrics {
  messagesReceived: number
  messagesSent: number
  aiResponses: number
  humanHandoffs: number
  responseRate: number
  averageResponseTime: number
  errorRate: number
  deliveryRate: number
}

export const whatsappAnalytics = {
  async getMetrics(userId: string, timeRange: string): Promise<WhatsAppMetrics> {
    const startDate = getTimeRangeStart(timeRange)
    
    const [messages, logs] = await Promise.all([
      this.getMessages(userId, startDate),
      this.getLogs(userId, startDate)
    ])

    const received = messages.filter(m => m.sender_type === 'customer').length
    const sent = messages.filter(m => m.sender_type === 'ai').length
    const aiResponses = messages.filter(m => m.sender_type === 'ai').length
    const humanHandoffs = messages.filter(m => m.metadata?.escalated).length

    return {
      messagesReceived: received,
      messagesSent: sent,
      aiResponses,
      humanHandoffs,
      responseRate: received > 0 ? (sent / received) * 100 : 0,
      averageResponseTime: this.calculateAverageResponseTime(messages),
      errorRate: this.calculateErrorRate(logs),
      deliveryRate: this.calculateDeliveryRate(logs)
    }
  },

  calculateAverageResponseTime(messages: Message[]): number {
    const conversations = this.groupByConversation(messages)
    let totalTime = 0
    let count = 0

    for (const conv of conversations) {
      for (let i = 0; i < conv.length - 1; i++) {
        const current = conv[i]
        const next = conv[i + 1]
        
        if (current.sender_type === 'customer' && next.sender_type === 'ai') {
          const responseTime = new Date(next.created_at).getTime() - new Date(current.created_at).getTime()
          totalTime += responseTime
          count++
        }
      }
    }

    return count > 0 ? Math.round(totalTime / count / 1000) : 0 // En secondes
  }
}
```

## 🧪 Tests

### Tests d'Intégration

```typescript
// tests/whatsapp.test.ts
describe('WhatsApp Integration', () => {
  test('should handle incoming text message', async () => {
    const webhook = {
      object: 'whatsapp_business_account',
      entry: [{
        id: 'test',
        changes: [{
          value: {
            messages: [{
              id: 'msg_123',
              from: '+33123456789',
              type: 'text',
              text: { body: 'Bonjour' }
            }],
            contacts: [{
              wa_id: '+33123456789',
              profile: { name: 'Test User' }
            }]
          },
          field: 'messages'
        }]
      }]
    }

    const response = await handleWhatsAppWebhook(webhook)
    expect(response.status).toBe(200)
    
    // Vérifier que le message a été sauvegardé
    const conversation = await conversationService.findByPhone('+33123456789')
    expect(conversation).toBeDefined()
    expect(conversation.last_message).toBe('Bonjour')
  })

  test('should send product recommendation', async () => {
    const products = [
      { id: '1', name: 'iPhone 15', price: 999 },
      { id: '2', name: 'Samsung Galaxy', price: 799 }
    ]

    const response = await whatsappService.sendProductRecommendation(
      '+33123456789',
      products,
      'Voici nos recommandations'
    )

    expect(response.messages[0].id).toBeDefined()
  })
})
```

---

📱 **WhatsApp Connecté** : Une intégration robuste garantit une expérience client fluide !