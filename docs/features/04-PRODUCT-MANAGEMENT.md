# 🛍️ Gestion des Produits - Documentation Complète

## 📋 Vue d'ensemble

Le système de gestion des produits de WazyBot permet aux commerçants de créer, organiser et maintenir leur catalogue de produits. L'IA utilise ces informations pour faire des recommandations intelligentes et traiter les commandes automatiquement.

## ✨ Fonctionnalités Principales

### 📦 Catalogue Produits
- **Création de produits** - Ajout simple et rapide
- **Catégorisation** - Organisation par secteurs d'activité
- **Gestion des stocks** - Suivi en temps réel
- **Images produits** - Upload et optimisation automatique
- **Mots-clés intelligents** - Pour améliorer les recherches IA

### 💰 Gestion des Prix
- **Prix dynamiques** - Ajustements faciles
- **Promotions** - Réductions temporaires
- **Prix par quantité** - Tarifs dégressifs
- **Devises multiples** - Support international

### 📊 Analytics Produits
- **Produits populaires** - Top ventes
- **Taux de conversion** - Par produit
- **Recommandations IA** - Fréquence de suggestion
- **Stock alerts** - Alertes de rupture

## 🏗️ Architecture

### Structure de Données

```typescript
interface Product {
  id: string
  user_id: string
  name: string
  description?: string
  price: number
  category_id?: number
  stock_quantity: number
  image_url?: string
  keywords: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Category {
  id: number
  name: string
  description?: string
  created_at: string
}
```

### Relations Base de Données

```sql
-- Table products avec relations
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  category_id integer REFERENCES categories(id),
  stock_quantity integer DEFAULT 0,
  image_url text,
  keywords text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour les performances
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_keywords ON products USING GIN(keywords);
```

## 💻 Implémentation

### Service de Gestion des Produits

```typescript
// src/services/productService.ts
export const productService = {
  async getProducts(userId: string, filters?: ProductFilters): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Appliquer les filtres
    if (filters?.category) {
      query = query.eq('category_id', filters.category)
    }
    
    if (filters?.active !== undefined) {
      query = query.eq('is_active', filters.active)
    }
    
    if (filters?.search) {
      query = query.or(`
        name.ilike.%${filters.search}%,
        description.ilike.%${filters.search}%,
        keywords.cs.{${filters.search}}
      `)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async createProduct(productData: CreateProductData): Promise<Product> {
    // Générer des mots-clés automatiquement
    const keywords = this.generateKeywords(productData.name, productData.description)
    
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        keywords,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    
    // Mettre à jour l'IA avec le nouveau produit
    await this.syncWithAI(data)
    
    return data
  },

  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    // Régénérer les mots-clés si le nom ou la description change
    if (updates.name || updates.description) {
      const currentProduct = await this.getProduct(productId)
      updates.keywords = this.generateKeywords(
        updates.name || currentProduct.name,
        updates.description || currentProduct.description
      )
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single()

    if (error) throw error
    
    // Synchroniser avec l'IA
    await this.syncWithAI(data)
    
    return data
  },

  async deleteProduct(productId: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) throw error
    
    // Notifier l'IA de la suppression
    await this.removeFromAI(productId)
  },

  generateKeywords(name: string, description?: string): string[] {
    const text = `${name} ${description || ''}`.toLowerCase()
    const words = text.split(/\s+/)
    
    // Filtrer les mots vides et courts
    const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'avec']
    const keywords = words
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .filter((word, index, arr) => arr.indexOf(word) === index) // Unique
    
    return keywords
  },

  async syncWithAI(product: Product): Promise<void> {
    // Mettre à jour la base de connaissances de l'IA
    await aiService.updateProductKnowledge({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category?.name,
      keywords: product.keywords,
      inStock: product.stock_quantity > 0
    })
  }
}
```

### Hook useProducts

