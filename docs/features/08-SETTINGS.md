# ⚙️ Paramètres Système - Documentation Complète

## 📋 Vue d'ensemble

Le système de paramètres de WazyBot permet aux utilisateurs de configurer tous les aspects de leur plateforme : profil, assistant IA, intégrations, notifications, sécurité et facturation. Une interface centralisée pour personnaliser entièrement l'expérience.

## ✨ Fonctionnalités Principales

### 👤 Gestion du Profil
- **Informations personnelles** - Nom, email, téléphone
- **Informations business** - Entreprise, description, secteur
- **Avatar et branding** - Personnalisation visuelle
- **Préférences** - Langue, fuseau horaire, devise

### 🤖 Configuration IA
- **Personnalité** - Nom, ton de voix, style
- **Comportement** - Réponses automatiques, escalades
- **Messages personnalisés** - Accueil, absence, erreurs
- **Paramètres avancés** - Seuils de confiance, contexte

### 🔔 Notifications
- **Canaux** - Email, SMS, push, webhook
- **Types d'événements** - Messages, commandes, alertes
- **Fréquence** - Temps réel, résumés, rapports
- **Personnalisation** - Templates et formats

### 🔒 Sécurité
- **Authentification** - Mots de passe, 2FA
- **Sessions** - Gestion des connexions actives
- **API Keys** - Génération et gestion des clés
- **Audit** - Logs d'activité et accès

## 🏗️ Architecture

### Structure des Paramètres

```typescript
interface UserSettings {
  // Profil utilisateur
  profile: {
    personal: PersonalInfo
    business: BusinessInfo
    preferences: UserPreferences
  }
  
  // Configuration IA
  ai: {
    personality: AIPersonality
    behavior: AIBehavior
    messages: CustomMessages
    advanced: AdvancedAISettings
  }
  
  // Notifications
  notifications: {
    channels: NotificationChannels
    events: EventSettings[]
    templates: NotificationTemplates
  }
  
  // Sécurité
  security: {
    authentication: AuthSettings
    sessions: SessionSettings
    apiKeys: APIKeySettings
    audit: AuditSettings
  }
  
  // Intégrations
  integrations: {
    whatsapp: WhatsAppSettings
    payment: PaymentSettings
    analytics: AnalyticsSettings
    webhooks: WebhookSettings
  }
}
```

### Stockage des Paramètres

```sql
-- Table pour les paramètres utilisateur
CREATE TABLE user_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  category text NOT NULL, -- 'profile', 'ai', 'notifications', etc.
  settings jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour les performances
CREATE INDEX idx_user_settings_user_category ON user_settings(user_id, category);
```

## 💻 Implémentation

### Service de Gestion des Paramètres

