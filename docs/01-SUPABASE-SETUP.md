# 1. Configuration Supabase - Guide Complet

## 🎯 Objectif
Créer et configurer un nouveau projet Supabase avec la base de données complète pour WazyBot.

## ⏱️ Temps estimé
15-20 minutes

## 📋 Étapes à suivre

### Étape 1: Créer un nouveau projet Supabase

1. **Aller sur le dashboard Supabase**
   ```
   https://supabase.com/dashboard
   ```

2. **Se connecter ou créer un compte**
   - Utilisez GitHub, Google ou email

3. **Créer un nouveau projet**
   - Cliquez sur "New Project"
   - Choisissez votre organisation
   - **Nom du projet:** `wazybot-saas-platform`
   - **Mot de passe de la base de données:** Générez un mot de passe fort
   - **Région:** Choisissez la plus proche de vos utilisateurs
     - Europe: `eu-west-1` (Irlande)
     - Amérique du Nord: `us-east-1` (Virginie)
     - Asie: `ap-southeast-1` (Singapour)
   - **Plan:** Gratuit pour commencer

4. **Attendre la création**
   - Cela prend 2-3 minutes
   - ☕ Prenez un café !

### Étape 2: Récupérer les credentials

Une fois le projet créé :

1. **Aller dans Settings > API**
2. **Noter ces informations :**
   ```
   Project URL: https://xxxxx.supabase.co
   anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

⚠️ **Important:** Gardez ces informations en sécurité !

### Étape 3: Configurer la base de données

1. **Aller dans SQL Editor**
2. **Créer une nouvelle requête**
3. **Copier-coller le script complet** depuis `supabase/migrations/20250609205715_pale_bush.sql`
4. **Exécuter le script** (bouton "Run")

✅ **Vérification:** Vous devriez voir toutes les tables créées dans l'onglet "Table Editor"

### Étape 4: Vérifier la configuration

1. **Aller dans Table Editor**
2. **Vérifier que ces tables existent :**
   - ✅ users
   - ✅ profiles  
   - ✅ categories
   - ✅ products
   - ✅ conversations
   - ✅ messages
   - ✅ orders
   - ✅ ai_settings

3. **Vérifier les données par défaut :**
   - Table `categories` doit contenir 6 catégories
   - Toutes les tables doivent avoir RLS activé

### Étape 5: Configurer l'authentification

1. **Aller dans Authentication > Settings**
2. **Configurer ces paramètres :**
   ```
   Site URL: http://localhost:5173
   Redirect URLs: http://localhost:5173/**
   Enable email confirmations: DÉSACTIVÉ (pour le développement)
   Enable email signup: ACTIVÉ
   ```

3. **Sauvegarder les modifications**

### Étape 6: Tester la configuration

1. **Aller dans SQL Editor**
2. **Exécuter cette requête de test :**
   ```sql
   -- Test de base
   SELECT 'Configuration OK' as status;
   
   -- Vérifier les tables
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   
   -- Vérifier les catégories
   SELECT * FROM categories;
   ```

✅ **Résultat attendu:** Toutes les requêtes s'exécutent sans erreur

## 🔧 Configuration avancée (optionnel)

### Storage pour les images de produits

Le bucket `product-images` est déjà créé par le script. Pour vérifier :

1. **Aller dans Storage**
2. **Vérifier que le bucket `product-images` existe**
3. **Politiques configurées automatiquement**

### Monitoring et alertes

1. **Aller dans Settings > Billing**
2. **Configurer des alertes d'usage** (recommandé)
3. **Définir des limites** si nécessaire

## ✅ Checklist de validation

- [ ] Projet Supabase créé
- [ ] Credentials récupérés et sauvegardés
- [ ] Script de base de données exécuté avec succès
- [ ] Toutes les tables créées (8 tables)
- [ ] Catégories par défaut insérées (6 catégories)
- [ ] RLS activé sur toutes les tables
- [ ] Authentification configurée
- [ ] Site URL et redirect URLs configurés
- [ ] Confirmation email désactivée
- [ ] Tests de base réussis

## 🚨 Problèmes courants

### Erreur "relation does not exist"
**Solution :** Vérifiez que le script SQL a été exécuté complètement

### Erreur de permissions
**Solution :** Assurez-vous d'être propriétaire du projet Supabase

### Tables non visibles
**Solution :** Actualisez la page et vérifiez l'onglet "Table Editor"

## 📝 Notes importantes

- **Mot de passe DB :** Sauvegardez-le, vous ne pourrez pas le récupérer
- **Région :** Ne peut pas être changée après création
- **Plan gratuit :** 500MB de DB, 1GB de bande passante/mois
- **Upgrade :** Possible à tout moment sans interruption

## 🔄 Prochaine étape

Une fois cette configuration terminée, passez à :
**[2. Configuration de l'authentification](./02-AUTH-SETUP.md)**

---

💡 **Astuce :** Gardez l'onglet Supabase ouvert, vous en aurez besoin pour les étapes suivantes !