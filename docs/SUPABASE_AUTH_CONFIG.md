# Configuration de l'authentification Supabase

## Désactivation de la confirmation par email

Pour désactiver la confirmation par email dans votre projet Supabase :

### 1. Via le Dashboard Supabase

1. **Allez dans Authentication > Settings**
2. **Dans la section "User Signups":**
   - Décochez "Enable email confirmations"
   - Ou définissez "Confirm email" sur `false`

### 2. Via SQL (Alternative)

Si vous préférez configurer via SQL :

```sql
-- Désactiver la confirmation email
UPDATE auth.config 
SET enable_signup = true, 
    enable_email_confirmations = false;
```

### 3. Configuration des URLs de redirection

Dans Authentication > URL Configuration :

- **Site URL:** `http://localhost:5173` (développement)
- **Redirect URLs:** `http://localhost:5173/**`

### 4. Vérification de la configuration

Après avoir désactivé la confirmation email :

1. **Créez un nouveau compte** via l'interface
2. **Vérifiez** que l'utilisateur est immédiatement connecté
3. **Confirmez** qu'aucun email de confirmation n'est envoyé

### 5. Comportement attendu

Avec la confirmation email désactivée :

- ✅ L'utilisateur est connecté immédiatement après inscription
- ✅ Redirection automatique vers `/dashboard`
- ✅ Aucun email de confirmation envoyé
- ✅ `email_confirmed_at` peut être null mais l'utilisateur reste connecté

### 6. Pour la production

⚠️ **Important:** En production, vous devriez réactiver la confirmation email pour la sécurité :

1. **Réactivez** "Enable email confirmations"
2. **Configurez** un service SMTP
3. **Personnalisez** les templates d'email
4. **Testez** le flux complet d'inscription

### 7. Configuration SMTP (Production)

Pour la production, configurez SMTP dans Authentication > Settings :

- **SMTP Host:** votre serveur SMTP
- **SMTP Port:** 587 ou 465
- **SMTP User:** votre utilisateur SMTP
- **SMTP Pass:** votre mot de passe SMTP

### 8. Templates d'email personnalisés

Personnalisez les templates dans Authentication > Email Templates :

- **Confirm signup**
- **Reset password**
- **Magic link**
- **Change email address**

## Dépannage

### Problème : L'utilisateur n'est pas connecté après inscription

**Solution :**
1. Vérifiez que "Enable email confirmations" est désactivé
2. Vérifiez les politiques RLS
3. Vérifiez les triggers de création d'utilisateur

### Problème : Erreur de redirection

**Solution :**
1. Vérifiez les URLs de redirection dans les paramètres
2. Assurez-vous que l'URL correspond exactement
3. Vérifiez la configuration `emailRedirectTo`

### Problème : Données utilisateur manquantes

**Solution :**
1. Vérifiez que les triggers `handle_new_user()` fonctionnent
2. Vérifiez les politiques RLS sur les tables `profiles` et `ai_settings`
3. Vérifiez les logs d'erreur dans Supabase

## Commandes utiles

```sql
-- Vérifier la configuration auth
SELECT * FROM auth.config;

-- Vérifier les utilisateurs créés
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- Vérifier les profils créés
SELECT * FROM public.profiles 
ORDER BY updated_at DESC;

-- Vérifier les paramètres AI créés
SELECT user_id, assistant_name, created_at 
FROM public.ai_settings 
ORDER BY created_at DESC;
```