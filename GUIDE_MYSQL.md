# 🗄️ Guide de Configuration MySQL Local

## Installation de MySQL

### Option 1 : MySQL Installer (Windows)
1. Téléchargez MySQL Installer depuis https://dev.mysql.com/downloads/installer/
2. Choisissez "MySQL Server" et "MySQL Workbench" (optionnel mais recommandé)
3. Suivez l'installation
4. **Notez le mot de passe root** que vous configurez

### Option 2 : XAMPP (Plus simple - Inclut MySQL + phpMyAdmin)
1. Téléchargez XAMPP depuis https://www.apachefriends.org/
2. Installez XAMPP
3. Lancez le panneau de contrôle XAMPP
4. Démarrez **MySQL** (bouton Start)
5. MySQL sera accessible sur `localhost:3306`

### Option 3 : WAMP (Alternative à XAMPP)
1. Téléchargez WAMP depuis https://www.wampserver.com/
2. Installez et démarrez MySQL

---

## Créer la Base de Données

### Méthode 1 : Via MySQL Workbench
1. Ouvrez MySQL Workbench
2. Connectez-vous avec votre utilisateur root
3. Exécutez cette commande :
   ```sql
   CREATE DATABASE urbains CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### Méthode 2 : Via Ligne de Commande
1. Ouvrez PowerShell ou CMD
2. Naviguez vers le dossier MySQL (ex: `C:\Program Files\MySQL\MySQL Server 8.0\bin`)
3. Exécutez :
   ```bash
   mysql -u root -p
   ```
4. Entrez votre mot de passe
5. Exécutez :
   ```sql
   CREATE DATABASE urbains CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

### Méthode 3 : Via phpMyAdmin (XAMPP)
1. Allez sur http://localhost/phpmyadmin
2. Cliquez sur "Nouvelle base de données"
3. Nom : `urbains`
4. Interclassement : `utf8mb4_unicode_ci`
5. Cliquez sur "Créer"

---

## Configuration du fichier .env

Créez un fichier `.env` à la racine du projet avec :

```env
# MySQL Local
DATABASE_URL="mysql://root:VOTRE_MOT_DE_PASSE@localhost:3306/urbains"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="uRSsIgP+KdxybZxaPuPDowgcKWLrmdj7QhOMNfjzGLQ="

# App
NODE_ENV="development"
```

**Remplacez** :
- `root` par votre nom d'utilisateur MySQL (généralement `root`)
- `VOTRE_MOT_DE_PASSE` par votre mot de passe MySQL
- `3306` par le port MySQL (généralement 3306)
- `urbains` par le nom de votre base de données

---

## Initialiser la Base de Données

Une fois le fichier `.env` configuré :

```bash
# 1. Régénérer le client Prisma pour MySQL
npm run db:generate

# 2. Créer les tables dans MySQL
npm run db:push

# 3. (Optionnel) Créer des données de test
npm run db:seed

# 4. Lancer l'application
npm run dev
```

---

## ✅ Vérification

Après `npm run db:push`, vous devriez voir les tables créées :
- `users`
- `categories`
- `reports`
- `comments`
- `report_history`

Vous pouvez vérifier dans MySQL Workbench ou phpMyAdmin.

---

## 🐛 Problèmes Courants

### Erreur : "Access denied for user"
- Vérifiez le nom d'utilisateur et le mot de passe dans `.env`
- Vérifiez que MySQL est démarré (XAMPP/WAMP)

### Erreur : "Unknown database 'urbains'"
- Créez d'abord la base de données (voir section "Créer la Base de Données")

### Erreur : "Can't connect to MySQL server"
- Vérifiez que MySQL est démarré
- Vérifiez le port (généralement 3306)
- Vérifiez que le service MySQL est actif

---

## 📝 Notes

- ✅ MySQL fonctionne parfaitement avec Prisma
- ✅ Le schéma est compatible avec MySQL
- ✅ Les enums sont supportés par MySQL
- ⚠️ Assurez-vous que MySQL utilise `utf8mb4` pour supporter les emojis et caractères spéciaux


