# WazyBot SaaS Platform - Guide de Configuration Complet

## 🚀 Vue d'ensemble

WazyBot est une plateforme SaaS qui transforme votre WhatsApp Business en assistant de vente IA automatisé. Cette documentation vous guide à travers toutes les étapes de configuration nécessaires.

## 📋 Prérequis

- Node.js 18+ installé
- Compte Supabase (gratuit)
- Compte WhatsApp Business (optionnel pour le développement)
- Git installé

## 🗂️ Structure des guides

Suivez ces guides dans l'ordre :

1. **[Configuration Supabase](./docs/01-SUPABASE-SETUP.md)** - Configuration de la base de données
2. **[Configuration de l'authentification](./docs/02-AUTH-SETUP.md)** - Paramétrage de l'auth
3. **[Configuration de l'environnement](./docs/03-ENV-SETUP.md)** - Variables d'environnement
4. **[Configuration du développement](./docs/04-DEV-SETUP.md)** - Environnement de développement
5. **[Configuration WhatsApp](./docs/05-WHATSAPP-SETUP.md)** - Intégration WhatsApp Business
6. **[Configuration de production](./docs/06-PRODUCTION-SETUP.md)** - Déploiement en production

## ⚡ Démarrage rapide

```bash
# 1. Cloner le projet
git clone <your-repo-url>
cd wazybot-saas-platform

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos credentials Supabase

# 4. Démarrer le serveur de développement
npm run dev
```

## 🛠️ Technologies utilisées

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Charts:** Recharts
- **Animations:** Framer Motion

## 📁 Structure du projet

```
wazybot-saas-platform/
├── src/
│   ├── components/          # Composants réutilisables
│   ├── pages/              # Pages de l'application
│   ├── hooks/              # Hooks personnalisés
│   ├── contexts/           # Contextes React
│   ├── services/           # Services API
│   └── lib/                # Configuration et utilitaires
├── supabase/
│   ├── migrations/         # Migrations de base de données
│   └── config.toml         # Configuration Supabase
├── docs/                   # Documentation
└── public/                 # Assets statiques
```

## 🔐 Sécurité

- ✅ Row Level Security (RLS) activé sur toutes les tables
- ✅ Politiques de sécurité strictes
- ✅ Validation des données côté client et serveur
- ✅ Variables d'environnement sécurisées
- ✅ Authentification JWT avec Supabase

## 📞 Support

- **Documentation:** Consultez les guides dans `/docs/`
- **Issues:** Créez une issue sur GitHub
- **Email:** support@wazybot.com

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails.

---

**Prochaine étape:** Commencez par la [Configuration Supabase](./docs/01-SUPABASE-SETUP.md)