```typescript
// src/services/settingsService.ts
export class SettingsService {
  async getUserSettings(userId: string): Promise<UserSettings> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('category, settings')
      .eq('user_id', userId)

    if (error) throw error

    // Organiser les paramètres par catégorie
    const settingsByCategory = data.reduce((acc, item) => {
      acc[item.category] = item.settings
      return acc
    }, {})

    return {
      profile: settingsByCategory.profile || this.getDefaultProfileSettings(),
      ai: settingsByCategory.ai || this.getDefaultAISettings(),
      notifications: settingsByCategory.notifications || this.getDefaultNotificationSettings(),
      security: settingsByCategory.security || this.getDefaultSecuritySettings(),
      integrations: settingsByCategory.integrations || this.getDefaultIntegrationSettings()
    }
  }

  async updateSettings(
    userId: string, 
    category: string, 
    settings: any
  ): Promise<void> {
    // Valider les paramètres
    const validatedSettings = await this.validateSettings(category, settings)

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        category,
        settings: validatedSettings,
        updated_at: new Date().toISOString()
      })

    if (error) throw error

    // Déclencher les actions post-mise à jour
    await this.handleSettingsUpdate(userId, category, validatedSettings)
  }

  async validateSettings(category: string, settings: any): Promise<any> {
    const validators = {
      profile: this.validateProfileSettings,
      ai: this.validateAISettings,
      notifications: this.validateNotificationSettings,
      security: this.validateSecuritySettings,
      integrations: this.validateIntegrationSettings
    }

    const validator = validators[category as keyof typeof validators]
    if (!validator) {
      throw new Error(`Unknown settings category: ${category}`)
    }

    return validator(settings)
  }

  private validateAISettings(settings: any): any {
    const schema = {
      personality: {
        name: { type: 'string', minLength: 1, maxLength: 50 },
        tone: { type: 'string', enum: ['friendly', 'professional', 'casual', 'formal'] },
        language: { type: 'string', enum: ['fr', 'en', 'es', 'pt'] }
      },
      behavior: {
        autoRespond: { type: 'boolean' },
        confidenceThreshold: { type: 'number', min: 0, max: 1 },
        escalationThreshold: { type: 'number', min: 0, max: 1 }
      },
      messages: {
        welcome: { type: 'string', maxLength: 500 },
        away: { type: 'string', maxLength: 500 },
        error: { type: 'string', maxLength: 500 }
      }
    }

    return this.validateAgainstSchema(settings, schema)
  }

  private async handleSettingsUpdate(
    userId: string, 
    category: string, 
    settings: any
  ): Promise<void> {
    switch (category) {
      case 'ai':
        await this.syncAISettings(userId, settings)
        break
      case 'notifications':
        await this.updateNotificationSubscriptions(userId, settings)
        break
      case 'integrations':
        await this.updateIntegrations(userId, settings)
        break
    }
  }

  private async syncAISettings(userId: string, aiSettings: any): Promise<void> {
    // Mettre à jour la configuration IA
    await supabase
      .from('ai_settings')
      .upsert({
        user_id: userId,
        assistant_name: aiSettings.personality?.name,
        tone_of_voice: aiSettings.personality?.tone,
        language: aiSettings.personality?.language,
        auto_respond: aiSettings.behavior?.autoRespond,
        welcome_message: aiSettings.messages?.welcome,
        away_message: aiSettings.messages?.away,
        updated_at: new Date().toISOString()
      })
  }

  getDefaultAISettings(): any {
    return {
      personality: {
        name: 'Assistant IA',
        tone: 'friendly',
        language: 'fr'
      },
      behavior: {
        autoRespond: true,
        confidenceThreshold: 0.7,
        escalationThreshold: 0.3,
        productRecommendations: true,
        orderProcessing: true
      },
      messages: {
        welcome: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
        away: 'Merci pour votre message ! Nous vous répondrons bientôt.',
        error: 'Désolé, je n\'ai pas compris. Pouvez-vous reformuler ?'
      },
      advanced: {
        contextWindow: 10,
        responseDelay: 1000,
        learningEnabled: true
      }
    }
  }
}
```

### Hook useSettings

```typescript
// src/hooks/useSettings.ts
export function useSettings() {
  const { user } = useAuthContext()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadSettings()
    }
  }, [user])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await settingsService.getUserSettings(user!.id)
      setSettings(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (category: string, newSettings: any) => {
    try {
      await settingsService.updateSettings(user!.id, category, newSettings)
      
      // Mettre à jour l'état local
      setSettings(prev => prev ? {
        ...prev,
        [category]: newSettings
      } : null)
      
      toast.success('Paramètres mis à jour avec succès')
    } catch (err: any) {
      setError(err.message)
      toast.error('Erreur lors de la mise à jour')
      throw err
    }
  }

  const resetSettings = async (category: string) => {
    try {
      const defaultSettings = settingsService.getDefaultSettings(category)
      await updateSettings(category, defaultSettings)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return {
    settings,
    loading,
    error,
    updateSettings,
    resetSettings,
    refreshSettings: loadSettings
  }
}
```

## 🎨 Interface Utilisateur

### Page de Paramètres

