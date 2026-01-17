# 🐳 Déploiement Docker - Vue d'ensemble

Ce projet est configuré pour être déployé sur AWS EC2 en utilisant Docker, GitHub et AWS.

## 📁 Fichiers de Configuration

### Docker
- **`Dockerfile`** : Configuration multi-stage pour builder l'application Next.js
- **`docker-compose.yml`** : Configuration pour le développement (inclut MySQL)
- **`docker-compose.prod.yml`** : Configuration pour la production sur EC2
- **`.dockerignore`** : Fichiers à exclure du build Docker

### CI/CD
- **`.github/workflows/deploy.yml`** : Workflow GitHub Actions pour déploiement automatique

### Scripts
- **`deploy-docker.sh`** : Script de déploiement manuel sur EC2

### Documentation
- **`DEPLOY_DOCKER_EC2.md`** : Guide complet de déploiement
- **`QUICK_START_DOCKER.md`** : Checklist rapide

## 🚀 Démarrage Rapide

### 1. Localement avec Docker

```bash
# Cloner le projet
git clone https://github.com/VOTRE_USERNAME/Urbains.git
cd Urbains

# Créer le fichier .env
cp .env.example .env
# Éditer .env avec vos configurations

# Lancer avec Docker Compose
docker-compose up -d

# Initialiser la base de données
docker-compose exec app npx prisma generate
docker-compose exec app npx prisma db push
docker-compose exec app npm run db:seed
```

### 2. Sur EC2 avec GitHub Actions

1. **Configurer GitHub Secrets** (voir `DEPLOY_DOCKER_EC2.md`)
2. **Créer l'instance EC2** et installer Docker
3. **Pousser sur GitHub** : Le workflow se déclenche automatiquement

### 3. Déploiement manuel sur EC2

```bash
# Sur votre machine locale
ssh -i cle.pem ubuntu@VOTRE_IP_EC2

# Sur EC2
cd /home/ubuntu/Urbains
git pull
./deploy-docker.sh
```

## 📊 Architecture

```
┌─────────────────┐
│   GitHub Repo   │
└────────┬────────┘
         │
         │ (push)
         ▼
┌─────────────────┐
│ GitHub Actions  │
│   (CI/CD)       │
└────────┬────────┘
         │
         │ (SSH deploy)
         ▼
┌─────────────────┐
│   AWS EC2       │
│  ┌───────────┐  │
│  │  Docker   │  │
│  │  ┌─────┐  │  │
│  │  │ App │  │  │
│  │  └─────┘  │  │
│  └───────────┘  │
│  ┌───────────┐  │
│  │  Nginx    │  │
│  └───────────┘  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   AWS RDS       │
│    MySQL        │
└─────────────────┘
```

## 🔧 Commandes Utiles

### Docker Compose (Production)

```bash
# Démarrer
docker-compose -f docker-compose.prod.yml up -d

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f app

# Redémarrer
docker-compose -f docker-compose.prod.yml restart app

# Arrêter
docker-compose -f docker-compose.prod.yml down

# Rebuild
docker-compose -f docker-compose.prod.yml build --no-cache
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

### Health Check

```bash
# Vérifier que l'application fonctionne
curl http://localhost:3000/api/health
```

## 📝 Variables d'Environnement

Créez un fichier `.env` avec :

```env
DATABASE_URL="mysql://user:password@host:3306/urbains"
NEXTAUTH_SECRET="votre-secret-tres-long"
NEXTAUTH_URL="http://VOTRE_IP_EC2"
NODE_ENV=production
```

## 🔍 Dépannage

### Container ne démarre pas

```bash
# Voir les logs
docker-compose -f docker-compose.prod.yml logs app

# Vérifier les containers
docker ps -a

# Vérifier les variables d'environnement
docker-compose -f docker-compose.prod.yml config
```

### Erreur de connexion à la base de données

1. Vérifiez que RDS est accessible depuis EC2
2. Vérifiez les Security Groups AWS
3. Testez la connexion :
```bash
docker-compose -f docker-compose.prod.yml run --rm app sh -c "mysql -h HOST -u USER -p"
```

### Problèmes de permissions (uploads)

```bash
docker-compose -f docker-compose.prod.yml exec app chown -R nextjs:nodejs /app/public/uploads
```

## 📚 Documentation Complète

- **Guide complet** : `DEPLOY_DOCKER_EC2.md`
- **Checklist rapide** : `QUICK_START_DOCKER.md`

## 🆘 Support

Pour plus d'aide, consultez :
- [Documentation Docker](https://docs.docker.com/)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation AWS EC2](https://docs.aws.amazon.com/ec2/)

---

**Bon déploiement ! 🚀**
