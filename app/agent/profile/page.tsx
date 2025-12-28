import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { formatDate, formatName } from '@/lib/utils'
import Link from 'next/link'

export default async function AgentProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'AGENT' && session.user.role !== 'ADMIN')) {
    redirect('/auth/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          reportsAssigned: true,
        },
      },
    },
  })

  if (!user) {
    redirect('/auth/login')
  }

  // Statistiques des signalements assignés
  const reportsStats = await prisma.report.groupBy({
    by: ['status'],
    where: { agentId: user.id },
    _count: true,
  })

  const statsMap = new Map(reportsStats.map((s) => [s.status, s._count]))

  // Total de signalements gérés (tous les signalements pour les admins)
  const totalReportsManaged =
    session.user.role === 'ADMIN'
      ? await prisma.report.count()
      : await prisma.report.count({ where: { agentId: user.id } })

  return (
    <div>
      <div className="mb-6">
        <Link
          href={session.user.role === 'ADMIN' ? '/admin' : '/agent'}
          className="text-indigo-600 hover:text-indigo-700 text-sm"
        >
          ← Retour
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-indigo-50">
          <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Informations personnelles */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informations personnelles
            </h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nom</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">
                  {formatName(user.name)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Rôle</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {session.user.role === 'ADMIN' ? 'Administrateur' : 'Agent'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Membre depuis</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(user.createdAt)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Statistiques */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Mes statistiques
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">
                  {session.user.role === 'ADMIN' ? 'Total signalements' : 'Signalements assignés'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {session.user.role === 'ADMIN' ? totalReportsManaged : user._count.reportsAssigned}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600">Nouveaux</p>
                <p className="text-2xl font-bold text-blue-600">
                  {statsMap.get('NOUVEAU') || 0}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-600">Pris en charge</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {statsMap.get('PRIS_EN_CHARGE') || 0}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600">Résolus</p>
                <p className="text-2xl font-bold text-green-600">
                  {statsMap.get('RESOLU') || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="flex space-x-4">
              <Link
                href={session.user.role === 'ADMIN' ? '/admin' : '/agent'}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Voir les signalements
              </Link>
              {session.user.role === 'ADMIN' && (
                <Link
                  href="/admin/users"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Gérer les utilisateurs
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

