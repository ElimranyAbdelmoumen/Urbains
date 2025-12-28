# Plateforme de Signalement Urbain

Plateforme web permettant aux citoyens de signaler des problèmes urbains (routes dégradées, éclairage public, signalisation, etc.) et aux services municipaux de les traiter efficacement.

## 🚀 Technologies

- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Backend**: Next.js API Routes
- **Base de données**: MySQL (via Prisma ORM)
- **Authentification**: NextAuth.js (JWT)
- **Déploiement**: Vercel (recommandé)

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** 18+ ([Télécharger](https://nodejs.org/))
- **MySQL** 8.0+ ([Télécharger](https://dev.mysql.com/downloads/mysql/))
- **npm** ou **yarn** (inclus avec Node.js)
- **Git** (pour cloner le projet)

## 🛠️ Installation

### Étape 1 : Cloner le projet

```bash
git clone https://github.com/ElimranyAbdelmoumen/Urbains.git
cd Urbains
```

### Étape 2 : Installer les dépendances

```bash
npm install
```

### Étape 3 : Configurer MySQL

#### Option A : MySQL Local (Windows)

1. **Installer MySQL** (si pas déjà installé)
   - Téléchargez depuis : https://dev.mysql.com/downloads/mysql/
   - Pendant l'installation, notez le mot de passe root que vous définissez

2. **Créer la base de données**
   
   Ouvrez MySQL Command Line Client ou MySQL Workbench et exécutez :

   ```sql
   CREATE DATABASE urbains CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

   Ou utilisez le script PowerShell fourni :
   ```powershell
   .\setup-database.ps1
   ```

3. **Vérifier la connexion**
   
   Testez la connexion avec :
   ```bash
   mysql -u root -p
   ```
   Puis :
   ```sql
   SHOW DATABASES;
   ```
   Vous devriez voir `urbains` dans la liste.

#### Option B : MySQL Cloud (Gratuit)

Vous pouvez utiliser un service MySQL gratuit :

- **PlanetScale** : https://planetscale.com/ (gratuit)
- **Aiven** : https://aiven.io/ (essai gratuit)
- **Railway** : https://railway.app/ (gratuit avec limites)

1. Créez un compte sur l'un de ces services
2. Créez une nouvelle base de données MySQL
3. Copiez l'URL de connexion fournie

### Étape 4 : Configurer les variables d'environnement

1. **Créer le fichier `.env`**

   Créez un fichier `.env` à la racine du projet :

   ```bash
   # Windows (PowerShell)
   New-Item .env

   # Linux/Mac
   touch .env
   ```

2. **Configurer les variables**

   Ouvrez `.env` et ajoutez :

   ```env
   # URL de la base de données MySQL
   # Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
   DATABASE_URL="mysql://root:VOTRE_MOT_DE_PASSE@localhost:3306/urbains"

   # Secret pour NextAuth.js (générez un secret aléatoire)
   # Windows PowerShell: [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))
   # Linux/Mac: openssl rand -base64 32
   NEXTAUTH_SECRET="votre-secret-tres-long-et-aleatoire-ici"

   # URL de l'application
   # En développement
   NEXTAUTH_URL="http://localhost:3000"
   ```

   **Exemple de DATABASE_URL :**
   ```env
   # MySQL local
   DATABASE_URL="mysql://root:monMotDePasse123@localhost:3306/urbains"

   # MySQL cloud (PlanetScale)
   DATABASE_URL="mysql://user:password@host.planetscale.com:3306/database?sslaccept=strict"
   ```

   **Générer NEXTAUTH_SECRET :**
   
   **Windows (PowerShell) :**
   ```powershell
   [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))
   ```
   
   **Linux/Mac :**
   ```bash
   openssl rand -base64 32
   ```
   
   **En ligne :**
   - Allez sur https://generate-secret.vercel.app/32
   - Copiez le secret généré

### Étape 5 : Configurer Prisma

1. **Générer le client Prisma**

   ```bash
   npm run db:generate
   ```

2. **Créer les tables dans la base de données**

   ```bash
   npm run db:push
   ```

   Cette commande va créer toutes les tables nécessaires dans votre base de données MySQL.

3. **Vérifier la création des tables** (optionnel)

   ```bash
   npm run db:studio
   ```

   Cela ouvre Prisma Studio dans votre navigateur où vous pouvez voir toutes les tables.

### Étape 6 : Peupler la base de données (Optionnel)

Cette étape crée des données de test (comptes admin, agent, catégories) :

```bash
npm run db:seed
```

**Comptes créés par le seed :**
- **Admin** : `admin@urbains.fr` / `admin123`
- **Agent** : `agent@urbains.fr` / `agent123`

⚠️ **Important** : Changez ces mots de passe en production !

### Étape 7 : Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du projet

```
urbains/
├── app/
│   ├── (auth)/          # Pages d'authentification (login, register)
│   ├── dashboard/        # Espace citoyen
│   │   ├── new/         # Créer un nouveau signalement
│   │   ├── reports/     # Voir/modifier ses signalements
│   │   └── profile/     # Profil utilisateur
│   ├── agent/           # Espace agent municipal
│   │   ├── reports/     # Gérer les signalements
│   │   └── profile/     # Profil agent
│   ├── admin/           # Espace administrateur
│   │   ├── users/       # Gérer les utilisateurs
│   │   ├── categories/  # Gérer les catégories
│   │   └── profile/     # Profil admin
│   └── api/             # API Routes (REST)
├── components/          # Composants React réutilisables
├── lib/                 # Utilitaires
│   ├── auth.ts          # Configuration NextAuth
│   ├── prisma.ts        # Client Prisma
│   └── utils.ts         # Fonctions utilitaires
├── prisma/
│   ├── schema.prisma    # Schéma de base de données
│   └── seed.ts          # Script de seed
├── public/
│   └── uploads/         # Photos uploadées (créé automatiquement)
└── types/               # Types TypeScript
```

## 👥 Rôles utilisateurs

### CITOYEN
- Créer des signalements avec description, localisation et photo
- Suivre l'état de ses signalements
- Modifier ses signalements (si statut "Nouveau")
- Ajouter des commentaires
- Consulter son profil

### AGENT
- Voir tous les signalements
- S'assigner des signalements
- Changer le statut des signalements
- Ajouter des commentaires (publics ou internes)
- Consulter les statistiques
- Consulter son profil

### ADMIN
- Gérer tous les utilisateurs (créer, modifier, supprimer, changer les rôles)
- Gérer les catégories de signalements
- Voir toutes les statistiques
- Consulter son profil

## 🔐 Comptes par défaut

Après avoir lancé `npm run db:seed`, vous pouvez utiliser :

- **Admin** : `admin@urbains.fr` / `admin123`
- **Agent** : `agent@urbains.fr` / `agent123`

Pour créer un compte citoyen, utilisez la page d'inscription publique.

⚠️ **Sécurité** : Changez ces mots de passe en production !

## 📝 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement (http://localhost:3000) |
| `npm run build` | Compile l'application pour la production |
| `npm run start` | Lance le serveur de production |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm run db:generate` | Génère le client Prisma |
| `npm run db:push` | Pousse le schéma vers la DB (crée/modifie les tables) |
| `npm run db:migrate` | Crée une migration Prisma |
| `npm run db:studio` | Ouvre Prisma Studio (interface graphique pour la DB) |
| `npm run db:seed` | Peuple la base avec des données de test |

## 🗄️ Configuration de la base de données

### Schéma de base de données

Le projet utilise Prisma ORM avec MySQL. Les principales tables sont :

- **User** : Utilisateurs (citoyens, agents, admins)
- **Report** : Signalements
- **Category** : Catégories de signalements
- **Comment** : Commentaires sur les signalements
- **ReportHistory** : Historique des changements de statut

### Modifier le schéma

1. Modifiez `prisma/schema.prisma`
2. Exécutez :
   ```bash
   npm run db:push
   ```

### Réinitialiser la base de données

⚠️ **Attention** : Cela supprime toutes les données !

```bash
# Supprimer toutes les tables
npx prisma migrate reset

# Recréer les tables
npm run db:push

# Repeupler avec des données de test
npm run db:seed
```

## 🐛 Résolution de problèmes

### Erreur : "Can't reach database server"

**Problème** : MySQL n'est pas démarré ou la connexion est incorrecte.

**Solution** :
1. Vérifiez que MySQL est démarré :
   - Windows : Services → MySQL → Démarrer
   - Linux : `sudo systemctl start mysql`
   - Mac : `brew services start mysql`
2. Vérifiez votre `DATABASE_URL` dans `.env`
3. Testez la connexion :
   ```bash
   mysql -u root -p
   ```

### Erreur : "Access denied for user"

**Problème** : Mauvais nom d'utilisateur ou mot de passe.

**Solution** :
1. Vérifiez votre `DATABASE_URL` dans `.env`
2. Testez la connexion manuellement :
   ```bash
   mysql -u root -p
   ```
3. Vérifiez que l'utilisateur a les permissions :
   ```sql
   GRANT ALL PRIVILEGES ON urbains.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Erreur : "Database does not exist"

**Problème** : La base de données n'a pas été créée.

**Solution** :
```sql
CREATE DATABASE urbains CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Erreur : "NEXTAUTH_SECRET is missing"

**Problème** : La variable d'environnement n'est pas définie.

**Solution** :
1. Vérifiez que `.env` existe à la racine du projet
2. Vérifiez que `NEXTAUTH_SECRET` est défini dans `.env`
3. Redémarrez le serveur de développement

### Erreur : Port 3000 already in use

**Problème** : Un autre processus utilise le port 3000.

**Solution** :
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

Ou changez le port :
```bash
npm run dev -- -p 3001
```

## 🚢 Déploiement sur Vercel

1. **Connecter votre repo GitHub à Vercel**
   - Allez sur https://vercel.com
   - Importez votre repo GitHub

2. **Configurer les variables d'environnement**
   - Dans Vercel, allez dans Settings → Environment Variables
   - Ajoutez :
     - `DATABASE_URL` : Votre URL MySQL (cloud)
     - `NEXTAUTH_SECRET` : Votre secret
     - `NEXTAUTH_URL` : Votre URL Vercel (ex: https://urbains.vercel.app)

3. **Déployer**
   - Vercel détectera automatiquement Next.js
   - Le déploiement se fera automatiquement

4. **Configurer la base de données**
   - Utilisez un service MySQL cloud (PlanetScale, Railway, etc.)
   - Exécutez `npm run db:push` via Vercel CLI ou directement sur votre DB

## 📄 Licence

Projet académique - Tous droits réservés

## 👤 Auteur

ElimranyAbdelmoumen

## 🔗 Liens utiles

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation NextAuth.js](https://next-auth.js.org/)
- [Documentation TailwindCSS](https://tailwindcss.com/docs)

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
- ✅ Upload de photos pour les signalements
- ✅ Recherche et filtrage des signalements

---

**Besoin d'aide ?** Ouvrez une issue sur GitHub ou consultez la documentation ci-dessus.
