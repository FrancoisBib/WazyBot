# 6. Configuration de production - Guide Complet

## 🎯 Objectif
Préparer et déployer WazyBot en production avec toutes les optimisations et sécurités nécessaires.

## ⏱️ Temps estimé
45-60 minutes

## 📋 Prérequis
- Toutes les étapes de développement terminées (1-5)
- Domaine personnalisé (optionnel)
- Compte de déploiement (Vercel, Netlify, etc.)

## 🚀 Vue d'ensemble

La production nécessite :
- ✅ Optimisation des performances
- ✅ Sécurité renforcée
- ✅ Monitoring et logs
- ✅ Sauvegarde et récupération
- ✅ Mise à l'échelle automatique

## 🔧 Étape 1: Optimisation du build

### Configuration Vite pour la production

Mettez à jour `vite.config.ts` :

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'framer-motion'],
          charts: ['recharts'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
```

### Test du build de production

```bash
# Créer le build
npm run build

# Tester localement
npm run preview

# Analyser la taille du bundle
npx vite-bundle-analyzer
```

## 🔐 Étape 2: Configuration Supabase pour la production

### Créer un projet de production

1. **Nouveau projet Supabase**
   - Nom: `wazybot-saas-production`
   - Région: Même que le développement
   - Plan: Pro (recommandé pour la production)

2. **Migrer la base de données**
   ```bash
   # Exporter depuis le dev
   supabase db dump --db-url "postgresql://..." > backup.sql
   
   # Importer en production
   psql "postgresql://prod-url..." < backup.sql
   ```

### Configuration de sécurité avancée

1. **Activer la confirmation email**
   ```
   Authentication > Settings > Enable email confirmations: ✅
   ```

2. **Configurer SMTP personnalisé**
   ```
   SMTP Host: smtp.your-domain.com
   SMTP Port: 587
   SMTP User: noreply@your-domain.com
   SMTP Pass: your-smtp-password
   ```

3. **Politiques RLS strictes**
   ```sql
   -- Exemple de politique plus stricte
   CREATE POLICY "Strict user access" ON products
     FOR ALL USING (
       auth.uid() = user_id AND 
       auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
     );
   ```

### Monitoring et alertes

1. **Configurer les alertes**
   - Utilisation de la base de données > 80%
   - Nombre de requêtes > 10,000/heure
   - Erreurs d'authentification > 100/heure

2. **Logs personnalisés**
   ```sql
   CREATE TABLE audit_logs (
     id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id uuid REFERENCES auth.users(id),
     action text NOT NULL,
     table_name text,
     record_id text,
     old_values jsonb,
     new_values jsonb,
     created_at timestamptz DEFAULT now()
   );
   ```

## 🌐 Étape 3: Configuration du domaine

### Option A: Domaine personnalisé avec Supabase

1. **Aller dans Settings > Custom Domains**
2. **Ajouter votre domaine**
   ```
   api.your-domain.com
   ```
3. **Configurer les DNS**
   ```
   CNAME api.your-domain.com -> your-project.supabase.co
   ```

### Option B: Proxy avec votre domaine

Créez un proxy pour masquer l'URL Supabase :

```typescript
// api/supabase-proxy.ts
export default async function handler(req: any, res: any) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const targetUrl = `${supabaseUrl}${req.url}`;
  
  const response = await fetch(targetUrl, {
    method: req.method,
    headers: {
      ...req.headers,
      host: new URL(supabaseUrl).host,
    },
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
  });
  
  const data = await response.json();
  res.status(response.status).json(data);
}
```

## 📱 Étape 4: Configuration WhatsApp pour la production

### Vérification du compte Business

1. **Vérifier votre entreprise**
   - Aller dans Facebook Business Manager
   - Compléter la vérification d'entreprise
   - Fournir les documents requis

2. **Configurer le numéro officiel**
   - Utiliser un numéro dédié
   - Configurer le profil d'entreprise
   - Ajouter les informations de contact

### Webhooks de production

1. **URL de production**
   ```
   https://your-domain.com/api/webhooks/whatsapp
   ```

2. **Sécurisation des webhooks**
   ```typescript
   import crypto from 'crypto';
   
   export function verifyWebhookSignature(
     payload: string,
     signature: string,
     secret: string
   ): boolean {
     const expectedSignature = crypto
       .createHmac('sha256', secret)
       .update(payload)
       .digest('hex');
     
     return crypto.timingSafeEqual(
       Buffer.from(signature),
       Buffer.from(`sha256=${expectedSignature}`)
     );
   }
   ```

### Rate limiting et quotas

```typescript
// Implémentation simple de rate limiting
const rateLimiter = new Map();