```typescript
// src/pages/SettingsPage.tsx
const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const { settings, updateSettings, loading } = useSettings()

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'ai', label: 'Assistant IA', icon: Bot },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Intégrations', icon: Zap },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'billing', label: 'Facturation', icon: CreditCard }
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <SettingsPageSkeleton />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Paramètres</h1>
          <p className="text-gray-600 mt-1">Configurez votre compte et votre assistant IA</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100">
            {activeTab === 'profile' && (
              <ProfileSettings 
                settings={settings?.profile} 
                onUpdate={(newSettings) => updateSettings('profile', newSettings)}
              />
            )}
            
            {activeTab === 'ai' && (
              <AISettings 
                settings={settings?.ai} 
                onUpdate={(newSettings) => updateSettings('ai', newSettings)}
              />
            )}
            
            {activeTab === 'notifications' && (
              <NotificationSettings 
                settings={settings?.notifications} 
                onUpdate={(newSettings) => updateSettings('notifications', newSettings)}
              />
            )}
            
            {activeTab === 'integrations' && (
              <IntegrationSettings 
                settings={settings?.integrations} 
                onUpdate={(newSettings) => updateSettings('integrations', newSettings)}
              />
            )}
            
            {activeTab === 'security' && (
              <SecuritySettings 
                settings={settings?.security} 
                onUpdate={(newSettings) => updateSettings('security', newSettings)}
              />
            )}
            
            {activeTab === 'billing' && (
              <BillingSettings />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
```

### Composant Paramètres IA

```typescript
// src/components/settings/AISettings.tsx
const AISettings: React.FC<AISettingsProps> = ({ settings, onUpdate }) => {
  const [formData, setFormData] = useState(settings || {})
  const [testMode, setTestMode] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onUpdate(formData)
    } catch (error) {
      console.error('Error updating AI settings:', error)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Configuration de l'Assistant IA</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personnalité */}
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Personnalité de l'Assistant</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'assistant
              </label>
              <input
                type="text"
                value={formData.personality?.name || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  personality: { ...formData.personality, name: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Assistant IA"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ton de voix
              </label>
              <select
                value={formData.personality?.tone || 'friendly'}
                onChange={(e) => setFormData({
                  ...formData,
                  personality: { ...formData.personality, tone: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                <option value="friendly">Amical et Professionnel</option>
                <option value="casual">Décontracté et Amical</option>
                <option value="formal">Formel et Professionnel</option>
                <option value="enthusiastic">Enthousiaste et Énergique</option>
              </select>
            </div>
          </div>
        </div>

        {/* Comportement */}
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Comportement</h3>
          <div className="space-y-4">
            <ToggleSwitch
              label="Réponse automatique"
              description="L'IA répond automatiquement aux messages clients"
              checked={formData.behavior?.autoRespond ?? true}
              onChange={(checked) => setFormData({
                ...formData,
                behavior: { ...formData.behavior, autoRespond: checked }
              })}
            />
            
            <ToggleSwitch
              label="Recommandations produits"
              description="L'IA peut suggérer des produits pertinents"
              checked={formData.behavior?.productRecommendations ?? true}
              onChange={(checked) => setFormData({
                ...formData,
                behavior: { ...formData.behavior, productRecommendations: checked }
              })}
            />
            
            <ToggleSwitch
              label="Traitement des commandes"
              description="L'IA peut aider à passer des commandes"
              checked={formData.behavior?.orderProcessing ?? true}
              onChange={(checked) => setFormData({
                ...formData,
                behavior: { ...formData.behavior, orderProcessing: checked }
              })}
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
                value={formData.messages?.welcome || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  messages: { ...formData.messages, welcome: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                placeholder="Bonjour ! Comment puis-je vous aider aujourd'hui ?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message d'absence
              </label>
              <textarea
                rows={3}
                value={formData.messages?.away || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  messages: { ...formData.messages, away: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                placeholder="Merci pour votre message ! Nous vous répondrons bientôt."
              />
            </div>
          </div>
        </div>

        {/* Paramètres avancés */}
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Paramètres Avancés</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seuil de confiance
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.behavior?.confidenceThreshold || 0.7}
                  onChange={(e) => setFormData({
                    ...formData,
                    behavior: { ...formData.behavior, confidenceThreshold: parseFloat(e.target.value) }
                  })}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-600 w-12">
                  {Math.round((formData.behavior?.confidenceThreshold || 0.7) * 100)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Niveau de certitude minimum pour les réponses automatiques
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Délai de réponse (ms)
              </label>
              <input
                type="number"
                min="0"
                max="5000"
                step="100"
                value={formData.advanced?.responseDelay || 1000}
                onChange={(e) => setFormData({
                  ...formData,
                  advanced: { ...formData.advanced, responseDelay: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Délai avant envoi de la réponse (pour paraître plus naturel)
              </p>
            </div>
          </div>
        </div>

        {/* Test de l'IA */}
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Test de l'Assistant</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Testez votre assistant avec différents messages
              </p>
              <button
                type="button"
                onClick={() => setTestMode(!testMode)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                {testMode ? 'Fermer le test' : 'Tester l\'IA'}
              </button>
            </div>
            
            {testMode && (
              <AITestChat settings={formData} />
            )}
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setFormData(settingsService.getDefaultAISettings())}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Réinitialiser
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Sauvegarder les paramètres
          </button>
        </div>
      </form>
    </div>
  )
}
```

