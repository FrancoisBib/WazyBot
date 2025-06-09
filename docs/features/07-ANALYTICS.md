# 📊 Analytics Avancées - Documentation Complète

## 📋 Vue d'ensemble

Le système d'analytics de WazyBot fournit des insights détaillés sur les performances de votre assistant IA, les comportements clients, et l'efficacité de vos ventes. Il transforme vos données en informations exploitables pour optimiser votre business.

## ✨ Fonctionnalités Principales

### 📈 Métriques Business
- **Revenus et ventes** - Suivi des performances financières
- **Taux de conversion** - De la conversation à la vente
- **Panier moyen** - Valeur moyenne des commandes
- **Rétention client** - Fidélisation et récurrence

### 🤖 Performance IA
- **Taux de réponse** - Pourcentage de messages traités par l'IA
- **Précision des réponses** - Score de confiance moyen
- **Escalades** - Transferts vers agents humains
- **Temps de réponse** - Vitesse de traitement

### 👥 Comportement Client
- **Parcours client** - Analyse des interactions
- **Sujets populaires** - Demandes les plus fréquentes
- **Satisfaction** - Scores et feedback
- **Segmentation** - Profils et préférences

## 🏗️ Architecture

### Structure des Données Analytics

```typescript
interface AnalyticsData {
  // Métriques business
  revenue: {
    total: number
    period: number
    growth: number
    breakdown: RevenueBreakdown[]
  }
  
  // Performance IA
  ai: {
    responseRate: number
    accuracy: number
    averageConfidence: number
    escalationRate: number
    responseTime: number
  }
  
  // Engagement client
  customer: {
    totalCustomers: number
    activeCustomers: number
    newCustomers: number
    retentionRate: number
    satisfactionScore: number
  }
  
  // Produits
  products: {
    topSelling: Product[]
    recommendations: number
    conversionByProduct: ProductConversion[]
  }
}
```

### Pipeline de Données

```
Événements Raw
    ↓
Collecte en Temps Réel
    ↓
Traitement et Agrégation
    ↓
Stockage Analytics
    ↓
Visualisation Dashboard
```

## 💻 Implémentation

### Service Analytics Principal