```typescript
// src/hooks/useProducts.ts
export function useProducts(filters?: ProductFilters) {
  const { user } = useAuthContext()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadProducts()
    }
  }, [user, filters])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await productService.getProducts(user!.id, filters)
      setProducts(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addProduct = async (productData: CreateProductData) => {
    try {
      const newProduct = await productService.createProduct({
        ...productData,
        user_id: user!.id
      })
      setProducts(prev => [newProduct, ...prev])
      return newProduct
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const updatedProduct = await productService.updateProduct(productId, updates)
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p))
      return updatedProduct
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteProduct = async (productId: string) => {
    try {
      await productService.deleteProduct(productId)
      setProducts(prev => prev.filter(p => p.id !== productId))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: loadProducts
  }
}
```

## 🎨 Interface Utilisateur

### Page de Gestion des Produits

```typescript
// src/pages/ProductsPage.tsx
const ProductsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts({
    search: searchTerm,
    category: selectedCategory === 'all' ? undefined : parseInt(selectedCategory)
  })

  const stats = useMemo(() => ({
    totalProducts: products.length,
    activeProducts: products.filter(p => p.is_active).length,
    lowStock: products.filter(p => p.stock_quantity < 10 && p.stock_quantity > 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0)
  }), [products])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header avec statistiques */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestion des Produits</h1>
            <p className="text-gray-600 mt-1">Gérez votre catalogue et inventaire</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un Produit
          </button>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Produits"
            value={stats.totalProducts}
            icon={Package}
            color="purple"
          />
          <StatCard
            title="Produits Actifs"
            value={stats.activeProducts}
            icon={Tag}
            color="green"
          />
          <StatCard
            title="Stock Faible"
            value={stats.lowStock}
            icon={AlertTriangle}
            color="yellow"
          />
          <StatCard
            title="Valeur Totale"
            value={`€${stats.totalValue.toFixed(2)}`}
            icon={DollarSign}
            color="blue"
          />
        </div>

        {/* Filtres et recherche */}
        <ProductFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Liste des produits */}
        <ProductTable
          products={products}
          loading={loading}
          onUpdate={updateProduct}
          onDelete={deleteProduct}
        />

        {/* Modal d'ajout */}
        {showAddModal && (
          <AddProductModal
            onClose={() => setShowAddModal(false)}
            onAdd={addProduct}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
```

### Composant Tableau des Produits

