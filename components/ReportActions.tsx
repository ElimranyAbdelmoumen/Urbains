'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getStatusLabel } from '@/lib/utils'
import { useToast } from './ToastProvider'

interface Report {
  id: string
  status: string
  agentId: string | null
}

interface ReportActionsProps {
  report: Report
  currentUserId: string
}

const STATUS_OPTIONS = [
  { value: 'PRIS_EN_CHARGE', label: 'Pris en charge' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'EN_ATTENTE_INFORMATIONS', label: 'En attente d\'informations' },
  { value: 'RESOLU', label: 'Résolu' },
  { value: 'CLOS', label: 'Clos' },
  { value: 'REJETE', label: 'Rejeté' },
]

export default function ReportActions({ report, currentUserId }: ReportActionsProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [status, setStatus] = useState(report.status)
  const [comment, setComment] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isAssigned, setIsAssigned] = useState(!!report.agentId)

  const handleAssign = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/reports/${report.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: currentUserId }),
      })

      if (!response.ok) {
        const data = await response.json()
        const errorMsg = data.error || 'Erreur lors de l\'assignation'
        setError(errorMsg)
        showToast(errorMsg, 'error')
        return
      }

      setIsAssigned(true)
      showToast('Signalement pris en charge avec succès', 'success')
      router.refresh()
    } catch (error) {
      const errorMsg = 'Une erreur est survenue'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (status === report.status) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/reports/${report.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const data = await response.json()
        const errorMsg = data.error || 'Erreur lors de la mise à jour'
        setError(errorMsg)
        showToast(errorMsg, 'error')
        return
      }

      showToast('Statut mis à jour avec succès', 'success')
      router.refresh()
    } catch (error) {
      const errorMsg = 'Une erreur est survenue'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/reports/${report.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: comment,
          isInternal,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        const errorMsg = data.error || 'Erreur lors de l\'ajout du commentaire'
        setError(errorMsg)
        showToast(errorMsg, 'error')
        return
      }

      setComment('')
      setIsInternal(false)
      showToast('Commentaire ajouté avec succès', 'success')
      router.refresh()
    } catch (error) {
      const errorMsg = 'Une erreur est survenue'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 border-t pt-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Assignation */}
      {!isAssigned && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Assignation</h3>
          <button
            onClick={handleAssign}
            disabled={loading}
            className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Assignation...
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Prendre en charge
              </>
            )}
          </button>
        </div>
      )}

      {/* Mise à jour du statut */}
      {isAssigned && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Mettre à jour le statut</h3>
          <div className="flex space-x-3">
            <label htmlFor="report-status" className="sr-only">Statut</label>
            <select
              id="report-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white"
              disabled={status === 'CLOS'}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {status !== report.status && status !== 'CLOS' && (
              <button
                onClick={handleStatusUpdate}
                disabled={loading}
                className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Mettre à jour
                  </>
                )}
              </button>
            )}
          </div>
          {status === 'CLOS' && (
            <p className="text-xs text-gray-500 mt-2">
              Le statut &quot;Clos&quot; est final et ne peut pas être modifié
            </p>
          )}
        </div>
      )}

      {/* Ajouter un commentaire */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Ajouter un commentaire</h3>
        <form onSubmit={handleAddComment} className="space-y-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white"
            placeholder="Votre commentaire..."
          />
          <div className="flex items-center space-x-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Commentaire interne</span>
            </label>
            <button
              type="submit"
              disabled={loading || !comment.trim()}
              className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Ajout...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

