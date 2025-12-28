import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import CategoryManagement from '@/components/CategoryManagement'

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/login')
  }

  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      _count: {
        select: {
          reports: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestion des catégories</h1>
      <CategoryManagement categories={categories} />
    </div>
  )
}