## 🔧 Fonctionnalités Avancées

### Gestion des API Keys

```typescript
// src/services/apiKeyService.ts
export class APIKeyService {
  async generateAPIKey(userId: string, name: string, permissions: string[]): Promise<APIKey> {
    // Générer une clé sécurisée
    const key = this.generateSecureKey()
    const hashedKey = await this.hashKey(key)

    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        name,
        key_hash: hashedKey,
        permissions,
        created_at: new Date().toISOString(),
        last_used_at: null,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error

    return {
      ...data,
      key // Retourner la clé en clair une seule fois
    }
  }

  async revokeAPIKey(keyId: string): Promise<void> {
    const { error } = await supabase
      .from('api_keys')
      .update({ 
        is_active: false,
        revoked_at: new Date().toISOString()
      })
      .eq('id', keyId)

    if (error) throw error
  }

  async validateAPIKey(key: string): Promise<APIKey | null> {
    const hashedKey = await this.hashKey(key)
    
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key_hash', hashedKey)
      .eq('is_active', true)
      .single()

    if (error || !data) return null

    // Mettre à jour la dernière utilisation
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id)

    return data
  }

  private generateSecureKey(): string {
    const prefix = 'wz_'
    const randomBytes = crypto.getRandomValues(new Uint8Array(32))
    const key = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('')
    return prefix + key
  }

  private async hashKey(key: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(key)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
}
```

### Système de Notifications

```typescript
// src/services/notificationService.ts
export class NotificationService {
  async sendNotification(
    userId: string, 
    type: NotificationType, 
    data: NotificationData
  ): Promise<void> {
    // Récupérer les préférences de notification
    const settings = await this.getNotificationSettings(userId)
    
    // Vérifier si l'utilisateur veut recevoir ce type de notification
    if (!this.shouldSendNotification(settings, type)) {
      return
    }

    // Envoyer via les canaux configurés
    const channels = settings.channels[type] || []
    
    await Promise.all(channels.map(channel => 
      this.sendViaChannel(channel, data)
    ))
  }

  private async sendViaChannel(
    channel: NotificationChannel, 
    data: NotificationData
  ): Promise<void> {
    switch (channel.type) {
      case 'email':
        await this.sendEmail(channel.address, data)
        break
      case 'sms':
        await this.sendSMS(channel.phone, data)
        break
      case 'push':
        await this.sendPushNotification(channel.token, data)
        break
      case 'webhook':
        await this.sendWebhook(channel.url, data)
        break
    }
  }

  async scheduleNotification(
    userId: string,
    type: NotificationType,
    data: NotificationData,
    scheduledFor: Date
  ): Promise<void> {
    await supabase
      .from('scheduled_notifications')
      .insert({
        user_id: userId,
        type,
        data,
        scheduled_for: scheduledFor.toISOString(),
        status: 'pending'
      })
  }
}
```

### Audit et Logs

