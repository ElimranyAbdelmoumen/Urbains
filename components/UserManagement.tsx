'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate, formatName } from '@/lib/utils'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: Date
}

interface UserManagementProps {
  users: User[]
}

// Fonction pour obtenir les couleurs et icônes des rôles
function getRoleStyle(role: string) {
  const styles: Record<string, { bg: string; text: string; icon: string; label: string }> = {
    ADMIN: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      icon: '👑',
      label: 'Administrateur',
    },
    AGENT: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: '👮',
      label: 'Agent',
    },
    CITOYEN: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: '👤',
      label: 'Citoyen',
    },
  }
  return styles[role] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: '👤', label: role }
}

export default function UserManagement({ users: initialUsers }: UserManagementProps) {
  const router = useRouter()
  const [users, setUsers] = useState(initialUsers)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CITOYEN',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la création')
        return
      }

      setFormData({ name: '', email: '', password: '', role: 'CITOYEN' })
      setShowForm(false)
      router.refresh()
    } catch (error) {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        alert('Erreur lors de la suppression')
        return
      }

      router.refresh()
    } catch (error) {
      alert('Une erreur est survenue')
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        alert('Erreur lors de la modification du rôle')
        return
      }

      router.refresh()
    } catch (error) {
      alert('Une erreur est survenue')
    }
  }

  // Compter les utilisateurs par rôle
  const usersByRole = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Utilisateurs</h2>
            <p className="text-gray-600">
              <span className="font-semibold text-indigo-600">{users.length}</span> utilisateur{users.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
          >
            {showForm ? (
              <>
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Annuler
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                + Nouvel utilisateur
              </>
            )}
          </button>
        </div>

        {/* Statistiques par rôle */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['ADMIN', 'AGENT', 'CITOYEN'].map((role) => {
            const style = getRoleStyle(role)
            const count = usersByRole[role] || 0
            return (
              <div key={role} className={`${style.bg} ${style.text} rounded-lg p-4 border-2 border-transparent hover:border-opacity-50 transition-all`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-80">{style.label}s</p>
                    <p className="text-2xl font-bold mt-1">{count}</p>
                  </div>
                  <span className="text-3xl">{style.icon}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-in slide-in-from-top-2 duration-300">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="h-6 w-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Créer un utilisateur
          </h2>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-medium">Erreur</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="user-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  id="user-name"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white transition-all"
                  placeholder="Jean Dupont"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="user-email"
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white transition-all"
                  placeholder="jean.dupont@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="user-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <input
                  id="user-password"
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white transition-all"
                  placeholder="Minimum 6 caractères"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="user-role" className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <select
                  id="user-role"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white transition-all"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="CITOYEN">👤 Citoyen</option>
                  <option value="AGENT">👮 Agent</option>
                  <option value="ADMIN">👑 Administrateur</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto inline-flex items-center justify-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Création en cours...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Créer l'utilisateur
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Liste des utilisateurs</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {users.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="mt-4 text-sm text-gray-500">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            users.map((user) => {
              const roleStyle = getRoleStyle(user.role)
              return (
                <div
                  key={user.id}
                  className="px-6 py-5 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className={`flex-shrink-0 h-12 w-12 rounded-full ${roleStyle.bg} flex items-center justify-center text-xl`}>
                        {roleStyle.icon}
                      </div>
                      
                      {/* Informations utilisateur */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <p className="text-base font-semibold text-gray-900 truncate">
                            {formatName(user.name) || 'Sans nom'}
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleStyle.bg} ${roleStyle.text}`}>
                            <span className="mr-1">{roleStyle.icon}</span>
                            {roleStyle.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 truncate">{user.email}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center">
                          <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Créé le {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3 ml-4">
                      <div className="relative">
                        <label htmlFor={`user-role-${user.id}`} className="sr-only">Changer le rôle</label>
                        <select
                          id={`user-role-${user.id}`}
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className={`appearance-none px-4 py-2 pr-8 rounded-lg border-2 border-gray-300 ${roleStyle.text} ${roleStyle.bg} font-medium text-sm cursor-pointer hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all`}
                        >
                          <option value="CITOYEN">👤 Citoyen</option>
                          <option value="AGENT">👮 Agent</option>
                          <option value="ADMIN">👑 Administrateur</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                          <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all duration-200 border border-red-200 hover:border-red-300"
                        title="Supprimer l'utilisateur"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
