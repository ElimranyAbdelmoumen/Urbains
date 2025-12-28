import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getStatusLabel, getStatusColor, getStatusIcon, formatDate, formatName, getStatusBgColor } from '@/lib/utils'
import Image from 'next/image'
import ReportActions from '@/components/ReportActions'

export default async function AgentReportDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'AGENT' && session.user.role !== 'ADMIN')) {
    redirect('/auth/login')
  }

  const report = await prisma.report.findUnique({
    where: {
      id: params.id,
    },
    include: {
      category: true,
      creator: {
        select: {
          name: true,
          email: true,
        },
      },
      agent: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      comments: {
        take: 20, // Limiter à 20 commentaires récents
        select: {
          id: true,
          content: true,
          isInternal: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      history: {
        take: 20, // Limiter à 20 entrées d'historique récentes
        select: {
          id: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!report) {
    redirect('/agent')
  }

  return (
    <div>
      <div className="mb-6">
        <a
          href="/agent"
          className="text-indigo-600 hover:text-indigo-700 text-sm"
        >
          ← Retour aux signalements
        </a>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Créé le {formatDate(report.createdAt)} par{' '}
                {formatName(report.creator.name) || report.creator.email}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-5 py-3 text-base font-extrabold rounded-xl ${getStatusColor(
                report.status
              )} !text-white !bg-opacity-100`}
              style={{
                backgroundColor: getStatusBgColor(report.status),
                color: '#ffffff',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              }}
            >
              <span className="mr-2 text-lg">{getStatusIcon(report.status)}</span>
              <span className="text-white font-extrabold tracking-wide">{getStatusLabel(report.status)}</span>
            </span>
          </div>
        </div>

        <div className="px-6 py-4 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Catégorie</h3>
            <p className="mt-1 text-sm text-gray-900">{report.category.name}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Localisation</h3>
            <p className="mt-1 text-sm text-gray-900">📍 {report.location}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
              {report.description}
            </p>
          </div>

          {report.photo && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Photo</h3>
              <div className="relative w-full max-w-md h-64">
                <Image
                  src={report.photo}
                  alt={report.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          )}

          {report.agent && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Agent assigné</h3>
              <p className="mt-1 text-sm text-gray-900 font-semibold">
                {formatName(report.agent.name) || report.agent.email}
              </p>
            </div>
          )}

          {/* Actions agent */}
          <ReportActions report={report} currentUserId={session.user.id} />

          {/* Commentaires */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Commentaires ({report.comments.length})
              {report.comments.length === 20 && (
                <span className="text-xs text-gray-400 ml-2">(20 plus récents)</span>
              )}
            </h3>
            <div className="space-y-3">
              {report.comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`rounded-lg p-4 ${
                    comment.isInternal ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        {formatName(comment.user.name) || comment.user.email}
                      </p>
                      {comment.isInternal && (
                        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                          Interne
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Historique */}
          {report.history.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Historique
                {report.history.length === 20 && (
                  <span className="text-xs text-gray-400 ml-2">(20 plus récents)</span>
                )}
              </h3>
              <div className="space-y-2">
                {[...report.history].reverse().map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center space-x-3 text-sm"
                  >
                    <span className="text-gray-500">
                      {formatDate(entry.createdAt)}
                    </span>
                    <span className="text-gray-700">→</span>
                    <span
                      className={`px-3 py-1 inline-flex items-center text-xs font-extrabold rounded-lg ${getStatusColor(
                        entry.status
                      )} !text-white`}
                      style={{
                        backgroundColor: getStatusBgColor(entry.status),
                        color: '#ffffff',
                      }}
                    >
                      <span className="mr-1">{getStatusIcon(entry.status)}</span>
                      <span className="text-white font-extrabold">{getStatusLabel(entry.status)}</span>
                    </span>
                    {entry.user.name && (
                      <span className="text-gray-500">
                        par {formatName(entry.user.name)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

