# Plateforme de Signalement Urbain

Plateforme web permettant aux citoyens de signaler des problèmes urbains et aux services municipaux de les traiter.

## 🚀 Technologies

- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Backend**: Next.js API Routes
- **Base de données**: MySQL (via Prisma)
- **Authentification**: NextAuth.js
- **Déploiement**: Vercel

## 📋 Prérequis

- Node.js 18+ 
- MySQL (local ou service cloud gratuit)
- npm ou yarn

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd urbains
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```

Éditez `.env` et configurez :
- `DATABASE_URL` : URL de votre base MySQL (format: `mysql://user:password@host:port/database`)
- `NEXTAUTH_SECRET` : Générez avec `openssl rand -base64 32`
- `NEXTAUTH_URL` : URL de votre application (http://localhost:3000 en dev)

4. **Configurer la base de données**
```bash
# Générer le client Prisma
npm run db:generate

# Créer les tables dans la base de données
npm run db:push
```

5. **Lancer le seed (optionnel - crée des données de test)**
```bash
npm run db:seed
```

6. **Lancer le serveur de développement**
```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du projet

```
urbains/
├── app/
│   ├── (auth)/          # Pages d'authentification
│   ├── dashboard/       # Espace citoyen
│   ├── agent/           # Espace agent
│   ├── admin/          # Espace administrateur
│   └── api/             # API Routes
├── components/          # Composants React
├── lib/                 # Utilitaires (Prisma, Auth)
├── prisma/              # Schéma Prisma
└── types/               # Types TypeScript
```

## 👥 Rôles utilisateurs

- **CITOYEN** : Créer et suivre des signalements
- **AGENT** : Traiter et mettre à jour les signalements
- **ADMIN** : Gérer les utilisateurs, catégories et statistiques

## 🔐 Comptes par défaut

Après avoir lancé le seed, vous pouvez utiliser ces comptes :

- **Admin**: `admin@urbains.fr` / `admin123`
- **Agent**: `agent@urbains.fr` / `agent123`

Pour créer un compte citoyen, utilisez la page d'inscription.

## 📝 Scripts disponibles

- `npm run dev` : Serveur de développement
- `npm run build` : Build de production
- `npm run start` : Serveur de production
- `npm run db:generate` : Générer le client Prisma
- `npm run db:push` : Pousser le schéma vers la DB
- `npm run db:migrate` : Créer une migration
- `npm run db:studio` : Ouvrir Prisma Studio
- `npm run db:seed` : Peupler la base avec des données de test

## ✨ Fonctionnalités

- ✅ Signalement de problèmes urbains (routes, éclairage, signalisation, etc.)
- ✅ Gestion des statuts (Nouveau, Pris en charge, En cours, Résolu, etc.)
- ✅ Système de commentaires et historique
- ✅ Attribution d'agents aux signalements
- ✅ Tableau de bord avec statistiques
- ✅ Interface responsive et moderne
- ✅ Authentification sécurisée avec NextAuth.js
- ✅ Gestion des catégories par l'administrateur
- ✅ Pages de profil pour tous les utilisateurs
- ✅ Optimisations de performance (indexation, pagination, cache)

## 🚢 Déploiement sur Vercel

1. Connectez votre repo GitHub à Vercel
2. Configurez les variables d'environnement dans Vercel
3. Vercel détectera automatiquement Next.js et déploiera

## 📄 Licence

Projet académique

