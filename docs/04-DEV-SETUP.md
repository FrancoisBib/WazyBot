# 4. Configuration du développement - Guide Complet

## 🎯 Objectif
Configurer l'environnement de développement local pour une expérience optimale.

## ⏱️ Temps estimé
10-15 minutes

## 📋 Prérequis
- Node.js 18+ installé
- Variables d'environnement configurées (Étape 3 terminée)
- Éditeur de code (VS Code recommandé)

## 🛠️ Installation et configuration

### Étape 1: Installation des dépendances

```bash
# Installer toutes les dépendances
npm install

# Vérifier l'installation
npm list --depth=0
```

**Dépendances principales :**
- React 18 + TypeScript
- Tailwind CSS
- Supabase Client
- React Router
- Lucide React (icônes)
- Recharts (graphiques)
- Framer Motion (animations)

### Étape 2: Configuration de l'éditeur (VS Code)

#### Extensions recommandées

Installez ces extensions VS Code :

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

#### Configuration VS Code

Créez `.vscode/settings.json` :

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["className\\s*=\\s*[\"'`]([^\"'`]*)[\"'`]", "([a-zA-Z0-9\\-:]+)"]
  ]
}
```

### Étape 3: Configuration Prettier

Créez `.prettierrc` :

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Étape 4: Configuration ESLint

Le projet utilise déjà ESLint. Vérifiez la configuration dans `eslint.config.js`.

### Étape 5: Scripts de développement

Vérifiez les scripts disponibles dans `package.json` :

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

## 🚀 Démarrage du serveur de développement

### Commande de base

```bash
npm run dev
```

**Résultat attendu :**
```
  VITE v5.4.2  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Options avancées

```bash
# Exposer sur le réseau local
npm run dev -- --host

# Changer le port
npm run dev -- --port 3000

# Mode debug
npm run dev -- --debug
```

## 🧪 Tests de fonctionnement

### Test 1: Page d'accueil

1. **Ouvrir http://localhost:5173**
2. **Vérifier :**
   - ✅ Page se charge sans erreur
   - ✅ Design responsive
   - ✅ Animations fluides
   - ✅ Navigation fonctionne

### Test 2: Authentification

1. **Aller sur /auth**
2. **Créer un compte de test**
3. **Vérifier :**
   - ✅ Redirection vers /dashboard
   - ✅ Données utilisateur chargées
   - ✅ Sidebar avec nom d'utilisateur

### Test 3: Pages principales

Testez chaque page :

- ✅ `/dashboard` - Tableau de bord
- ✅ `/products` - Gestion des produits
- ✅ `/conversations` - Conversations WhatsApp
- ✅ `/analytics` - Analyses et statistiques
- ✅ `/settings` - Paramètres
- ✅ `/pricing` - Plans tarifaires

### Test 4: Fonctionnalités

1. **Ajouter un produit :**
   - Aller sur /products
   - Cliquer "Add Product"
   - Remplir le formulaire
   - Vérifier l'ajout en base

2. **Modifier les paramètres :**
   - Aller sur /settings
   - Modifier le profil
   - Vérifier la sauvegarde

## 🔧 Configuration avancée

### Hot Module Replacement (HMR)

Vite active automatiquement le HMR. Testez :

1. **Modifier un composant**
2. **Vérifier que la page se met à jour instantanément**
3. **L'état de l'application est préservé**

### TypeScript

Configuration dans `tsconfig.json` :

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Tailwind CSS

Configuration dans `tailwind.config.js` :

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Personnalisations ici
    },
  },
  plugins: [],
};
```

## 🐛 Debugging

### Outils de développement

1. **React Developer Tools :**
   - Extension navigateur
   - Inspection des composants
   - Profiling des performances

2. **Supabase Dashboard :**
   - Logs en temps réel
   - Requêtes SQL
   - Monitoring des performances

3. **Console navigateur :**
   - Erreurs JavaScript
   - Logs de l'application
   - Network requests

### Logs utiles

Ajoutez des logs pour le debugging :

```typescript
// Dans vos composants
console.log('User data:', user);
console.log('Supabase response:', data);

// Dans les services
console.log('API call:', { method, url, data });
```

### Breakpoints

Utilisez les breakpoints dans VS Code :

1. **Cliquez dans la marge** pour ajouter un breakpoint
2. **F5** pour démarrer le debugging
3. **F10/F11** pour naviguer dans le code

## 🚨 Dépannage

### Problème : Port déjà utilisé

**Erreur :**
```
Error: listen EADDRINUSE: address already in use :::5173
```

**Solutions :**
```bash
# Changer le port
npm run dev -- --port 3000

# Ou tuer le processus
lsof -ti:5173 | xargs kill -9
```

### Problème : Modules non trouvés

**Erreur :**
```
Cannot resolve dependency: @supabase/supabase-js
```

**Solutions :**
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install

# Ou forcer la résolution
npm install --force
```

### Problème : Erreurs TypeScript

**Solutions :**
1. Vérifiez les types dans `src/lib/supabase.ts`
2. Redémarrez le serveur TypeScript dans VS Code
3. Vérifiez la configuration `tsconfig.json`

### Problème : Styles Tailwind non appliqués

**Solutions :**
1. Vérifiez `src/index.css`
2. Redémarrez le serveur de développement
3. Vérifiez la configuration Tailwind

## 📊 Monitoring du développement

### Métriques à surveiller

1. **Temps de build :** < 2 secondes
2. **Hot reload :** < 500ms
3. **Taille du bundle :** Visible avec `npm run build`
4. **Erreurs TypeScript :** 0 erreur

### Outils de performance

```bash
# Analyser le bundle
npm run build
npm run preview

# Avec analyse détaillée
npx vite-bundle-analyzer
```

## ✅ Checklist de validation

- [ ] Dépendances installées sans erreur
- [ ] Serveur de développement démarre
- [ ] Page d'accueil se charge
- [ ] Authentification fonctionne
- [ ] Toutes les pages accessibles
- [ ] Hot reload fonctionne
- [ ] TypeScript sans erreurs
- [ ] ESLint sans erreurs
- [ ] Styles Tailwind appliqués
- [ ] Extensions VS Code installées
- [ ] Debugging configuré
- [ ] Tests de base réussis

## 🔄 Prochaine étape

Une fois l'environnement de développement configuré, passez à :
**[5. Configuration WhatsApp](./05-WHATSAPP-SETUP.md)**

---

💡 **Astuce :** Gardez les outils de développement ouverts pour surveiller les erreurs !