export function checkRateLimit(userId: string, limit = 100): boolean {
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute
  
  if (!rateLimiter.has(userId)) {
    rateLimiter.set(userId, []);
  }
  
  const requests = rateLimiter.get(userId);
  const recentRequests = requests.filter((time: number) => time > windowStart);
  
  if (recentRequests.length >= limit) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimiter.set(userId, recentRequests);
  return true;
}
```

## 🚀 Étape 5: Déploiement

### Option A: Vercel (Recommandé)

1. **Installer Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Configurer le projet**
   ```bash
   vercel
   # Suivre les instructions
   ```

3. **Variables d'environnement**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   vercel env add WHATSAPP_ACCESS_TOKEN
   # ... autres variables
   ```

4. **Déployer**
   ```bash
   vercel --prod
   ```

### Option B: Netlify

1. **Créer `netlify.toml`**
   ```toml
   [build]
     publish = "dist"
     command = "npm run build"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   
   [build.environment]
     NODE_VERSION = "18"
   ```

2. **Déployer via Git**
   - Connecter votre repo GitHub
   - Configurer les variables d'environnement
   - Déploiement automatique

### Option C: Docker

1. **Créer `Dockerfile`**
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Configuration Nginx**
   ```nginx
   server {
     listen 80;
     server_name localhost;
     root /usr/share/nginx/html;
     index index.html;
     
     location / {
       try_files $uri $uri/ /index.html;
     }
     
     location /api/ {
       proxy_pass http://backend:3000;
     }
   }
   ```

## 📊 Étape 6: Monitoring et observabilité

### Intégration Sentry

1. **Installer Sentry**
   ```bash
   npm install @sentry/react @sentry/tracing
   ```

2. **Configuration**
   ```typescript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: process.env.VITE_SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 1.0,
   });
   ```

### Analytics avec Google Analytics

```typescript
// src/lib/analytics.ts
export const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag(...args);
  }
};

export const trackEvent = (action: string, category: string, label?: string) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
  });
};
```

### Logs personnalisés

```typescript
// src/lib/logger.ts
export class Logger {
  static info(message: string, data?: any) {
    console.log(`[INFO] ${message}`, data);
    this.sendToService('info', message, data);
  }
  
  static error(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, error);
    this.sendToService('error', message, error);
  }
  
  private static sendToService(level: string, message: string, data?: any) {
    if (process.env.NODE_ENV === 'production') {
      // Envoyer vers votre service de logs
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, message, data, timestamp: new Date().toISOString() })
      });
    }
  }
}
```

## 🔒 Étape 7: Sécurité avancée

### Content Security Policy (CSP)

```html
<!-- Dans index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co https://api.whatsapp.com;
  font-src 'self';
">
```

### Headers de sécurité

```typescript
// middleware/security.ts
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
```

### Validation des entrées

```typescript
// lib/validation.ts
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1).max(255),
  price: z.number().positive(),
  description: z.string().max(1000).optional(),
});

export function validateProduct(data: unknown) {
  return productSchema.safeParse(data);
}
```

## 📈 Étape 8: Performance et optimisation

