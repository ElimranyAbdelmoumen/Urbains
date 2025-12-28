import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import UserManagement from '@/components/UserManagement'

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/login')
  }

  // Limiter et sélectionner uniquement les champs nécessaires
  const users = await prisma.user.findMany({
    take: 100, // Limiter à 100 utilisateurs
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestion des utilisateurs</h1>
      <UserManagement users={users} />
    </div>
  )
}

