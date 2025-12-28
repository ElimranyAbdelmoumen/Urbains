# Guide de configuration - Plateforme de Signalement Urbain

## 🚀 Configuration initiale

### 1. Base de données PostgreSQL

#### Option A : Supabase (Recommandé - Gratuit)
1. Créez un compte sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Allez dans Settings > Database
4. Copiez la connection string (URI)
5. Utilisez-la dans votre `.env` comme `DATABASE_URL`

#### Option B : Neon.tech (Gratuit)
1. Créez un compte sur [neon.tech](https://neon.tech)
2. Créez un nouveau projet
3. Copiez la connection string
4. Utilisez-la dans votre `.env`

#### Option C : PostgreSQL local
1. Installez PostgreSQL sur votre machine
2. Créez une base de données : `createdb urbains`
3. Utilisez : `DATABASE_URL="postgresql://user:password@localhost:5432/urbains?schema=public"`

### 2. Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Database
DATABASE_URL="votre-connection-string-postgresql"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="générez-une-clé-secrète-avec-openssl-rand-base64-32"

# App
NODE_ENV="development"
```

**Générer NEXTAUTH_SECRET** :
```bash
# Sur Linux/Mac
openssl rand -base64 32

# Sur Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 3. Installation et setup

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npm run db:generate

# Créer les tables dans la base de données
npm run db:push

# (Optionnel) Créer des données de test
npm run db:seed

# Lancer le serveur de développement
npm run dev
```

## 📦 Déploiement sur Vercel

### 1. Préparer le projet

1. Assurez-vous que votre code est sur GitHub
2. Vérifiez que tous les fichiers sont commités

### 2. Configurer Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez votre compte GitHub
3. Importez votre repository
4. Configurez les variables d'environnement :
   - `DATABASE_URL` : Votre connection string PostgreSQL
   - `NEXTAUTH_URL` : L'URL de votre site Vercel (ex: https://votre-projet.vercel.app)
   - `NEXTAUTH_SECRET` : La même clé secrète que localement

### 3. Base de données sur Vercel

**Option recommandée** : Utilisez Supabase ou Neon.tech (gratuits)
- Créez votre base de données
- Utilisez la connection string dans les variables d'environnement Vercel

**Alternative** : Vercel Postgres
- Dans votre projet Vercel, allez dans Storage
- Créez une base Postgres
- Vercel créera automatiquement la variable `POSTGRES_URL`

### 4. Déployer

Vercel détectera automatiquement Next.js et déploiera votre projet.

## 🔧 Commandes utiles

```bash
# Développement
npm run dev          # Lancer le serveur de dev
npm run build        # Build de production
npm run start        # Lancer en production

# Base de données
npm run db:generate  # Générer le client Prisma
npm run db:push      # Pousser le schéma vers la DB
npm run db:migrate   # Créer une migration
npm run db:studio    # Ouvrir Prisma Studio (interface graphique)
npm run db:seed      # Créer des données de test
```

## 🐛 Dépannage

### Erreur de connexion à la base de données
- Vérifiez que `DATABASE_URL` est correcte
- Vérifiez que votre base de données est accessible
- Pour Supabase/Neon, vérifiez que l'IP n'est pas bloquée

### Erreur NextAuth
- Vérifiez que `NEXTAUTH_SECRET` est défini
- Vérifiez que `NEXTAUTH_URL` correspond à votre URL

### Erreur d'upload d'images
- Vérifiez que le dossier `public/uploads` existe
- Sur Vercel, utilisez un service de stockage externe (Supabase Storage recommandé)

## 📝 Notes importantes

- Les images sont stockées localement dans `public/uploads` (MVP)
- Pour la production, considérez Supabase Storage ou Cloudinary
- Le seed crée des comptes par défaut (changez les mots de passe en production !)