### Lazy loading des composants

```typescript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/AnalyticsPage'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  );
}
```

### Optimisation des images

```typescript
// components/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export function OptimizedImage({ src, alt, width, height }: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      style={{ aspectRatio: width && height ? `${width}/${height}` : undefined }}
    />
  );
}
```

### Service Worker pour le cache

```typescript
// public/sw.js
const CACHE_NAME = 'wazybot-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

## 🔄 Étape 9: CI/CD et automatisation

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Tests automatisés

```typescript
// tests/auth.test.ts
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthPage } from '../src/pages/AuthPage';

describe('Authentication', () => {
  test('should allow user signup', async () => {
    render(<AuthPage />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    // Assertions...
  });
});
```

## 📋 Étape 10: Sauvegarde et récupération

### Sauvegarde automatique de la base de données

```bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"

pg_dump $DATABASE_URL > $BACKUP_FILE

# Upload vers S3 ou autre service de stockage
aws s3 cp $BACKUP_FILE s3://your-backup-bucket/

# Nettoyer les anciens backups (garder 30 jours)
find . -name "backup_*.sql" -mtime +30 -delete
```

### Plan de récupération

1. **Récupération de base de données**
   ```bash
   # Restaurer depuis un backup
   psql $DATABASE_URL < backup_20231201_120000.sql
   ```

2. **Rollback de déploiement**
   ```bash
   # Avec Vercel
   vercel rollback
   
   # Avec Netlify
   netlify sites:rollback
   ```

## ✅ Checklist de production

### Sécurité
- [ ] HTTPS activé partout
- [ ] Variables d'environnement sécurisées
- [ ] CSP configuré
- [ ] Headers de sécurité
- [ ] Validation des entrées
- [ ] Rate limiting
- [ ] Authentification renforcée

### Performance
- [ ] Build optimisé
- [ ] Lazy loading
- [ ] Images optimisées
- [ ] Service Worker
- [ ] CDN configuré
- [ ] Compression gzip

### Monitoring
- [ ] Sentry configuré
- [ ] Analytics configuré
- [ ] Logs centralisés
- [ ] Alertes configurées
- [ ] Métriques de performance

### Déploiement
- [ ] CI/CD configuré
- [ ] Tests automatisés
- [ ] Environnements séparés
- [ ] Rollback possible
- [ ] Sauvegarde automatique

### Conformité
- [ ] RGPD respecté
- [ ] Mentions légales
- [ ] Politique de confidentialité
- [ ] Conditions d'utilisation
- [ ] Cookies policy

## 🚨 Monitoring post-déploiement

### Métriques à surveiller

1. **Performance**
   - Temps de chargement < 3s
   - Core Web Vitals
   - Taux d'erreur < 1%

2. **Business**
   - Taux de conversion
   - Rétention utilisateurs
   - Revenus générés

3. **Technique**
   - Uptime > 99.9%
   - Utilisation des ressources
   - Erreurs API

### Alertes critiques

```typescript
// Exemple d'alerte
if (errorRate > 5) {
  sendAlert('High error rate detected', {
    rate: errorRate,
    timestamp: new Date(),
    environment: 'production'
  });
}
```

## 🔄 Maintenance continue

### Mises à jour régulières

1. **Dépendances**
   ```bash
   npm audit
   npm update
   ```

2. **Sécurité**
   - Patches de sécurité
   - Rotation des clés
   - Audit des accès

3. **Performance**
   - Optimisation continue
   - Monitoring des métriques
   - Tests de charge

---

🎉 **Félicitations !** Votre application WazyBot est maintenant en production avec toutes les bonnes pratiques de sécurité, performance et monitoring !

## 📞 Support production

- **Monitoring 24/7**
- **Support technique prioritaire**
- **Mises à jour de sécurité automatiques**
- **Sauvegarde quotidienne**

Pour toute urgence en production : support-urgent@wazybot.com