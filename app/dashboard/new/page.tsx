import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import NewReportForm from '@/components/NewReportForm'

export default async function NewReportPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'CITOYEN') {
    redirect('/auth/login')
  }

  // Cache les catégories car elles changent rarement
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Nouveau signalement
      </h1>
      <NewReportForm categories={categories} />
    </div>
  )
}

