#!/bin/bash

# Script de déploiement Docker pour EC2
# Usage: ./deploy-docker.sh

set -e

echo "🐳 Déploiement Docker de l'application Urbains"
echo "================================================"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé.${NC}"
    exit 1
fi

# Vérifier .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Fichier .env non trouvé.${NC}"
    echo "Création d'un template..."
    cat > .env << EOF
DATABASE_URL="mysql://user:password@host:3306/urbains"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV=production
EOF
    echo -e "${YELLOW}⚠️  Veuillez configurer le fichier .env avant de continuer.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build de l'image Docker...${NC}"
docker-compose -f docker-compose.prod.yml build

echo -e "${GREEN}✅ Génération du client Prisma...${NC}"
docker-compose -f docker-compose.prod.yml run --rm app npx prisma generate

echo -e "${GREEN}✅ Création/Mise à jour des tables...${NC}"
docker-compose -f docker-compose.prod.yml run --rm app npx prisma db push

echo -e "${GREEN}✅ Démarrage des containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d

echo -e "${GREEN}✅ Attente du démarrage...${NC}"
sleep 5

echo -e "${GREEN}✅ Vérification du statut...${NC}"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo -e "${GREEN}================================================"
echo "✅ Déploiement terminé avec succès!"
echo "================================================${NC}"
echo ""
echo "📊 Commandes utiles:"
echo "  - Voir les logs: docker-compose -f docker-compose.prod.yml logs -f app"
echo "  - Redémarrer: docker-compose -f docker-compose.prod.yml restart app"
echo "  - Arrêter: docker-compose -f docker-compose.prod.yml down"
echo "  - Statut: docker-compose -f docker-compose.prod.yml ps"
echo ""
echo "🌐 Votre application devrait être accessible sur:"
echo "  - http://localhost:3000"
echo ""
