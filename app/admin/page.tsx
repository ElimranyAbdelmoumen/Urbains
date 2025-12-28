import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { unstable_noStore as noStore } from 'next/cache'
import { getStatusLabel, getStatusColor, getStatusIcon, formatName } from '@/lib/utils'

export default async function AdminDashboardPage() {
  noStore()
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  // Statistiques globales - toutes en parallèle pour meilleure performance
  const [
    totalReports,
    totalUsers,
    totalCategories,
    reportsByStatus,
    reportsByCategory,
    usersByRole,
    categories,
    recentReports,
  ] = await Promise.all([
    prisma.report.count(),
    prisma.user.count(),
    prisma.category.count(),
    prisma.report.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.report.groupBy({
      by: ['categoryId'],
      _count: true,
    }),
    prisma.user.groupBy({
      by: ['role'],
      _count: true,
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
    }),
    prisma.report.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { name: true, email: true } },
        category: { select: { name: true } },
      },
    }),
  ])

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]))
  const statsMap = new Map(reportsByStatus.map((s) => [s.status, s._count]))
  const usersMap = new Map(usersByRole.map((u) => [u.role, u._count]))

  // Calculer les pourcentages
  const totalResolved = (statsMap.get('RESOLU') || 0) + (statsMap.get('CLOS') || 0)
  const resolutionRate = totalReports > 0 ? ((totalResolved / totalReports) * 100).toFixed(1) : 0

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrateur</h1>
          <p className="mt-1 text-sm text-gray-500">Vue d'ensemble de la plateforme</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/admin/users"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all duration-200"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Utilisateurs
          </Link>
          <Link
            href="/admin/categories"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all duration-200"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Catégories
          </Link>
        </div>
      </div>

      {/* Statistiques principales avec icônes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Signalements</p>
              <p className="text-3xl font-bold">{totalReports}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-lg p-3">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Utilisateurs</p>
              <p className="text-3xl font-bold">{totalUsers}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-lg p-3">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Catégories</p>
              <p className="text-3xl font-bold">{totalCategories}</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-lg p-3">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">Taux de résolution</p>
              <p className="text-3xl font-bold">{resolutionRate}%</p>
            </div>
            <div className="bg-orange-400 bg-opacity-30 rounded-lg p-3">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques de statut et catégories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signalements par statut */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="h-6 w-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Signalements par statut
          </h2>
          <div className="space-y-3">
            {reportsByStatus.map((stat) => {
              const count = stat._count
              const percentage = totalReports > 0 ? ((count / totalReports) * 100).toFixed(1) : 0
              const statusColor = getStatusColor(stat.status)
              return (
                <div key={stat.status} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getStatusIcon(stat.status)}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {getStatusLabel(stat.status)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                      <span className="text-xs text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${statusColor.includes('bg-blue') ? 'bg-blue-500' : statusColor.includes('bg-green') ? 'bg-green-500' : statusColor.includes('bg-yellow') ? 'bg-yellow-500' : statusColor.includes('bg-red') ? 'bg-red-500' : 'bg-gray-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Signalements par catégorie */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="h-6 w-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Signalements par catégorie
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {reportsByCategory
              .sort((a, b) => b._count - a._count)
              .map((cat) => {
                const count = cat._count
                const percentage = totalReports > 0 ? ((count / totalReports) * 100).toFixed(1) : 0
                return (
                  <div key={cat.categoryId} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {categoryMap.get(cat.categoryId) || 'Inconnue'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-gray-900">{count}</span>
                        <span className="text-xs text-gray-500">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      {/* Utilisateurs par rôle et Signalements récents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilisateurs par rôle */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="h-6 w-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Utilisateurs par rôle
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {usersByRole.map((role) => {
              const roleLabels: Record<string, string> = {
                CITOYEN: 'Citoyens',
                AGENT: 'Agents',
                ADMIN: 'Admins',
              }
              const roleIcons: Record<string, string> = {
                CITOYEN: '👤',
                AGENT: '👮',
                ADMIN: '👑',
              }
              return (
                <div key={role.role} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-2">{roleIcons[role.role] || '👤'}</div>
                  <p className="text-2xl font-bold text-gray-900">{role._count}</p>
                  <p className="text-xs text-gray-500 mt-1">{roleLabels[role.role] || role.role}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Signalements récents */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="h-6 w-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Signalements récents
          </h2>
          <div className="space-y-3">
            {recentReports.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Aucun signalement</p>
            ) : (
              recentReports.map((report) => (
                <Link
                  key={report.id}
                  href={`/agent/reports/${report.id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {report.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {report.category.name} • {formatName(report.creator.name) || report.creator.email}
                      </p>
                    </div>
                    <span
                      className={`ml-3 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {getStatusIcon(report.status)} {getStatusLabel(report.status)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
