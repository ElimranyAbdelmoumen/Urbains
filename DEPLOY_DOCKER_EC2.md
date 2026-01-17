# Guide de Déploiement Docker sur AWS EC2 avec GitHub

Ce guide vous explique comment déployer votre application Next.js containerisée sur AWS EC2 en utilisant Docker, GitHub et AWS.

## 📋 Architecture

```
GitHub Repository
    ↓ (push)
GitHub Actions (CI/CD)
    ↓ (SSH deploy)
AWS EC2 Instance
    ├── Docker
    │   └── Next.js App (Container)
    ├── Nginx (Reverse Proxy)
    └── MySQL (RDS ou Container)
```

## 🚀 Étape 1 : Préparer GitHub

### 1.1 Créer un repository GitHub

1. Créez un nouveau repository sur GitHub
2. Poussez votre code :

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/VOTRE_USERNAME/Urbains.git
git push -u origin main
```

### 1.2 Configurer les Secrets GitHub

Allez dans **Settings** → **Secrets and variables** → **Actions** et ajoutez :

- `EC2_HOST` : L'IP publique de votre instance EC2
- `EC2_USER` : `ubuntu` (ou `ec2-user` pour Amazon Linux)
- `EC2_SSH_KEY` : Le contenu de votre clé SSH privée (.pem)
- `DATABASE_URL` : URL de connexion MySQL (RDS)
- `NEXTAUTH_SECRET` : Secret pour NextAuth
- `NEXTAUTH_URL` : URL de votre application (http://VOTRE_IP ou https://votre-domaine.com)

## 🖥️ Étape 2 : Créer et Configurer l'instance EC2

### 2.1 Lancer une instance EC2

1. **Console AWS** → **EC2** → **Launch Instance**
2. Configuration :
   - **AMI** : Ubuntu 22.04 LTS
   - **Instance Type** : `t3.small` minimum (2 vCPU, 2 GB RAM)
   - **Key Pair** : Créez ou sélectionnez une clé SSH
   - **Security Group** :
     - **SSH (22)** : Votre IP uniquement
     - **HTTP (80)** : 0.0.0.0/0
     - **HTTPS (443)** : 0.0.0.0/0
     - **Custom TCP (3000)** : 127.0.0.1/32 (pour Nginx)
3. **Lancez l'instance**

### 2.2 Allouer une IP Elastic

1. **EC2** → **Elastic IPs** → **Allocate Elastic IP**
2. **Associez** à votre instance

### 2.3 Se connecter à l'instance

```bash
ssh -i "votre-cle.pem" ubuntu@VOTRE_IP_EC2
```

## 🔧 Étape 3 : Installer Docker sur EC2

### 3.1 Installer Docker

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker ubuntu

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier l'installation
docker --version
docker-compose --version

# Redémarrer la session SSH pour appliquer les changements de groupe
exit
# Reconnectez-vous
```

### 3.2 Installer Git

```bash
sudo apt install -y git
```

### 3.3 Installer Nginx (pour reverse proxy)

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
```

## 🗄️ Étape 4 : Configurer la Base de Données

### Option A : AWS RDS (Recommandé pour la production)

1. **RDS** → **Create Database**
2. Configuration :
   - **Engine** : MySQL 8.0
   - **Template** : Free tier
   - **DB Instance Identifier** : `urbains-db`
   - **Master Username** : `admin`
   - **Master Password** : Choisissez un mot de passe fort
   - **VPC** : Même VPC que votre EC2
   - **Public Access** : Oui (ou configurez un VPC privé)
   - **Security Group** : Autorisez MySQL (3306) depuis votre EC2
3. **Créez la base de données**
4. Notez l'**endpoint** RDS (ex: `urbains-db.xxxxx.us-east-1.rds.amazonaws.com`)

### Option B : MySQL dans Docker (Développement uniquement)

Utilisez `docker-compose.yml` qui inclut MySQL.

## 📦 Étape 5 : Cloner le Projet sur EC2

```bash
cd /home/ubuntu
git clone https://github.com/VOTRE_USERNAME/Urbains.git
cd Urbains
```

## ⚙️ Étape 6 : Configurer les Variables d'Environnement

```bash
# Créer le fichier .env
nano .env
```

Ajoutez :

```env
# Base de données MySQL (RDS)
DATABASE_URL="mysql://admin:VOTRE_MOT_DE_PASSE@urbains-db.xxxxx.us-east-1.rds.amazonaws.com:3306/urbains"

# NextAuth
NEXTAUTH_SECRET="votre-secret-tres-long-et-aleatoire"
NEXTAUTH_URL="http://VOTRE_IP_EC2"  # Ou https://votre-domaine.com

