# 5. Configuration WhatsApp Business - Guide Complet

## 🎯 Objectif
Configurer l'intégration WhatsApp Business API pour permettre à l'IA de communiquer avec les clients.

## ⏱️ Temps estimé
30-45 minutes

## 📋 Prérequis
- Compte Facebook Business
- Numéro de téléphone dédié pour WhatsApp Business
- Application configurée (Étapes 1-4 terminées)

## 🚀 Vue d'ensemble

WhatsApp Business API permet :
- ✅ Envoi/réception de messages automatisés
- ✅ Intégration avec l'IA pour réponses automatiques
- ✅ Gestion des conversations clients
- ✅ Notifications en temps réel

## 📱 Étape 1: Créer un compte WhatsApp Business

### Option A: WhatsApp Business API (Recommandé)

1. **Aller sur Facebook Developers**
   ```
   https://developers.facebook.com/
   ```

2. **Créer une nouvelle app**
   - Type: Business
   - Nom: WazyBot WhatsApp Integration
   - Email de contact: votre-email@domain.com

3. **Ajouter WhatsApp Business**
   - Dans le dashboard de l'app
   - Cliquer "Add Product"
   - Sélectionner "WhatsApp"

### Option B: WhatsApp Business (Simplifié)

Pour les tests et petites entreprises :

1. **Télécharger WhatsApp Business**
2. **Configurer avec votre numéro professionnel**
3. **Utiliser les webhooks pour l'intégration**

## 🔧 Étape 2: Configuration de l'API

### Récupérer les credentials

1. **Dans Facebook Developers > WhatsApp > Configuration**
2. **Noter ces informations :**
   ```
   App ID: 123456789
   App Secret: abc123def456
   Phone Number ID: 987654321
   WhatsApp Business Account ID: 456789123
   ```

3. **Générer un token d'accès**
   - Durée: Permanent (pour production)
   - Permissions: whatsapp_business_messaging

### Configuration des webhooks

1. **URL du webhook :**
   ```
   https://votre-domaine.com/api/webhooks/whatsapp
   ```

2. **Token de vérification :**
   ```
   votre-token-secret-unique
   ```

3. **Événements à souscrire :**
   - messages
   - message_deliveries
   - message_reads
   - message_reactions

## 🔐 Étape 3: Configuration des variables d'environnement

Ajoutez à votre fichier `.env` :

```env
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your-permanent-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WHATSAPP_APP_ID=your-app-id
WHATSAPP_APP_SECRET=your-app-secret
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-unique-verify-token

# URLs
WHATSAPP_WEBHOOK_URL=https://votre-domaine.com/api/webhooks/whatsapp
```

## 🛠️ Étape 4: Implémentation côté serveur

### Créer l'endpoint webhook

Créez `src/api/webhooks/whatsapp.ts` :

```typescript
import { supabase } from '../../lib/supabase';

export async function handleWhatsAppWebhook(req: Request) {
  const body = await req.json();
  
  // Vérification du webhook
  if (req.method === 'GET') {
    const mode = new URL(req.url).searchParams.get('hub.mode');
    const token = new URL(req.url).searchParams.get('hub.verify_token');
    const challenge = new URL(req.url).searchParams.get('hub.challenge');
    
    if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 });
    }
    return new Response('Forbidden', { status: 403 });
  }
  
  // Traitement des messages entrants
  if (body.entry) {
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field === 'messages') {
          await processIncomingMessage(change.value);
        }
      }
    }
  }
  
  return new Response('OK', { status: 200 });
}

async function processIncomingMessage(messageData: any) {
  const { messages, contacts } = messageData;
  
  if (!messages) return;
  
  for (const message of messages) {
    const customerPhone = message.from;
    const messageContent = message.text?.body || message.type;
    const customerName = contacts?.find(c => c.wa_id === customerPhone)?.profile?.name;
    
    // Sauvegarder la conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .upsert({
        customer_phone: customerPhone,
        customer_name: customerName,
        last_message: messageContent,
        last_message_at: new Date().toISOString(),
        status: 'active'
      })
      .select()
      .single();
    
    // Sauvegarder le message
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_type: 'customer',
        content: messageContent,
        message_type: 'text'
      });
    
    // Déclencher la réponse IA
    await triggerAIResponse(conversation.id, messageContent);
  }
}
```

### Service d'envoi de messages

Créez `src/services/whatsapp.ts` :

```typescript
const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

export class WhatsAppService {
  private accessToken: string;
  private phoneNumberId: string;
  
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN!;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  }
  
  async sendMessage(to: string, message: string) {
    const url = `${WHATSAPP_API_URL}/${this.phoneNumberId}/messages`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      })
    });
    
    return response.json();
  }
  
  async sendProductRecommendation(to: string, products: any[]) {
    // Implémentation pour envoyer des recommandations produits
    const message = this.formatProductMessage(products);
    return this.sendMessage(to, message);
  }
  
  private formatProductMessage(products: any[]): string {
    let message = "Voici mes recommandations pour vous :\n\n";
    
    products.forEach((product, index) => {
      message += `${index + 1}. ${product.name}\n`;
      message += `   Prix: €${product.price}\n`;
      message += `   ${product.description}\n\n`;
    });
    
    message += "Lequel vous intéresse le plus ?";
    return message;
  }
}
```

## 🤖 Étape 5: Intégration avec l'IA

### Service IA pour WhatsApp

Créez `src/services/aiWhatsApp.ts` :

