# 👤 Gestion des Profils Utilisateurs - Documentation Complète

## 📋 Vue d'ensemble

Le système de gestion des profils de WazyBot permet aux utilisateurs de configurer leurs informations personnelles et business. Il s'intègre parfaitement avec l'authentification et fournit une base solide pour la personnalisation de l'expérience utilisateur.

## ✨ Fonctionnalités

### 📝 Informations Personnelles
- **Nom complet** - Nom et prénom de l'utilisateur
- **Email** - Adresse email (synchronisée avec l'auth)
- **Téléphone** - Numéro de téléphone personnel
- **Avatar** - Photo de profil personnalisée

### 🏢 Informations Business
- **Nom de l'entreprise** - Raison sociale
- **Description** - Présentation de l'activité
- **Numéro WhatsApp Business** - Numéro dédié aux ventes
- **Catégorie d'activité** - Secteur d'activité

### 🎯 Préférences
- **Plan d'abonnement** - Starter, Pro, Business
- **Langue** - Interface et IA
- **Fuseau horaire** - Pour les rapports et notifications
- **Notifications** - Préférences de communication

## 🏗️ Architecture

### Structure de Données

```typescript
interface Profile {
  id: string                    // UUID lié à auth.users
  username?: string             // Nom d'utilisateur unique
  business_name?: string        // Nom de l'entreprise
  business_description?: string // Description de l'activité
  phone_number?: string         // Téléphone personnel
  whatsapp_number?: string      // WhatsApp Business
  subscription_tier: 'starter' | 'pro' | 'business'
  avatar_url?: string           // URL de l'avatar
  updated_at: string           // Dernière modification
}
```

### Relations Base de Données

```sql
-- Table profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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

## 💻 Implémentation

### Service de Gestion des Profils

```typescript
// src/services/profileService.ts
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
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
    
    if (error) throw error
    return data
  },

  async uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })
    
    if (uploadError) throw uploadError
    
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
    
    return data.publicUrl
  }
}
```

### Hook useProfile

```typescript
// src/hooks/useProfile.ts
export function useProfile() {
  const { user } = useAuthContext()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await profileService.getProfile(user!.id)
      setProfile(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const updatedProfile = await profileService.updateProfile(user!.id, updates)
      setProfile(updatedProfile)
      return updatedProfile
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile: loadProfile
  }
}
```

## 🎨 Interface Utilisateur

### Page de Paramètres Profil

```typescript
// src/pages/SettingsPage.tsx - Section Profile
const ProfileSettings: React.FC = () => {
  const { profile, updateProfile } = useProfile()
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    business_name: profile?.business_name || '',
    business_description: profile?.business_description || '',
    phone_number: profile?.phone_number || '',
    whatsapp_number: profile?.whatsapp_number || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile(formData)
      toast.success('Profil mis à jour avec succès')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom d'utilisateur
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de l'entreprise
          </label>
          <input
            type="text"
            value={formData.business_name}
            onChange={(e) => setFormData({...formData, business_name: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description de l'activité
        </label>
        <textarea
          rows={4}
          value={formData.business_description}
          onChange={(e) => setFormData({...formData, business_description: e.target.value})}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          placeholder="Décrivez votre activité en quelques mots..."
        />
      </div>

      <button
        type="submit"
        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
      >
        Sauvegarder les modifications
      </button>
    </form>
  )
}
```

### Composant Avatar

```typescript
// src/components/AvatarUpload.tsx
const AvatarUpload: React.FC = () => {
  const { profile, updateProfile } = useProfile()
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = event.target.files?.[0]
      if (!file) return

      // Validation
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        throw new Error('Le fichier est trop volumineux (max 5MB)')
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('Veuillez sélectionner une image')
      }

      const avatarUrl = await profileService.uploadAvatar(user!.id, file)
      await updateProfile({ avatar_url: avatarUrl })
      
      toast.success('Avatar mis à jour avec succès')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <div>
        <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          Changer l'avatar
        </label>
        <p className="text-sm text-gray-500 mt-1">
          JPG, PNG ou GIF. Max 5MB.
        </p>
      </div>
    </div>
  )
}
```

## 🔧 Fonctionnalités Avancées

### Validation des Données

```typescript
// src/lib/validation.ts
import { z } from 'zod'