```typescript
// src/components/ProductTable.tsx
const ProductTable: React.FC<ProductTableProps> = ({ 
  products, 
  loading, 
  onUpdate, 
  onDelete 
}) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const getStatusColor = (product: Product) => {
    if (!product.is_active) return 'bg-gray-100 text-gray-800'
    if (product.stock_quantity === 0) return 'bg-red-100 text-red-800'
    if (product.stock_quantity < 10) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusText = (product: Product) => {
    if (!product.is_active) return 'Inactif'
    if (product.stock_quantity === 0) return 'Rupture'
    if (product.stock_quantity < 10) return 'Stock Faible'
    return 'Actif'
  }

  if (loading) {
    return <ProductTableSkeleton />
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-4 px-6 font-medium text-gray-600">Produit</th>
              <th className="text-left py-4 px-6 font-medium text-gray-600">Catégorie</th>
              <th className="text-left py-4 px-6 font-medium text-gray-600">Prix</th>
              <th className="text-left py-4 px-6 font-medium text-gray-600">Stock</th>
              <th className="text-left py-4 px-6 font-medium text-gray-600">Statut</th>
              <th className="text-left py-4 px-6 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <ProductImage 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-800">{product.name}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                      {product.category?.name || 'Non catégorisé'}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-800">
                    €{product.price.toFixed(2)}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`font-medium ${
                      product.stock_quantity < 10 ? 'text-red-600' : 'text-gray-800'
                    }`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(product)}`}>
                      {getStatusText(product)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDuplicate(product)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Dupliquer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun produit trouvé</p>
                  <p className="text-sm text-gray-400">Ajoutez votre premier produit pour commencer</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal d'édition */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  )
}
```

## 🔧 Fonctionnalités Avancées

### Import/Export de Produits

```typescript
// src/services/productImportExport.ts
export const productImportExport = {
  async exportProducts(userId: string, format: 'csv' | 'json' = 'csv'): Promise<string> {
    const products = await productService.getProducts(userId)
    
    if (format === 'csv') {
      return this.exportToCSV(products)
    } else {
      return JSON.stringify(products, null, 2)
    }
  },

  exportToCSV(products: Product[]): string {
    const headers = ['Nom', 'Description', 'Prix', 'Catégorie', 'Stock', 'Actif']
    const rows = products.map(p => [
      p.name,
      p.description || '',
      p.price.toString(),
      p.category?.name || '',
      p.stock_quantity.toString(),
      p.is_active ? 'Oui' : 'Non'
    ])

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
  },

  async importFromCSV(userId: string, csvContent: string): Promise<ImportResult> {
    const lines = csvContent.split('\n')
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''))
    const results: ImportResult = { success: 0, errors: [] }

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.replace(/"/g, ''))
        const productData = this.parseCSVRow(headers, values)
        
        await productService.createProduct({
          ...productData,
          user_id: userId
        })
        
        results.success++
      } catch (error: any) {
        results.errors.push(`Ligne ${i + 1}: ${error.message}`)
      }
    }

    return results
  }
}
```

### Gestion des Images

```typescript
// src/services/imageService.ts
export const imageService = {
  async uploadProductImage(file: File, productId: string): Promise<string> {
    // Optimiser l'image avant upload
    const optimizedFile = await this.optimizeImage(file)
    
    const fileName = `products/${productId}/${Date.now()}.jpg`
    
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, optimizedFile, { 
        upsert: true,
        contentType: 'image/jpeg'
      })

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return data.publicUrl
  },

  async optimizeImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Redimensionner à 800x600 max
        const maxWidth = 800
        const maxHeight = 600
        let { width, height } = img

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob((blob) => {
          const optimizedFile = new File([blob!], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          resolve(optimizedFile)
        }, 'image/jpeg', 0.8)
      }

      img.src = URL.createObjectURL(file)
    })
  }
}
```

### Recherche Intelligente

```typescript
// src/services/productSearch.ts
export class ProductSearchService {
  async searchProducts(
    userId: string, 
    query: string, 
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    // Recherche textuelle de base
    const textResults = await this.textSearch(userId, query, options)
    
    // Recherche sémantique avec IA
    const semanticResults = await this.semanticSearch(userId, query, options)
    
    // Combiner et scorer les résultats
    return this.combineResults(textResults, semanticResults)
  }

  private async textSearch(
    userId: string, 
    query: string, 
    options: SearchOptions
  ): Promise<Product[]> {
    let supabaseQuery = supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    // Recherche full-text
    supabaseQuery = supabaseQuery.or(`
      name.ilike.%${query}%,
      description.ilike.%${query}%,
      keywords.cs.{${query.toLowerCase()}}
    `)

    // Filtres additionnels
    if (options.category) {
      supabaseQuery = supabaseQuery.eq('category_id', options.category)
    }

    if (options.priceRange) {
      supabaseQuery = supabaseQuery
        .gte('price', options.priceRange.min)
        .lte('price', options.priceRange.max)
    }

    const { data, error } = await supabaseQuery
    if (error) throw error
    
    return data || []
  }

  private async semanticSearch(
    userId: string, 
    query: string, 
    options: SearchOptions
  ): Promise<Product[]> {
    // Utiliser l'IA pour comprendre l'intention de recherche
    const searchIntent = await aiService.analyzeSearchIntent(query)
    
    // Rechercher basé sur l'intention
    return this.searchByIntent(userId, searchIntent, options)
  }

  private combineResults(textResults: Product[], semanticResults: Product[]): SearchResult[] {
    const combined = new Map<string, SearchResult>()

    // Ajouter les résultats textuels
    textResults.forEach((product, index) => {
      combined.set(product.id, {
        product,
        score: 1.0 - (index * 0.1), // Score décroissant
        matchType: 'text'
      })
    })

    // Ajouter/améliorer avec les résultats sémantiques
    semanticResults.forEach((product, index) => {
      const existing = combined.get(product.id)
      const semanticScore = 0.8 - (index * 0.1)
      
      if (existing) {
        // Combiner les scores
        existing.score = (existing.score + semanticScore) / 2
        existing.matchType = 'both'
      } else {
        combined.set(product.id, {
          product,
          score: semanticScore,
          matchType: 'semantic'
        })
      }
    })

    // Trier par score et retourner
    return Array.from(combined.values())
      .sort((a, b) => b.score - a.score)
  }
}
```

## 📊 Analytics et Métriques

### Métriques Produits

```typescript
interface ProductMetrics {
  totalProducts: number
  activeProducts: number
  averagePrice: number
  totalValue: number
  topCategories: CategoryStats[]
  lowStockProducts: Product[]
  recentlyAdded: Product[]
  performanceByProduct: ProductPerformance[]
}