```typescript
import { WhatsAppService } from './whatsapp';
import { productService } from './database';

export class AIWhatsAppService {
  private whatsapp: WhatsAppService;
  
  constructor() {
    this.whatsapp = new WhatsAppService();
  }
  
  async processMessage(conversationId: string, message: string, customerPhone: string) {
    // Analyser l'intention du message
    const intent = await this.analyzeIntent(message);
    
    switch (intent.type) {
      case 'product_inquiry':
        return this.handleProductInquiry(customerPhone, intent.keywords);
      
      case 'order_request':
        return this.handleOrderRequest(customerPhone, intent.products);
      
      case 'general_question':
        return this.handleGeneralQuestion(customerPhone, message);
      
      default:
        return this.sendDefaultResponse(customerPhone);
    }
  }
  
  private async analyzeIntent(message: string) {
    // Logique d'analyse d'intention simple
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('produit') || lowerMessage.includes('acheter')) {
      return {
        type: 'product_inquiry',
        keywords: this.extractKeywords(message)
      };
    }
    
    if (lowerMessage.includes('commander') || lowerMessage.includes('commande')) {
      return {
        type: 'order_request',
        products: this.extractProducts(message)
      };
    }
    
    return { type: 'general_question' };
  }
  
  private async handleProductInquiry(customerPhone: string, keywords: string[]) {
    // Rechercher des produits pertinents
    const products = await this.searchProducts(keywords);
    
    if (products.length > 0) {
      await this.whatsapp.sendProductRecommendation(customerPhone, products);
    } else {
      await this.whatsapp.sendMessage(
        customerPhone,
        "Je n'ai pas trouvé de produits correspondant à votre recherche. Pouvez-vous être plus précis ?"
      );
    }
  }
  
  private async searchProducts(keywords: string[]) {
    // Implémentation de recherche de produits
    // Utiliser la base de données Supabase
    return [];
  }
}
```

## 🧪 Étape 6: Tests

### Test 1: Vérification du webhook

1. **Utiliser ngrok pour exposer votre serveur local :**
   ```bash
   npm install -g ngrok
   ngrok http 5173
   ```

2. **Configurer l'URL webhook dans Facebook :**
   ```
   https://abc123.ngrok.io/api/webhooks/whatsapp
   ```

3. **Tester la vérification :**
   - Facebook enverra une requête GET
   - Votre serveur doit répondre avec le challenge

### Test 2: Envoi de message

```typescript
// Test dans la console
const whatsapp = new WhatsAppService();
await whatsapp.sendMessage('+33123456789', 'Test message from WazyBot!');
```

### Test 3: Réception de message

1. **Envoyer un message WhatsApp** à votre numéro business
2. **Vérifier dans la base de données :**
   - Conversation créée
   - Message enregistré
   - Réponse IA déclenchée

## 🔒 Étape 7: Sécurité et conformité

### Validation des webhooks

```typescript
import crypto from 'crypto';

function validateWebhook(payload: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WHATSAPP_APP_SECRET!)
    .update(payload)
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
}
```

### Gestion des erreurs

```typescript
export async function handleWhatsAppError(error: any, context: string) {
  console.error(`WhatsApp Error in ${context}:`, error);
  
  // Logger l'erreur
  await supabase
    .from('error_logs')
    .insert({
      service: 'whatsapp',
      context,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  
  // Notifier l'équipe si critique
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    await notifyTeam('WhatsApp rate limit exceeded');
  }
}
```

### Conformité RGPD

1. **Consentement explicite** pour l'utilisation des données
2. **Droit à l'effacement** des conversations
3. **Chiffrement** des données sensibles
4. **Logs d'audit** des accès aux données

## 📊 Étape 8: Monitoring

### Métriques à surveiller

1. **Messages entrants/sortants**
2. **Taux de réponse de l'IA**
3. **Temps de réponse**
4. **Erreurs API**
5. **Limites de taux**

### Dashboard de monitoring

Ajoutez ces métriques au dashboard :

```typescript
export async function getWhatsAppMetrics(userId: string) {
  const { data: conversations } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId);
  
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .in('conversation_id', conversations.map(c => c.id));
  
  return {
    totalConversations: conversations.length,
    activeConversations: conversations.filter(c => c.status === 'active').length,
    totalMessages: messages.length,
    aiMessages: messages.filter(m => m.sender_type === 'ai').length,
    responseRate: (messages.filter(m => m.sender_type === 'ai').length / messages.filter(m => m.sender_type === 'customer').length) * 100
  };
}
```

## ✅ Checklist de validation

- [ ] Compte WhatsApp Business créé
- [ ] App Facebook configurée
- [ ] Credentials récupérés
- [ ] Variables d'environnement configurées
- [ ] Webhook endpoint implémenté
- [ ] Service d'envoi de messages créé
- [ ] Intégration IA configurée
- [ ] Tests de base réussis
- [ ] Sécurité implémentée
- [ ] Monitoring configuré
- [ ] Conformité RGPD respectée

## 🚨 Limitations et quotas

### Limites WhatsApp Business API

- **Messages gratuits :** 1000/mois
- **Rate limits :** 80 messages/seconde
- **Types de messages :** Texte, images, documents
- **Fenêtre de conversation :** 24h après le dernier message client

### Coûts

- **Messages template :** €0.005 - €0.09 selon le pays
- **Messages de conversation :** Gratuits dans la fenêtre de 24h
- **Numéro de téléphone :** €0.79/mois

## 🔄 Prochaine étape

Une fois WhatsApp configuré, passez à :
**[6. Configuration de production](./06-PRODUCTION-SETUP.md)**

---

💡 **Astuce :** Commencez avec un numéro de test avant d'utiliser votre numéro principal !