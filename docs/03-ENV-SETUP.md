# 3. Configuration de l'environnement - Guide Complet

## 🎯 Objectif
Configurer correctement les variables d'environnement pour le développement et la production.

## ⏱️ Temps estimé
5 minutes

## 📋 Prérequis
- Projet Supabase configuré (Étapes 1 et 2 terminées)
- Credentials Supabase récupérés

## 🔧 Configuration des variables d'environnement

### Étape 1: Créer le fichier .env

1. **Copier le fichier d'exemple :**
   ```bash
   cp .env.example .env
   ```

2. **Ouvrir le fichier .env dans votre éditeur**

### Étape 2: Configurer les variables Supabase

Récupérez vos credentials depuis le dashboard Supabase :

1. **Aller dans Settings > API**
2. **Copier les informations dans .env :**

```env
# Configuration Supabase
VITE_SUPABASE_URL=https://votre-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optionnel : Service role key (pour les opérations serveur)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Configuration de développement
NODE_ENV=development
```

### Étape 3: Vérifier la configuration

1. **Redémarrer le serveur de développement :**
   ```bash
   npm run dev
   ```

2. **Vérifier dans la console navigateur :**
   - Aucune erreur de connexion Supabase
   - L'authentification fonctionne

3. **Test rapide :**
   ```javascript
   // Dans la console navigateur
   console.log(import.meta.env.VITE_SUPABASE_URL);
   // Doit afficher votre URL Supabase
   ```

## 🔒 Sécurité des variables d'environnement

### Variables publiques (VITE_*)

Ces variables sont **exposées côté client** :
- `VITE_SUPABASE_URL` ✅ Sûr
- `VITE_SUPABASE_ANON_KEY` ✅ Sûr (conçu pour être public)

### Variables privées

Ces variables ne doivent **JAMAIS** être exposées :
- `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Serveur uniquement
- Clés API tierces
- Secrets de chiffrement

### Bonnes pratiques

1. **Préfixe VITE_ :** Seulement pour les variables publiques
2. **Fichier .env :** Ajouté au .gitignore
3. **Variables sensibles :** Jamais dans le code source
4. **Production :** Variables configurées sur la plateforme de déploiement

## 🌍 Configuration par environnement

### Développement (.env.local)

```env
# Développement local
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev-anon-key
NODE_ENV=development
VITE_APP_ENV=development
```

### Test (.env.test)

```env
# Tests automatisés
VITE_SUPABASE_URL=https://test-project.supabase.co
VITE_SUPABASE_ANON_KEY=test-anon-key
NODE_ENV=test
VITE_APP_ENV=test
```

### Production (.env.production)

```env
# Production
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
NODE_ENV=production
VITE_APP_ENV=production
```

## 🔧 Configuration avancée

### Variables optionnelles

Ajoutez ces variables selon vos besoins :

```env
# Analytics (optionnel)
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX

# Monitoring (optionnel)
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx

# WhatsApp Business API (pour plus tard)
WHATSAPP_ACCESS_TOKEN=your-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-verify-token

# Stripe (pour les paiements)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx

# Email (pour les notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Validation des variables

Créez un fichier `src/lib/env.ts` pour valider les variables :

```typescript
// Validation des variables d'environnement requises
const requiredEnvVars = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
} as const;

// Vérifier que toutes les variables requises sont définies
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Variable d'environnement manquante: ${key}`);
  }
});

export const env = requiredEnvVars;
```

## 🧪 Tests de configuration

### Test 1: Variables chargées

```bash
# Dans le terminal
npm run dev
```

Vérifiez qu'aucune erreur n'apparaît au démarrage.

### Test 2: Connexion Supabase

```javascript
// Dans la console navigateur
import { supabase } from './src/lib/supabase';
console.log(supabase.supabaseUrl);
// Doit afficher votre URL
```

### Test 3: Authentification

1. **Aller sur /auth**
2. **Tenter une connexion**
3. **Vérifier qu'aucune erreur de configuration n'apparaît**

## 🚨 Dépannage

### Problème : Variables non chargées

**Symptômes :**
- `import.meta.env.VITE_SUPABASE_URL` retourne `undefined`
- Erreurs de connexion Supabase

**Solutions :**
1. Vérifiez le préfixe `VITE_` pour les variables publiques
2. Redémarrez le serveur de développement
3. Vérifiez la syntaxe du fichier .env (pas d'espaces autour du =)

### Problème : Erreur "Missing Supabase environment variables"

**Solution :**
1. Vérifiez que le fichier .env existe
2. Vérifiez que les variables sont correctement nommées
3. Vérifiez qu'il n'y a pas de caractères invisibles

### Problème : Variables exposées en production

**Solution :**
1. Utilisez le préfixe `VITE_` seulement pour les variables publiques
2. Variables sensibles : configurez-les sur votre plateforme de déploiement
3. Vérifiez le build de production

## 📁 Structure des fichiers d'environnement

```
wazybot-saas-platform/
├── .env                    # Variables par défaut (gitignored)
├── .env.example           # Template public (dans git)
├── .env.local             # Overrides locaux (gitignored)
├── .env.development       # Développement (gitignored)
├── .env.test             # Tests (gitignored)
└── .env.production       # Production (gitignored)
```

## 🔄 Ordre de priorité

Vite charge les variables dans cet ordre (priorité décroissante) :

1. `.env.local`
2. `.env.[NODE_ENV].local`
3. `.env.[NODE_ENV]`
4. `.env`

## ✅ Checklist de validation

- [ ] Fichier .env créé
- [ ] VITE_SUPABASE_URL configurée
- [ ] VITE_SUPABASE_ANON_KEY configurée
- [ ] Serveur redémarré
- [ ] Aucune erreur au démarrage
- [ ] Variables accessibles dans l'application
- [ ] Connexion Supabase fonctionnelle
- [ ] Authentification testée
- [ ] .env ajouté au .gitignore
- [ ] Variables sensibles protégées

## 🔄 Prochaine étape

Une fois les variables d'environnement configurées, passez à :
**[4. Configuration du développement](./04-DEV-SETUP.md)**

---

💡 **Astuce :** Gardez une copie de vos credentials Supabase dans un gestionnaire de mots de passe !