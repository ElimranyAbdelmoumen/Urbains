# 🚀 Instructions Rapides - Configuration Base de Données

## Méthode Simple (5 minutes)

### 1. Créer un compte Supabase
- Allez sur **https://supabase.com**
- Cliquez sur **"Start your project"**
- Connectez-vous avec GitHub (plus rapide)

### 2. Créer un nouveau projet
- Cliquez sur **"New Project"**
- **Name** : `urbains`
- **Database Password** : Choisissez un mot de passe fort ⚠️ **NOTEZ-LE !**
- **Region** : Choisissez la plus proche (ex: Europe West)
- Cliquez sur **"Create new project"**
- ⏳ Attendez 2-3 minutes

### 3. Récupérer la connection string
1. Dans votre projet Supabase, cliquez sur l'**icône engrenage** (Settings) en bas à gauche
2. Cliquez sur **"Database"** dans le menu
3. Descendez jusqu'à **"Connection string"**
4. Sélectionnez l'onglet **"URI"**
5. Vous verrez quelque chose comme :
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
6. **Copiez cette connection string**
7. **Remplacez `[PASSWORD]`** par le mot de passe que vous avez choisi à l'étape 2

### 4. Créer le fichier .env
1. Dans votre projet, **copiez le fichier `.env.template`** et renommez-le en **`.env`**
   - Ou créez un nouveau fichier nommé exactement **`.env`** (avec le point au début)
2. Ouvrez le fichier `.env`
3. Remplacez la ligne `DATABASE_URL="..."` par votre vraie connection string
4. Sauvegardez le fichier

### 5. Initialiser la base de données
Une fois le fichier `.env` créé, dites-moi et je lancerai :
```bash
npm run db:push    # Crée les tables
npm run db:seed    # Crée des comptes de test
npm run dev        # Lance l'application
```

---

## ✅ Vérification

Après avoir créé le fichier `.env`, vous pouvez vérifier qu'il est correct :
- Le fichier doit s'appeler exactement `.env` (pas `.env.txt`)
- Il doit contenir votre vraie connection string (avec le mot de passe)
- Il doit être à la racine du projet (même niveau que `package.json`)

---

## 🆘 Besoin d'aide ?

Si vous avez des problèmes :
1. Vérifiez que vous avez bien remplacé `[PASSWORD]` dans la connection string
2. Vérifiez que le fichier s'appelle bien `.env` (pas `.env.txt`)
3. Vérifiez que la connection string commence par `postgresql://`

Une fois que vous avez créé le fichier `.env`, dites-moi "c'est fait" et je continuerai ! 🚀