```typescript
// src/services/analyticsService.ts
export class AnalyticsService {
  async getDashboardMetrics(
    userId: string, 
    timeRange: TimeRange
  ): Promise<DashboardMetrics> {
    const [
      revenueData,
      aiMetrics,
      customerMetrics,
      productMetrics,
      conversationMetrics
    ] = await Promise.all([
      this.getRevenueMetrics(userId, timeRange),
      this.getAIMetrics(userId, timeRange),
      this.getCustomerMetrics(userId, timeRange),
      this.getProductMetrics(userId, timeRange),
      this.getConversationMetrics(userId, timeRange)
    ])

    return {
      revenue: revenueData,
      ai: aiMetrics,
      customers: customerMetrics,
      products: productMetrics,
      conversations: conversationMetrics,
      generatedAt: new Date().toISOString()
    }
  }

  async getRevenueMetrics(userId: string, timeRange: TimeRange): Promise<RevenueMetrics> {
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', timeRange.start)
      .lte('created_at', timeRange.end)
      .in('status', ['confirmed', 'processing', 'shipped', 'delivered'])

    const currentRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
    
    // Calculer la période précédente pour la comparaison
    const previousTimeRange = this.getPreviousTimeRange(timeRange)
    const { data: previousOrders } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('user_id', userId)
      .gte('created_at', previousTimeRange.start)
      .lte('created_at', previousTimeRange.end)
      .in('status', ['confirmed', 'processing', 'shipped', 'delivered'])

    const previousRevenue = previousOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
    const growth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

    return {
      total: currentRevenue,
      growth,
      orderCount: orders.length,
      averageOrderValue: orders.length > 0 ? currentRevenue / orders.length : 0,
      breakdown: this.calculateRevenueBreakdown(orders),
      trend: this.calculateRevenueTrend(orders, timeRange)
    }
  }

  async getAIMetrics(userId: string, timeRange: TimeRange): Promise<AIMetrics> {
    const { data: messages } = await supabase
      .from('messages')
      .select(`
        *,
        conversation:conversations!inner(user_id)
      `)
      .eq('conversation.user_id', userId)
      .gte('created_at', timeRange.start)
      .lte('created_at', timeRange.end)

    const customerMessages = messages.filter(m => m.sender_type === 'customer')
    const aiMessages = messages.filter(m => m.sender_type === 'ai')
    const escalatedMessages = messages.filter(m => m.metadata?.escalated)

    const responseRate = customerMessages.length > 0 
      ? (aiMessages.length / customerMessages.length) * 100 
      : 0

    const confidenceScores = aiMessages
      .map(m => m.metadata?.confidence)
      .filter(score => score !== undefined)

    const averageConfidence = confidenceScores.length > 0
      ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length
      : 0

    const escalationRate = customerMessages.length > 0
      ? (escalatedMessages.length / customerMessages.length) * 100
      : 0

    return {
      responseRate,
      accuracy: averageConfidence * 100,
      averageConfidence,
      escalationRate,
      responseTime: await this.calculateAverageResponseTime(messages),
      totalInteractions: customerMessages.length,
      successfulResponses: aiMessages.filter(m => (m.metadata?.confidence || 0) > 0.7).length
    }
  }

  async getCustomerMetrics(userId: string, timeRange: TimeRange): Promise<CustomerMetrics> {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', timeRange.start)
      .lte('created_at', timeRange.end)

    const uniqueCustomers = new Set(conversations.map(c => c.customer_phone))
    const totalCustomers = uniqueCustomers.size

    // Calculer les nouveaux clients
    const { data: allConversations } = await supabase
      .from('conversations')
      .select('customer_phone, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    const firstContactDates = new Map()
    allConversations?.forEach(conv => {
      if (!firstContactDates.has(conv.customer_phone)) {
        firstContactDates.set(conv.customer_phone, conv.created_at)
      }
    })

    const newCustomers = Array.from(uniqueCustomers).filter(phone => {
      const firstContact = firstContactDates.get(phone)
      return firstContact >= timeRange.start && firstContact <= timeRange.end
    }).length

    // Calculer la satisfaction
    const satisfactionScore = await this.calculateSatisfactionScore(userId, timeRange)

    return {
      totalCustomers,
      newCustomers,
      activeCustomers: conversations.filter(c => c.status === 'active').length,
      retentionRate: await this.calculateRetentionRate(userId, timeRange),
      satisfactionScore,
      averageConversationsPerCustomer: totalCustomers > 0 ? conversations.length / totalCustomers : 0
    }
  }

  async getProductMetrics(userId: string, timeRange: TimeRange): Promise<ProductMetrics> {
    const { data: orders } = await supabase
      .from('orders')
      .select('items')
      .eq('user_id', userId)
      .gte('created_at', timeRange.start)
      .lte('created_at', timeRange.end)

    const productSales = new Map<string, number>()
    const productRevenue = new Map<string, number>()

    orders.forEach(order => {
      order.items.forEach((item: any) => {
        const productId = item.product_id
        productSales.set(productId, (productSales.get(productId) || 0) + item.quantity)
        productRevenue.set(productId, (productRevenue.get(productId) || 0) + (item.price * item.quantity))
      })
    })

    // Récupérer les informations des produits
    const productIds = Array.from(productSales.keys())
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)

    const topSelling = products
      ?.map(product => ({
        ...product,
        sales: productSales.get(product.id) || 0,
        revenue: productRevenue.get(product.id) || 0
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10) || []

    return {
      topSelling,
      totalProductsSold: Array.from(productSales.values()).reduce((sum, qty) => sum + qty, 0),
      averageProductsPerOrder: orders.length > 0 
        ? Array.from(productSales.values()).reduce((sum, qty) => sum + qty, 0) / orders.length 
        : 0,
      conversionByProduct: await this.calculateProductConversions(userId, timeRange)
    }
  }

  private async calculateAverageResponseTime(messages: any[]): Promise<number> {
    const responseTimes: number[] = []
    
    for (let i = 0; i < messages.length - 1; i++) {
      const current = messages[i]
      const next = messages[i + 1]
      
      if (current.sender_type === 'customer' && next.sender_type === 'ai') {
        const responseTime = new Date(next.created_at).getTime() - new Date(current.created_at).getTime()
        responseTimes.push(responseTime)
      }
    }

    return responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length / 1000)
      : 0
  }

  private calculateRevenueBreakdown(orders: any[]): RevenueBreakdown[] {
    const breakdown = new Map<string, number>()
    
    orders.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0]
      breakdown.set(date, (breakdown.get(date) || 0) + order.total_amount)
    })

    return Array.from(breakdown.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }
}
```