export const productAnalytics = {
  async getMetrics(userId: string, timeRange: string): Promise<ProductMetrics> {
    const [products, conversations, orders] = await Promise.all([
      productService.getProducts(userId),
      conversationService.getConversations(userId),
      orderService.getOrders(userId)
    ])

    return {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.is_active).length,
      averagePrice: products.reduce((sum, p) => sum + p.price, 0) / products.length,
      totalValue: products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0),
      topCategories: this.calculateTopCategories(products),
      lowStockProducts: products.filter(p => p.stock_quantity < 10),
      recentlyAdded: products.slice(0, 5),
      performanceByProduct: this.calculateProductPerformance(products, conversations, orders)
    }
  },

  calculateProductPerformance(
    products: Product[], 
    conversations: Conversation[], 
    orders: Order[]
  ): ProductPerformance[] {
    return products.map(product => {
      // Calculer les mentions dans les conversations
      const mentions = conversations.filter(conv => 
        conv.last_message?.toLowerCase().includes(product.name.toLowerCase())
      ).length

      // Calculer les ventes
      const sales = orders.filter(order => 
        order.items?.some((item: any) => item.product_id === product.id)
      ).length

      return {
        product,
        mentions,
        sales,
        conversionRate: mentions > 0 ? (sales / mentions) * 100 : 0,
        revenue: sales * product.price
      }
    }).sort((a, b) => b.revenue - a.revenue)
  }
}
```

## 🧪 Tests

### Tests Unitaires

```typescript
// tests/productService.test.ts
describe('Product Service', () => {
  test('should create product with generated keywords', async () => {
    const productData = {
      name: 'iPhone 15 Pro',
      description: 'Smartphone Apple avec caméra professionnelle',
      price: 1199,
      user_id: 'test-user'
    }

    const product = await productService.createProduct(productData)
    
    expect(product.keywords).toContain('iphone')
    expect(product.keywords).toContain('smartphone')
    expect(product.keywords).toContain('apple')
    expect(product.keywords).toContain('caméra')
  })

  test('should filter products by search term', async () => {
    const products = await productService.getProducts('test-user', {
      search: 'iPhone'
    })
    
    products.forEach(product => {
      expect(
        product.name.toLowerCase().includes('iphone') ||
        product.description?.toLowerCase().includes('iphone') ||
        product.keywords.some(k => k.includes('iphone'))
      ).toBe(true)
    })
  })
})
```

## 🚀 Optimisations

### Cache des Produits

```typescript
// src/lib/productCache.ts
class ProductCache {
  private cache = new Map<string, CachedProducts>()
  private TTL = 5 * 60 * 1000 // 5 minutes

  getCacheKey(userId: string, filters?: ProductFilters): string {
    return `${userId}-${JSON.stringify(filters || {})}`
  }

  get(userId: string, filters?: ProductFilters): Product[] | null {
    const key = this.getCacheKey(userId, filters)
    const cached = this.cache.get(key)
    
    if (!cached || Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }
    
    return cached.products
  }

  set(userId: string, products: Product[], filters?: ProductFilters): void {
    const key = this.getCacheKey(userId, filters)
    this.cache.set(key, {
      products,
      timestamp: Date.now()
    })
  }

  invalidateUser(userId: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(userId)) {
        this.cache.delete(key)
      }
    }
  }
}

export const productCache = new ProductCache()
```

---

🛍️ **Catalogue Optimisé** : Un catalogue bien organisé améliore les recommandations IA et les ventes !