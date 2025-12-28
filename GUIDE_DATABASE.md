# 🗄️ Guide de Configuration de la Base de Données

## Option 1 : Supabase (Recommandé - Gratuit et Simple)

### Étape 1 : Créer un compte Supabase
1. Allez sur **https://supabase.com**
2. Cliquez sur **"Start your project"** ou **"Sign up"**
3. Connectez-vous avec GitHub (recommandé) ou créez un compte email

### Étape 2 : Créer un nouveau projet
1. Cliquez sur **"New Project"**
2. Remplissez :
   - **Name** : `urbains` (ou autre nom)
   - **Database Password** : Choisissez un mot de passe fort (⚠️ NOTEZ-LE !)
   - **Region** : Choisissez la région la plus proche (ex: Europe West)
3. Cliquez sur **"Create new project"**
4. Attendez 2-3 minutes que le projet soit créé

### Étape 3 : Récupérer la connection string
1. Dans votre projet Supabase, allez dans **Settings** (icône engrenage en bas à gauche)
2. Cliquez sur **Database** dans le menu de gauche
3. Descendez jusqu'à **"Connection string"**
4. Sélectionnez **"URI"** dans l'onglet
5. Copiez la connection string qui ressemble à :
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
6. **Remplacez `[YOUR-PASSWORD]`** par le mot de passe que vous avez choisi à l'étape 2

### Étape 4 : Créer le fichier .env
Créez un fichier `.env` à la racine du projet avec :

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@db.xxxxx.supabase.co:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="uRSsIgP+KdxybZxaPuPDowgcKWLrmdj7QhOMNfjzGLQ="
NODE_ENV="development"
```

---

## Option 2 : Neon.tech (Alternative Gratuite)

### Étape 1 : Créer un compte
1. Allez sur **https://neon.tech**
2. Cliquez sur **"Sign Up"**
3. Connectez-vous avec GitHub

### Étape 2 : Créer un projet
1. Cliquez sur **"Create a project"**
2. Choisissez un nom : `urbains`
3. Sélectionnez une région
4. Cliquez sur **"Create project"**

### Étape 3 : Récupérer la connection string
1. Dans le dashboard, vous verrez la connection string directement
2. Cliquez sur **"Copy"** pour la copier
3. Elle ressemble à :
   ```
   postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb
   ```

### Étape 4 : Créer le fichier .env
Même processus que Supabase, utilisez la connection string de Neon.

---

## ⚙️ Après avoir créé le fichier .env

Une fois votre fichier `.env` créé avec la bonne `DATABASE_URL`, exécutez ces commandes :

```bash
# 1. Créer les tables dans la base de données
npm run db:push

# 2. (Optionnel) Créer des données de test (comptes admin et agent)
npm run db:seed

# 3. Lancer l'application
npm run dev
```

---

## ✅ Vérification

Après `npm run db:push`, vous devriez voir :
- ✅ Les tables créées dans votre base de données
- ✅ Aucune erreur dans le terminal

Après `npm run db:seed`, vous aurez :
- ✅ Un compte admin : `admin@urbains.fr` / `admin123`
- ✅ Un compte agent : `agent@urbains.fr` / `agent123`
- ✅ Des catégories par défaut

---

## 🐛 Problèmes courants

### Erreur : "Can't reach database server"
- Vérifiez que votre connection string est correcte
- Vérifiez que vous avez remplacé `[YOUR-PASSWORD]` par votre vrai mot de passe
- Pour Supabase : Vérifiez que votre IP n'est pas bloquée (Settings > Database > Connection pooling)

### Erreur : "password authentication failed"
- Le mot de passe dans la connection string est incorrect
- Vérifiez que vous avez bien remplacé `[YOUR-PASSWORD]`

### Erreur : "relation does not exist"
- Exécutez `npm run db:push` pour créer les tables

---

## 📝 Notes importantes

- ⚠️ Ne partagez JAMAIS votre fichier `.env` (il est dans .gitignore)
- ⚠️ Le mot de passe de la base de données est différent du mot de passe de votre compte Supabase/Neon
- ✅ Les bases de données gratuites ont des limites mais suffisent pour le MVP