### Hook useAnalytics

```typescript
// src/hooks/useAnalytics.ts
export function useAnalytics(timeRange: TimeRange = { start: '7d', end: 'now' }) {
  const { user } = useAuthContext()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadMetrics()
    }
  }, [user, timeRange])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      const data = await analyticsService.getDashboardMetrics(user!.id, timeRange)
      setMetrics(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const exportData = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const exportData = await analyticsService.exportMetrics(user!.id, timeRange, format)
      
      // Télécharger le fichier
      const blob = new Blob([exportData], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return {
    metrics,
    loading,
    error,
    refreshMetrics: loadMetrics,
    exportData
  }
}
```

## 🎨 Interface Utilisateur

### Page Analytics

```typescript
// src/pages/AnalyticsPage.tsx
const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState<string>('overview')
  
  const { metrics, loading, exportData } = useAnalytics({
    start: getTimeRangeStart(timeRange),
    end: new Date().toISOString()
  })

  if (loading) {
    return (
      <DashboardLayout>
        <AnalyticsPageSkeleton />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header avec contrôles */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Analysez les performances de votre assistant IA</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <TimeRangeSelector
              value={timeRange}
              onChange={setTimeRange}
            />
            <ExportButton onExport={exportData} />
          </div>
        </div>

        {/* Métriques principales */}
        <MetricsOverview metrics={metrics} />

        {/* Graphiques détaillés */}
        <div className="grid lg:grid-cols-2 gap-6">
          <RevenueChart data={metrics?.revenue} />
          <AIPerformanceChart data={metrics?.ai} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <CustomerInsights data={metrics?.customers} />
          <ProductPerformance data={metrics?.products} />
          <ConversationAnalytics data={metrics?.conversations} />
        </div>

        {/* Insights et recommandations */}
        <InsightsPanel metrics={metrics} />
      </div>
    </DashboardLayout>
  )
}
```

### Composant Métriques Overview

```typescript
// src/components/MetricsOverview.tsx
const MetricsOverview: React.FC<{ metrics: DashboardMetrics }> = ({ metrics }) => {
  const mainMetrics = [
    {
      title: 'Revenus Totaux',
      value: formatCurrency(metrics.revenue.total),
      change: `${metrics.revenue.growth > 0 ? '+' : ''}${metrics.revenue.growth.toFixed(1)}%`,
      changeType: metrics.revenue.growth >= 0 ? 'positive' : 'negative',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Taux de Réponse IA',
      value: `${metrics.ai.responseRate.toFixed(1)}%`,
      change: '+2.3%',
      changeType: 'positive',
      icon: Bot,
      color: 'purple'
    },
    {
      title: 'Clients Actifs',
      value: metrics.customers.totalCustomers.toString(),
      change: `+${metrics.customers.newCustomers}`,
      changeType: 'positive',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Satisfaction Client',
      value: `${metrics.customers.satisfactionScore.toFixed(1)}/5`,
      change: '+0.2',
      changeType: 'positive',
      icon: Star,
      color: 'yellow'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {mainMetrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          changeType={metric.changeType}
          icon={metric.icon}
          color={metric.color}
        />
      ))}
    </div>
  )
}
```

### Graphique de Revenus

```typescript
// src/components/RevenueChart.tsx
const RevenueChart: React.FC<{ data: RevenueMetrics }> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Évolution des Revenus</h2>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Revenus</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Commandes</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data.breakdown}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { 
              month: 'short', 
              day: 'numeric' 
            })}
          />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR')}
            formatter={(value, name) => [
              name === 'revenue' ? formatCurrency(value) : value,
              name === 'revenue' ? 'Revenus' : 'Commandes'
            ]}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#10B981" 
            strokeWidth={3}
            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(data.total)}</p>
          <p className="text-sm text-gray-600">Revenus Totaux</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">{data.orderCount}</p>
          <p className="text-sm text-gray-600">Commandes</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(data.averageOrderValue)}</p>
          <p className="text-sm text-gray-600">Panier Moyen</p>
        </div>
      </div>
    </div>
  )
}
```

