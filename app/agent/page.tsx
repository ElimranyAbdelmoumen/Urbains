import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStatusLabel, getStatusColor, getStatusIcon, formatDate, formatName, getStatusBgColor } from '@/lib/utils'
import Link from 'next/link'
import { unstable_noStore as noStore } from 'next/cache'

export default async function AgentPage() {
  // Désactiver le cache pour les données dynamiques
  noStore()
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  // Calculer les stats directement en base de données (beaucoup plus rapide)
  const [
    reports,
    statsData,
  ] = await Promise.all([
    // Limiter à 50 signalements récents pour la liste
    prisma.report.findMany({
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
        creator: {
          select: {
            name: true,
            email: true,
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
    }),
    // Calculer les stats en une seule requête groupBy
    prisma.report.groupBy({
      by: ['status'],
      _count: true,
    }),
  ])

  // Créer un map des stats pour accès rapide
  const statsMap = new Map(statsData.map((s) => [s.status, s._count]))
  const stats = {
    total: statsData.reduce((sum, s) => sum + s._count, 0),
    nouveau: statsMap.get('NOUVEAU') || 0,
    prisEnCharge: statsMap.get('PRIS_EN_CHARGE') || 0,
    enCours: statsMap.get('EN_COURS') || 0,
    enAttente: statsMap.get('EN_ATTENTE_INFORMATIONS') || 0,
    resolu: statsMap.get('RESOLU') || 0,
    clos: statsMap.get('CLOS') || 0,
    rejete: statsMap.get('REJETE') || 0,
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Signalements</h1>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Nouveaux</p>
          <p className="text-2xl font-bold text-blue-600">{stats.nouveau}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Pris en charge</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.prisEnCharge}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">En cours</p>
          <p className="text-2xl font-bold text-purple-600">{stats.enCours}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">En attente</p>
          <p className="text-2xl font-bold text-orange-600">{stats.enAttente}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Résolus</p>
          <p className="text-2xl font-bold text-green-600">{stats.resolu}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Clos</p>
          <p className="text-2xl font-bold text-gray-600">{stats.clos}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Rejetés</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejete}</p>
        </div>
      </div>

      {/* Liste des signalements */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {reports.length > 0 && reports.length === 50 && (
          <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200">
            <p className="text-sm text-yellow-800">
              Affichage des 50 signalements les plus récents
            </p>
          </div>
        )}
        <ul className="divide-y divide-gray-200">
          {reports.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500">
              Aucun signalement
            </li>
          ) : (
            reports.map((report) => (
              <li key={report.id}>
                <Link
                  href={`/agent/reports/${report.id}`}
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
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          Par: {formatName(report.creator.name) || report.creator.email}
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
            ))
          )}
        </ul>
      </div>
    </div>
  )
}