export const profileSchema = z.object({
  username: z.string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .max(50, 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Seuls les lettres, chiffres, _ et - sont autorisés')
    .optional(),
  
  business_name: z.string()
    .max(255, 'Le nom de l\'entreprise ne peut pas dépasser 255 caractères')
    .optional(),
  
  business_description: z.string()
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .optional(),
  
  phone_number: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Numéro de téléphone invalide')
    .optional(),
  
  whatsapp_number: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Numéro WhatsApp invalide')
    .optional()
})

export function validateProfile(data: any) {
  return profileSchema.safeParse(data)
}
```

### Synchronisation avec l'IA

```typescript
// src/services/aiSync.ts
export const syncProfileWithAI = async (profile: Profile) => {
  // Mettre à jour les paramètres IA avec les infos du profil
  const aiSettings = {
    business_context: {
      name: profile.business_name,
      description: profile.business_description,
      industry: profile.business_category
    },
    personalization: {
      tone: 'professional', // Basé sur le type d'entreprise
      language: profile.language || 'fr'
    }
  }

  await aiSettingsService.updateAISettings(profile.id, aiSettings)
}
```

### Historique des Modifications

```typescript
// src/services/profileHistory.ts
interface ProfileChange {
  id: string
  user_id: string
  field: string
  old_value: any
  new_value: any
  changed_at: string
}

export const trackProfileChange = async (
  userId: string,
  field: string,
  oldValue: any,
  newValue: any
) => {
  await supabase
    .from('profile_changes')
    .insert({
      user_id: userId,
      field,
      old_value: oldValue,
      new_value: newValue,
      changed_at: new Date().toISOString()
    })
}
```

## 🔒 Sécurité et Permissions

### Politiques RLS

```sql
-- Lecture du profil
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Mise à jour du profil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Insertion du profil (via trigger)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Validation Côté Serveur

```sql
-- Trigger de validation
CREATE OR REPLACE FUNCTION validate_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Valider le nom d'utilisateur
  IF NEW.username IS NOT NULL AND LENGTH(NEW.username) < 3 THEN
    RAISE EXCEPTION 'Username must be at least 3 characters long';
  END IF;

  -- Valider le numéro de téléphone
  IF NEW.phone_number IS NOT NULL AND NEW.phone_number !~ '^\+?[1-9]\d{1,14}$' THEN
    RAISE EXCEPTION 'Invalid phone number format';
  END IF;

  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_profile_before_update
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION validate_profile_update();
```

## 📊 Analytics et Métriques

### Métriques de Profil

```typescript
interface ProfileMetrics {
  completionRate: number      // Taux de complétion du profil
  lastUpdateDate: string     // Dernière mise à jour
  avatarUploadRate: number   // Taux d'upload d'avatar
  businessInfoRate: number   // Taux de remplissage des infos business
}

export const calculateProfileCompletion = (profile: Profile): number => {
  const fields = [
    'username',
    'business_name',
    'business_description',
    'phone_number',
    'whatsapp_number',
    'avatar_url'
  ]
  
  const completedFields = fields.filter(field => 
    profile[field as keyof Profile] && 
    String(profile[field as keyof Profile]).trim() !== ''
  ).length
  
  return Math.round((completedFields / fields.length) * 100)
}
```

### Tracking des Événements

```typescript
// Événements trackés
const trackProfileEvent = (event: string, properties?: any) => {
  analytics.track(event, {
    userId: user?.id,
    timestamp: new Date().toISOString(),
    ...properties
  })
}

// Exemples d'événements
trackProfileEvent('profile_updated', { field: 'business_name' })
trackProfileEvent('avatar_uploaded', { fileSize: file.size })
trackProfileEvent('profile_completed', { completionRate: 100 })
```

## 🧪 Tests

### Tests Unitaires

```typescript
// tests/profile.test.ts
describe('Profile Service', () => {
  test('should update profile successfully', async () => {
    const updates = { business_name: 'Test Business' }
    const result = await profileService.updateProfile(userId, updates)
    
    expect(result.business_name).toBe('Test Business')
    expect(result.updated_at).toBeDefined()
  })

  test('should validate profile data', () => {
    const invalidData = { username: 'ab' } // Trop court
    const result = validateProfile(invalidData)
    
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('au moins 3 caractères')
  })
})
```

### Tests d'Intégration

```typescript
// tests/profile-integration.test.ts
describe('Profile Integration', () => {
  test('should sync profile with AI settings', async () => {
    const profile = await profileService.updateProfile(userId, {
      business_name: 'Tech Store',
      business_description: 'Electronics retailer'
    })
    
    await syncProfileWithAI(profile)
    
    const aiSettings = await aiSettingsService.getAISettings(userId)
    expect(aiSettings.business_context.name).toBe('Tech Store')
  })
})
```

## 🚀 Optimisations

### Cache des Profils

```typescript
// src/lib/profileCache.ts
class ProfileCache {
  private cache = new Map<string, { profile: Profile, timestamp: number }>()
  private TTL = 5 * 60 * 1000 // 5 minutes

  get(userId: string): Profile | null {
    const cached = this.cache.get(userId)
    if (!cached) return null

    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(userId)
      return null
    }

    return cached.profile
  }

  set(userId: string, profile: Profile): void {
    this.cache.set(userId, {
      profile,
      timestamp: Date.now()
    })
  }

  invalidate(userId: string): void {
    this.cache.delete(userId)
  }
}

export const profileCache = new ProfileCache()
```

### Optimisation des Images

```typescript
// src/lib/imageOptimization.ts
export const optimizeImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      // Redimensionner à 200x200 max
      const maxSize = 200
      const ratio = Math.min(maxSize / img.width, maxSize / img.height)
      
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
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
```

## 📚 Bonnes Pratiques

### Gestion des États

```typescript
// Utiliser un reducer pour les états complexes
const profileReducer = (state: ProfileState, action: ProfileAction) => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null }
    case 'LOAD_SUCCESS':
      return { ...state, loading: false, profile: action.payload }
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.payload }
    case 'UPDATE_FIELD':
      return {
        ...state,
        profile: state.profile ? {
          ...state.profile,
          [action.field]: action.value
        } : null
      }
    default:
      return state
  }
}
```

### Validation Progressive

```typescript
// Valider les champs au fur et à mesure
const useFieldValidation = (field: string, value: string) => {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const validateField = async () => {
      try {
        await profileSchema.pick({ [field]: true }).parseAsync({ [field]: value })
        setError(null)
      } catch (err: any) {
        setError(err.errors[0]?.message || 'Valeur invalide')
      }
    }

    if (value) {
      validateField()
    } else {
      setError(null)
    }
  }, [field, value])

  return error
}
```

---

👤 **Profil Complet** : Un profil bien rempli améliore l'expérience utilisateur et l'efficacité de l'IA !