## 🔧 Fonctionnalités Avancées

### Rapports Automatisés

```typescript
// src/services/reportingService.ts
export class ReportingService {
  async generateWeeklyReport(userId: string): Promise<WeeklyReport> {
    const timeRange = {
      start: getWeekStart(),
      end: getWeekEnd()
    }

    const metrics = await analyticsService.getDashboardMetrics(userId, timeRange)
    const insights = await this.generateInsights(metrics)
    const recommendations = await this.generateRecommendations(metrics)

    return {
      period: timeRange,
      metrics,
      insights,
      recommendations,
      generatedAt: new Date().toISOString()
    }
  }

  async generateInsights(metrics: DashboardMetrics): Promise<Insight[]> {
    const insights: Insight[] = []

    // Insight sur la croissance des revenus
    if (metrics.revenue.growth > 10) {
      insights.push({
        type: 'positive',
        title: 'Forte croissance des revenus',
        description: `Vos revenus ont augmenté de ${metrics.revenue.growth.toFixed(1)}% cette période.`,
        impact: 'high',
        category: 'revenue'
      })
    }

    // Insight sur la performance IA
    if (metrics.ai.responseRate > 90) {
      insights.push({
        type: 'positive',
        title: 'Excellente performance IA',
        description: `Votre IA traite ${metrics.ai.responseRate.toFixed(1)}% des conversations automatiquement.`,
        impact: 'medium',
        category: 'ai'
      })
    }

    // Insight sur la satisfaction client
    if (metrics.customers.satisfactionScore < 4.0) {
      insights.push({
        type: 'warning',
        title: 'Satisfaction client à améliorer',
        description: `Le score de satisfaction (${metrics.customers.satisfactionScore.toFixed(1)}/5) peut être amélioré.`,
        impact: 'high',
        category: 'customer'
      })
    }

    return insights
  }

  async scheduleReport(userId: string, frequency: 'daily' | 'weekly' | 'monthly') {
    // Programmer l'envoi automatique de rapports
    await supabase
      .from('scheduled_reports')
      .upsert({
        user_id: userId,
        frequency,
        next_run: this.calculateNextRun(frequency),
        is_active: true
      })
  }
}
```

### Comparaisons et Benchmarks

```typescript
// src/services/benchmarkService.ts
export class BenchmarkService {
  async getBenchmarks(userId: string, industry: string): Promise<BenchmarkData> {
    // Récupérer les métriques de l'utilisateur
    const userMetrics = await analyticsService.getDashboardMetrics(userId, {
      start: '30d',
      end: 'now'
    })

    // Récupérer les benchmarks de l'industrie (anonymisés)
    const industryBenchmarks = await this.getIndustryBenchmarks(industry)

    return {
      user: userMetrics,
      industry: industryBenchmarks,
      comparisons: this.calculateComparisons(userMetrics, industryBenchmarks),
      percentile: this.calculatePercentile(userMetrics, industryBenchmarks)
    }
  }

  private calculateComparisons(
    userMetrics: DashboardMetrics, 
    industryBenchmarks: IndustryBenchmarks
  ): Comparison[] {
    return [
      {
        metric: 'AI Response Rate',
        userValue: userMetrics.ai.responseRate,
        industryAverage: industryBenchmarks.aiResponseRate,
        performance: this.getPerformanceLevel(
          userMetrics.ai.responseRate, 
          industryBenchmarks.aiResponseRate
        )
      },
      {
        metric: 'Customer Satisfaction',
        userValue: userMetrics.customers.satisfactionScore,
        industryAverage: industryBenchmarks.satisfactionScore,
        performance: this.getPerformanceLevel(
          userMetrics.customers.satisfactionScore, 
          industryBenchmarks.satisfactionScore
        )
      },
      {
        metric: 'Conversion Rate',
        userValue: userMetrics.revenue.conversionRate,
        industryAverage: industryBenchmarks.conversionRate,
        performance: this.getPerformanceLevel(
          userMetrics.revenue.conversionRate, 
          industryBenchmarks.conversionRate
        )
      }
    ]
  }
}
```

