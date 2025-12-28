import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getStatusLabel, getStatusColor, getStatusIcon, formatDate, formatName, getStatusBgColor } from '@/lib/utils'
import { unstable_noStore as noStore } from 'next/cache'

export default async function DashboardPage() {
  // Désactiver le cache pour les données dynamiques
  noStore()
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  // Limiter à 50 signalements récents et sélectionner uniquement les champs nécessaires
  const reports = await prisma.report.findMany({
    where: {
      userId: session.user.id,
    },
    take: 50,
    select: {
      id: true,
      title: true,
      status: true,
      location: true,
      createdAt: true,
      category: {
        select: {
          name: true,
        },
      },
      agent: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mes signalements</h1>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau signalement
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">Aucun signalement pour le moment</p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Créer votre premier signalement
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {reports.length === 50 && (
            <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200">
              <p className="text-sm text-yellow-800">
                Affichage de vos 50 signalements les plus récents
              </p>
            </div>
          )}
          <ul className="divide-y divide-gray-200">
            {reports.map((report) => (
              <li key={report.id}>
                <Link
                  href={`/dashboard/reports/${report.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {report.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span
                          className={`px-3 py-1.5 inline-flex items-center text-xs font-extrabold rounded-lg ${getStatusColor(
                            report.status
                          )} !text-white`}
                          style={{
                            backgroundColor: getStatusBgColor(report.status),
                            color: '#ffffff',
                          }}
                        >
                          <span className="mr-1.5">{getStatusIcon(report.status)}</span>
                          <span className="text-white font-extrabold">{getStatusLabel(report.status)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {report.category.name}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          📍 {report.location}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>{formatDate(report.createdAt)}</p>
                      </div>
                    </div>
                    {report.agent && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Agent: {formatName(report.agent.name) || report.agent.email}
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

