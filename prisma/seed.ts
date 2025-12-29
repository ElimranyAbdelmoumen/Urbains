import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Créer des catégories par défaut
  const categories = [
    { name: 'Route dégradée', description: 'Nids de poule, fissures, etc.' },
    { name: 'Éclairage public', description: 'Lampadaires défectueux' },
    { name: 'Signalisation', description: 'Panneaux manquants ou endommagés' },
    { name: 'Déchets', description: 'Dépôts sauvages, poubelles pleines' },
    { name: 'Végétation', description: 'Arbres, haies à tailler' },
    { name: 'Autre', description: 'Autres problèmes urbains' },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }

  console.log('✅ Categories created')

  // Créer un admin par défaut (mot de passe: admin123)
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@urbains.fr' },
    update: {},
    create: {
      email: 'admin@urbains.fr',
      password: adminPassword,
      name: 'Administrateur',
      role: 'ADMIN',
    },
  })

  // Créer un agent par défaut (mot de passe: agent123)
  const agentPassword = await bcrypt.hash('agent123', 10)
  await prisma.user.upsert({
    where: { email: 'agent@urbains.fr' },
    update: {},
    create: {
      email: 'agent@urbains.fr',
      password: agentPassword,
      name: 'Agent Municipal',
      role: 'AGENT',
    },
  })

  console.log('✅ Default users created')
  console.log('📧 Admin: admin@urbains.fr / admin123')
  console.log('📧 Agent: agent@urbains.fr / agent123')
  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