```typescript
// src/services/auditService.ts
export class AuditService {
  async logActivity(
    userId: string,
    action: string,
    resource: string,
    details?: any
  ): Promise<void> {
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        resource,
        details,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
  }

  async getActivityLogs(
    userId: string,
    filters?: AuditFilters
  ): Promise<AuditLog[]> {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })

    if (filters?.action) {
      query = query.eq('action', filters.action)
    }

    if (filters?.dateRange) {
      query = query
        .gte('timestamp', filters.dateRange.start)
        .lte('timestamp', filters.dateRange.end)
    }

    const { data, error } = await query.limit(100)
    if (error) throw error
    return data || []
  }

  async exportAuditLogs(userId: string, format: 'csv' | 'json'): Promise<string> {
    const logs = await this.getActivityLogs(userId)
    
    if (format === 'csv') {
      return this.convertToCSV(logs)
    } else {
      return JSON.stringify(logs, null, 2)
    }
  }
}
```

## 📊 Monitoring des Paramètres

### Analytics des Configurations

```typescript
// src/services/settingsAnalytics.ts
export const settingsAnalytics = {
  async getUsageStats(userId: string): Promise<SettingsUsageStats> {
    const settings = await settingsService.getUserSettings(userId)
    
    return {
      completionRate: this.calculateCompletionRate(settings),
      lastUpdated: await this.getLastUpdateDate(userId),
      featuresEnabled: this.countEnabledFeatures(settings),
      securityScore: this.calculateSecurityScore(settings),
      optimizationSuggestions: this.generateOptimizationSuggestions(settings)
    }
  },

  calculateCompletionRate(settings: UserSettings): number {
    const totalFields = this.getTotalConfigurableFields()
    const completedFields = this.getCompletedFields(settings)
    return Math.round((completedFields / totalFields) * 100)
  },

  generateOptimizationSuggestions(settings: UserSettings): Suggestion[] {
    const suggestions: Suggestion[] = []

    // Suggestions IA
    if (settings.ai.behavior.confidenceThreshold < 0.7) {
      suggestions.push({
        type: 'warning',
        category: 'ai',
        title: 'Seuil de confiance faible',
        description: 'Augmentez le seuil de confiance pour améliorer la qualité des réponses',
        action: 'Aller aux paramètres IA'
      })
    }

    // Suggestions sécurité
    if (!settings.security.authentication.twoFactorEnabled) {
      suggestions.push({
        type: 'security',
        category: 'security',
        title: 'Authentification à deux facteurs',
        description: 'Activez la 2FA pour sécuriser votre compte',
        action: 'Configurer la 2FA'
      })
    }

    return suggestions
  }
}
```

## 🧪 Tests

### Tests des Paramètres

```typescript
// tests/settings.test.ts
describe('Settings Service', () => {
  test('should update AI settings correctly', async () => {
    const newSettings = {
      personality: {
        name: 'Assistant Test',
        tone: 'professional'
      },
      behavior: {
        autoRespond: false,
        confidenceThreshold: 0.8
      }
    }

    await settingsService.updateSettings('test-user', 'ai', newSettings)
    
    const updatedSettings = await settingsService.getUserSettings('test-user')
    expect(updatedSettings.ai.personality.name).toBe('Assistant Test')
    expect(updatedSettings.ai.behavior.autoRespond).toBe(false)
  })

  test('should validate settings before saving', async () => {
    const invalidSettings = {
      personality: {
        name: '', // Nom vide invalide
        tone: 'invalid-tone'
      }
    }

    await expect(
      settingsService.updateSettings('test-user', 'ai', invalidSettings)
    ).rejects.toThrow('Invalid settings')
  })

  test('should generate API key with correct permissions', async () => {
    const apiKey = await apiKeyService.generateAPIKey(
      'test-user',
      'Test Key',
      ['read:products', 'write:orders']
    )

    expect(apiKey.key).toMatch(/^wz_[a-f0-9]{64}$/)
    expect(apiKey.permissions).toEqual(['read:products', 'write:orders'])
    expect(apiKey.is_active).toBe(true)
  })
})
```

---

⚙️ **Paramètres Complets** : Une configuration flexible pour adapter WazyBot à vos besoins !