# Node Environment
NODE_ENV=production
```

**Générer NEXTAUTH_SECRET** :
```bash
openssl rand -base64 32
```

## 🐳 Étape 7 : Construire et Lancer avec Docker

### 7.1 Construire l'image Docker

```bash
docker-compose -f docker-compose.prod.yml build
```

### 7.2 Initialiser la base de données

```bash
# Générer le client Prisma
docker-compose -f docker-compose.prod.yml run --rm app npx prisma generate

# Créer les tables
docker-compose -f docker-compose.prod.yml run --rm app npx prisma db push

# (Optionnel) Peupler avec des données de test
docker-compose -f docker-compose.prod.yml run --rm app npm run db:seed
```

### 7.3 Lancer l'application

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 7.4 Vérifier les logs

```bash
docker-compose -f docker-compose.prod.yml logs -f app
```

## 🌐 Étape 8 : Configurer Nginx

### 8.1 Créer la configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/urbains
```

Collez la configuration (remplacez `VOTRE_IP_EC2` par votre IP) :

```nginx
server {
    listen 80;
    server_name VOTRE_IP_EC2 ou votre-domaine.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 8.2 Activer la configuration

```bash
sudo ln -s /etc/nginx/sites-available/urbains /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 Étape 9 : Configurer SSL (HTTPS)

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir un certificat (si vous avez un domaine)
sudo certbot --nginx -d votre-domaine.com

# Sinon, utilisez HTTP pour l'instant
```

## 🔄 Étape 10 : Configurer GitHub Actions (CI/CD)

Le workflow GitHub Actions est déjà configuré dans `.github/workflows/deploy.yml`.

Il se déclenche automatiquement à chaque push sur `main` et :
1. Build l'image Docker
2. Se connecte à EC2 via SSH
3. Pull les dernières modifications
4. Rebuild et redémarre les containers

### 10.1 Vérifier le déploiement

Après un push sur GitHub, allez dans **Actions** pour voir le workflow s'exécuter.

## 📝 Commandes Utiles

### Docker Compose

```bash
# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f app

# Redémarrer l'application
docker-compose -f docker-compose.prod.yml restart app

# Arrêter
docker-compose -f docker-compose.prod.yml down

# Rebuild et redémarrer
docker-compose -f docker-compose.prod.yml up -d --build

# Voir les containers actifs
docker ps
```

### Mise à jour manuelle

```bash
cd /home/ubuntu/Urbains
git pull
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Prisma (dans le container)

```bash
# Générer le client
docker-compose -f docker-compose.prod.yml run --rm app npx prisma generate

# Migrations
docker-compose -f docker-compose.prod.yml run --rm app npx prisma db push

# Prisma Studio
docker-compose -f docker-compose.prod.yml run --rm -p 5555:5555 app npx prisma studio
```

## 🔍 Dépannage

### L'application ne démarre pas

```bash
# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs app

# Vérifier les containers
docker ps -a

# Vérifier les variables d'environnement
docker-compose -f docker-compose.prod.yml config
```

### Erreur de connexion à la base de données

1. Vérifiez que RDS est accessible depuis EC2
2. Vérifiez les Security Groups
3. Testez la connexion :
```bash
docker-compose -f docker-compose.prod.yml run --rm app sh -c "mysql -h HOST -u USER -p"
```

### Nginx 502 Bad Gateway

1. Vérifiez que le container est actif : `docker ps`
2. Vérifiez les logs : `docker-compose logs app`
3. Testez localement : `curl http://localhost:3000`

### Problèmes de permissions (uploads)

```bash
# Vérifier les permissions du volume
docker-compose -f docker-compose.prod.yml exec app ls -la /app/public/uploads

# Corriger les permissions
docker-compose -f docker-compose.prod.yml exec app chown -R nextjs:nodejs /app/public/uploads
```

## 🔐 Sécurité

1. **Ne commitez jamais** le fichier `.env`
2. **Utilisez des secrets GitHub** pour les variables sensibles
3. **Limitez l'accès SSH** dans les Security Groups
4. **Utilisez HTTPS** avec Let's Encrypt
5. **Mettez à jour régulièrement** : `sudo apt update && sudo apt upgrade -y`
6. **Sauvegardez régulièrement** : Configurez des snapshots EBS

## 📊 Monitoring

### Voir l'utilisation des ressources

```bash
docker stats
```

### Logs système

```bash
# Logs Docker
journalctl -u docker

# Logs Nginx
sudo tail -f /var/log/nginx/error.log
```

## 🆘 Support

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Documentation AWS EC2](https://docs.aws.amazon.com/ec2/)
- [Documentation GitHub Actions](https://docs.github.com/en/actions)

---

**Bon déploiement ! 🚀**
