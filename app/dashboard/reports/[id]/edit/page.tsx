import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import EditReportForm from '@/components/EditReportForm'

export default async function EditReportPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'CITOYEN') {
    redirect('/auth/login')
  }

  const report = await prisma.report.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
      status: 'NOUVEAU', // Seuls les signalements NOUVEAU peuvent être modifiés
    },
    include: {
      category: true,
    },
  })

  if (!report) {
    redirect('/dashboard')
  }

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
        Modifier le signalement
      </h1>
      <EditReportForm report={report} categories={categories} />
    </div>
  )
}

