/**
 * Script de diagnostic pour vérifier la configuration de l'authentification
 * Usage: npx tsx scripts/check-auth.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function checkAuth() {
  console.log('\n🔍 Vérification de la configuration d\'authentification...\n')

  // 1. Vérifier NEXTAUTH_SECRET
  console.log('1️⃣ Vérification de NEXTAUTH_SECRET...')
  if (process.env.NEXTAUTH_SECRET) {
    console.log('   ✅ NEXTAUTH_SECRET est défini')
    console.log(`   📏 Longueur: ${process.env.NEXTAUTH_SECRET.length} caractères`)
  } else {
    console.log('   ❌ NEXTAUTH_SECRET n\'est PAS défini!')
    console.log('   ⚠️  Ajoutez-le dans votre fichier .env')
  }

  // 2. Vérifier DATABASE_URL
  console.log('\n2️⃣ Vérification de DATABASE_URL...')
  if (process.env.DATABASE_URL) {
    console.log('   ✅ DATABASE_URL est défini')
    const dbUrl = process.env.DATABASE_URL
    // Masquer le mot de passe dans l'affichage
    const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@')
    console.log(`   🔗 ${maskedUrl}`)
  } else {
    console.log('   ❌ DATABASE_URL n\'est PAS défini!')
    console.log('   ⚠️  Ajoutez-le dans votre fichier .env')
  }

  // 3. Tester la connexion à la base de données
  console.log('\n3️⃣ Test de connexion à la base de données...')
  try {
    await prisma.$connect()
    console.log('   ✅ Connexion à la base de données réussie')
  } catch (error) {
    console.log('   ❌ Erreur de connexion à la base de données')
    console.log(`   📝 Erreur: ${error}`)
    await prisma.$disconnect()
    process.exit(1)
  }

  // 4. Vérifier si l'utilisateur admin existe
  console.log('\n4️⃣ Vérification de l\'utilisateur admin...')
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@urbains.fr' }
    })

    if (admin) {
      console.log('   ✅ Utilisateur admin trouvé')
      console.log(`   📧 Email: ${admin.email}`)
      console.log(`   👤 Nom: ${admin.name}`)
      console.log(`   🔑 Rôle: ${admin.role}`)
      console.log(`   🔐 Mot de passe hashé: ${admin.password ? 'Oui' : 'Non'}`)

      // Tester le mot de passe
      if (admin.password) {
        const testPassword = 'admin123'
        const isValid = await bcrypt.compare(testPassword, admin.password)
        if (isValid) {
          console.log('   ✅ Le mot de passe "admin123" est valide')
        } else {
          console.log('   ❌ Le mot de passe "admin123" n\'est PAS valide')
          console.log('   ⚠️  Le hash du mot de passe ne correspond pas')
        }
      } else {
        console.log('   ❌ L\'utilisateur admin n\'a pas de mot de passe!')
      }
    } else {
      console.log('   ❌ Utilisateur admin NON trouvé!')
      console.log('   ⚠️  Lancez: npm run db:seed')
    }
  } catch (error) {
    console.log('   ❌ Erreur lors de la vérification de l\'utilisateur admin')
    console.log(`   📝 Erreur: ${error}`)
  }

  // 5. Vérifier si l'utilisateur agent existe
  console.log('\n5️⃣ Vérification de l\'utilisateur agent...')
  try {
    const agent = await prisma.user.findUnique({
      where: { email: 'agent@urbains.fr' }
    })

    if (agent) {
      console.log('   ✅ Utilisateur agent trouvé')
      console.log(`   📧 Email: ${agent.email}`)
      console.log(`   👤 Nom: ${agent.name}`)
      console.log(`   🔑 Rôle: ${agent.role}`)
    } else {
      console.log('   ⚠️  Utilisateur agent NON trouvé (optionnel)')
    }
  } catch (error) {
    console.log('   ⚠️  Erreur lors de la vérification de l\'utilisateur agent')
  }

  // 6. Compter le nombre total d'utilisateurs
  console.log('\n6️⃣ Statistiques des utilisateurs...')
  try {
    const userCount = await prisma.user.count()
    console.log(`   📊 Nombre total d'utilisateurs: ${userCount}`)

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    })

    usersByRole.forEach((group) => {
      console.log(`   👥 ${group.role}: ${group._count}`)
    })
  } catch (error) {
    console.log('   ⚠️  Erreur lors du comptage des utilisateurs')
  }

  console.log('\n✅ Vérification terminée!\n')
  await prisma.$disconnect()
}

checkAuth()
  .catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })



