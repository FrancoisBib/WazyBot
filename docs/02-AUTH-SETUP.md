# 2. Configuration de l'authentification - Guide Complet

## 🎯 Objectif
Configurer l'authentification Supabase pour permettre l'inscription et la connexion sans confirmation email.

## ⏱️ Temps estimé
5-10 minutes

## 📋 Prérequis
- Projet Supabase créé (Étape 1 terminée)
- Accès au dashboard Supabase

## 🔧 Configuration de l'authentification

### Étape 1: Paramètres d'authentification de base

1. **Aller dans Authentication > Settings**

2. **Dans la section "General":**
   ```
   Site URL: http://localhost:5173
   ```

3. **Dans la section "Redirect URLs":**
   ```
   http://localhost:5173/**
   ```
   ⚠️ **Important :** N'oubliez pas les `/**` à la fin

### Étape 2: Configuration des inscriptions

1. **Dans la section "User Signups":**
   ```
   ✅ Enable email signup
   ❌ Enable email confirmations (DÉSACTIVÉ pour le développement)
   ❌ Enable phone confirmations
   ```

2. **Sauvegarder les modifications**

### Étape 3: Configuration des templates d'email (optionnel)

Pour le développement, vous pouvez ignorer cette étape. Pour la production :

1. **Aller dans Authentication > Email Templates**
2. **Personnaliser les templates selon vos besoins**

### Étape 4: Providers d'authentification

1. **Dans Authentication > Providers**
2. **Vérifier que "Email" est activé**
3. **Optionnel :** Configurer Google OAuth pour plus tard

#### Configuration Google OAuth (optionnel)

Si vous voulez activer Google OAuth :

1. **Aller sur Google Cloud Console**
2. **Créer un nouveau projet ou utiliser un existant**
3. **Activer Google+ API**
4. **Créer des credentials OAuth 2.0**
5. **Configurer dans Supabase :**
   ```
   Client ID: votre-client-id
   Client Secret: votre-client-secret
   ```

### Étape 5: Politiques de sécurité

Les politiques RLS sont déjà configurées par le script de base de données. Vérification :

1. **Aller dans Authentication > Policies**
2. **Vérifier que toutes les tables ont des politiques :**
   - users (2 politiques)
   - profiles (3 politiques)
   - products (4 politiques)
   - conversations (3 politiques)
   - messages (2 politiques)
   - orders (3 politiques)
   - ai_settings (3 politiques)

## 🧪 Test de l'authentification

### Test 1: Inscription d'un nouvel utilisateur

1. **Démarrer l'application :**
   ```bash
   npm run dev
   ```

2. **Aller sur http://localhost:5173/auth**

3. **Créer un nouveau compte :**
   ```
   Nom: Test User
   Email: test@example.com
   Mot de passe: password123
   ```

4. **Vérifier :**
   - ✅ Redirection automatique vers `/dashboard`
   - ✅ Aucun email de confirmation envoyé
   - ✅ Utilisateur connecté immédiatement

### Test 2: Vérification des données créées

1. **Aller dans Supabase > Authentication > Users**
2. **Vérifier que l'utilisateur est créé**

3. **Aller dans Table Editor > users**
4. **Vérifier que l'utilisateur est dans la table**

5. **Vérifier les tables liées :**
   ```sql
   -- Dans SQL Editor
   SELECT * FROM profiles WHERE id = 'user-id-here';
   SELECT * FROM ai_settings WHERE user_id = 'user-id-here';
   ```

### Test 3: Connexion existante

1. **Se déconnecter de l'application**
2. **Se reconnecter avec les mêmes credentials**
3. **Vérifier la redirection vers le dashboard**

## 🔐 Configuration de sécurité avancée

### Paramètres de session

1. **Dans Authentication > Settings > Sessions:**
   ```
   JWT expiry: 3600 (1 heure)
   Refresh token rotation: Activé
   Reuse interval: 10 secondes
   ```

### Paramètres de mot de passe

1. **Dans Authentication > Settings > Password:**
   ```
   Minimum length: 6 caractères
   Require uppercase: Non (pour le développement)
   Require lowercase: Non
   Require numbers: Non
   Require special characters: Non
   ```

⚠️ **Production :** Renforcez ces paramètres pour la production !

## 🚨 Dépannage

### Problème : Utilisateur non redirigé après inscription

**Causes possibles :**
- Confirmation email activée
- URL de redirection incorrecte
- Erreur dans le code de l'application

**Solutions :**
1. Vérifiez que "Enable email confirmations" est désactivé
2. Vérifiez les URLs de redirection
3. Vérifiez les logs de la console navigateur

### Problème : Erreur "Invalid redirect URL"

**Solution :**
1. Vérifiez que l'URL est exactement : `http://localhost:5173/**`
2. Pas d'espace avant ou après
3. Respectez la casse

### Problème : Données utilisateur manquantes

**Solution :**
1. Vérifiez que les triggers sont actifs :
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```

2. Vérifiez les logs d'erreur dans Supabase

### Problème : Politiques RLS bloquent l'accès

**Solution :**
1. Vérifiez que l'utilisateur est bien authentifié
2. Vérifiez les politiques dans Authentication > Policies
3. Testez avec le service role key si nécessaire

## 📊 Monitoring de l'authentification

### Métriques à surveiller

1. **Authentication > Users :**
   - Nombre d'utilisateurs inscrits
   - Dernière connexion
   - Statut de confirmation

2. **Logs :**
   - Tentatives de connexion
   - Erreurs d'authentification
   - Créations de compte

### Alertes recommandées

1. **Pic d'inscriptions anormal**
2. **Taux d'erreur élevé**
3. **Tentatives de connexion suspectes**

## ✅ Checklist de validation

- [ ] Site URL configurée correctement
- [ ] Redirect URLs configurées
- [ ] Email confirmations désactivées
- [ ] Email signup activé
- [ ] Test d'inscription réussi
- [ ] Redirection automatique fonctionne
- [ ] Données utilisateur créées automatiquement
- [ ] Test de connexion réussi
- [ ] Politiques RLS fonctionnelles
- [ ] Pas d'erreurs dans les logs

## 🔄 Prochaine étape

Une fois l'authentification configurée et testée, passez à :
**[3. Configuration de l'environnement](./03-ENV-SETUP.md)**

---

💡 **Astuce :** Gardez un utilisateur de test pour les prochaines étapes !