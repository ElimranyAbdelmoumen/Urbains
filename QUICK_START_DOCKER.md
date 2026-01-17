# 🚀 Déploiement Rapide avec Docker, GitHub et AWS EC2

## Checklist rapide

### 1. Préparer GitHub
- [ ] Créer un repository GitHub
- [ ] Pousser le code : `git push origin main`
- [ ] Configurer les Secrets GitHub (Settings → Secrets):
  - `EC2_HOST` : IP de votre instance EC2
  - `EC2_USER` : `ubuntu`
  - `EC2_SSH_KEY` : Contenu de votre clé .pem
  - `DATABASE_URL` : URL MySQL (RDS)
  - `NEXTAUTH_SECRET` : `openssl rand -base64 32`
  - `NEXTAUTH_URL` : `http://VOTRE_IP_EC2`

### 2. Créer l'instance EC2
- [ ] Lancer une instance EC2 (Ubuntu 22.04, t3.small)
- [ ] Configurer Security Groups (SSH 22, HTTP 80, HTTPS 443)
- [ ] Allouer une IP Elastic
- [ ] Se connecter : `ssh -i cle.pem ubuntu@IP`

### 3. Installer Docker sur EC2
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
exit  # Reconnectez-vous
```

### 4. Configurer RDS MySQL
- [ ] Créer une instance RDS MySQL
- [ ] Noter l'endpoint RDS
- [ ] Configurer Security Group (autoriser 3306 depuis EC2)

### 5. Cloner et configurer sur EC2
```bash
cd /home/ubuntu
git clone https://github.com/VOTRE_USERNAME/Urbains.git
cd Urbains
nano .env
# Ajoutez:
# DATABASE_URL="mysql://user:pass@rds-endpoint:3306/urbains"
# NEXTAUTH_SECRET="..."
# NEXTAUTH_URL="http://VOTRE_IP"
# NODE_ENV=production
```

### 6. Premier déploiement
```bash
chmod +x deploy-docker.sh
./deploy-docker.sh
```

### 7. Configurer Nginx
```bash
sudo nano /etc/nginx/sites-available/urbains
# Copiez la config depuis nginx.conf (modifiez l'IP)
sudo ln -s /etc/nginx/sites-available/urbains /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 8. CI/CD automatique
- [ ] Le workflow GitHub Actions se déclenche automatiquement à chaque push
- [ ] Vérifiez dans GitHub → Actions

## Commandes utiles

```bash
# Docker
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml restart app
docker-compose -f docker-compose.prod.yml ps

# Mise à jour manuelle
git pull
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Prisma
docker-compose -f docker-compose.prod.yml run --rm app npx prisma db push
docker-compose -f docker-compose.prod.yml run --rm app npx prisma studio
```

## Vérification

1. Testez l'API : `curl http://VOTRE_IP/api/health`
2. Testez l'app : `curl http://VOTRE_IP`
3. Vérifiez les logs : `docker-compose -f docker-compose.prod.yml logs app`

Voir `DEPLOY_DOCKER_EC2.md` pour le guide complet.
