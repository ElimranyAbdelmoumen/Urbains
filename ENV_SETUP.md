# Configuration du fichier .env

## ⚠️ IMPORTANT : Créez votre fichier .env

Le fichier `.env` n'est pas versionné pour des raisons de sécurité. Vous devez le créer manuellement.

## 📝 Étapes

1. **Créez un fichier `.env`** à la racine du projet (même niveau que `package.json`)

2. **Copiez ce contenu** dans votre fichier `.env` :

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/urbains?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="uRSsIgP+KdxybZxaPuPDowgcKWLrmdj7QhOMNfjzGLQ="

# App
NODE_ENV="development"
```

3. **Remplacez `DATABASE_URL`** par votre vraie connection string PostgreSQL

## 🗄️ Obtenir une base de données PostgreSQL (GRATUIT)

### Option 1 : Supabase (Recommandé)
1. Allez sur https://supabase.com
2. Créez un compte gratuit
3. Créez un nouveau projet
4. Allez dans **Settings** > **Database**
5. Copiez la **Connection string** (URI)
6. Remplacez `[YOUR-PASSWORD]` par le mot de passe de votre projet
7. Collez-la dans `DATABASE_URL`

### Option 2 : Neon.tech
1. Allez sur https://neon.tech
2. Créez un compte gratuit
3. Créez un nouveau projet
4. Copiez la connection string
5. Collez-la dans `DATABASE_URL`

## ✅ Après avoir créé le .env

Une fois votre `.env` configuré avec une vraie `DATABASE_URL`, exécutez :

```bash
npm run db:push    # Crée les tables dans la base de données
npm run db:seed    # (Optionnel) Crée des données de test
npm run dev        # Lance le serveur de développement
```

## 🔐 Comptes de test (après db:seed)

- **Admin** : `admin@urbains.fr` / `admin123`
- **Agent** : `agent@urbains.fr` / `agent123`