### Prédictions et Forecasting

```typescript
// src/services/forecastingService.ts
export class ForecastingService {
  async generateRevenueForecast(
    userId: string, 
    periods: number = 12
  ): Promise<RevenueForecast> {
    // Récupérer l'historique des revenus
    const historicalData = await this.getHistoricalRevenue(userId, '12m')
    
    // Appliquer un modèle de prédiction simple (moyenne mobile + tendance)
    const forecast = this.calculateLinearTrend(historicalData, periods)
    
    // Ajouter des intervalles de confiance
    const confidence = this.calculateConfidenceIntervals(forecast, historicalData)
    
    return {
      historical: historicalData,
      forecast,
      confidence,
      accuracy: this.calculateAccuracy(historicalData),
      factors: this.identifyGrowthFactors(historicalData)
    }
  }

  private calculateLinearTrend(data: RevenuePoint[], periods: number): RevenuePoint[] {
    // Régression linéaire simple
    const n = data.length
    const sumX = data.reduce((sum, point, index) => sum + index, 0)
    const sumY = data.reduce((sum, point) => sum + point.revenue, 0)
    const sumXY = data.reduce((sum, point, index) => sum + (index * point.revenue), 0)
    const sumXX = data.reduce((sum, point, index) => sum + (index * index), 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Générer les prédictions
    const forecast: RevenuePoint[] = []
    for (let i = 0; i < periods; i++) {
      const x = n + i
      const predictedRevenue = slope * x + intercept
      forecast.push({
        date: this.addMonths(new Date(), i + 1).toISOString(),
        revenue: Math.max(0, predictedRevenue) // Éviter les valeurs négatives
      })
    }

    return forecast
  }
}
```

## 📊 Visualisations Avancées

### Heatmap des Interactions

```typescript
// src/components/InteractionHeatmap.tsx
const InteractionHeatmap: React.FC = () => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])

  useEffect(() => {
    loadHeatmapData()
  }, [])

  const loadHeatmapData = async () => {
    const data = await analyticsService.getInteractionHeatmap(user!.id)
    setHeatmapData(data)
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Heatmap des Interactions</h2>
      
      <div className="grid grid-cols-24 gap-1">
        {Array.from({ length: 7 }, (_, day) => (
          Array.from({ length: 24 }, (_, hour) => {
            const intensity = getInteractionIntensity(day, hour, heatmapData)
            return (
              <div
                key={`${day}-${hour}`}
                className={`w-4 h-4 rounded-sm ${getHeatmapColor(intensity)}`}
                title={`${getDayName(day)} ${hour}h: ${intensity} interactions`}
              />
            )
          })
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Moins</span>
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getHeatmapColor(level * 25)}`}
              />
            ))}
          </div>
          <span>Plus</span>
        </div>
        <p className="text-sm text-gray-500">
          Interactions par heure sur 7 jours
        </p>
      </div>
    </div>
  )
}
```

## 🧪 Tests

### Tests Analytics

```typescript
// tests/analytics.test.ts
describe('Analytics Service', () => {
  test('should calculate revenue metrics correctly', async () => {
    const mockOrders = [
      { total_amount: 100, created_at: '2024-01-01' },
      { total_amount: 150, created_at: '2024-01-02' },
      { total_amount: 200, created_at: '2024-01-03' }
    ]

    const metrics = await analyticsService.calculateRevenueMetrics(mockOrders)
    
    expect(metrics.total).toBe(450)
    expect(metrics.orderCount).toBe(3)
    expect(metrics.averageOrderValue).toBe(150)
  })

  test('should generate insights based on metrics', async () => {
    const metrics = {
      revenue: { growth: 15 },
      ai: { responseRate: 95 },
      customers: { satisfactionScore: 3.5 }
    }

    const insights = await reportingService.generateInsights(metrics)
    
    expect(insights).toHaveLength(3)
    expect(insights[0].type).toBe('positive') // Revenue growth
    expect(insights[1].type).toBe('positive') // AI performance
    expect(insights[2].type).toBe('warning') // Low satisfaction
  })
})
```

---

📊 **Analytics Puissantes** : Des données exploitables pour optimiser votre business !