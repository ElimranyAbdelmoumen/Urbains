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

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-500">Total: {users.length} utilisateurs</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all duration-200"
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
              Nouvel utilisateur
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Créer un utilisateur</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="user-name" className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                id="user-name"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 bg-white"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="user-email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="user-email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 bg-white"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="user-password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input
                id="user-password"
                type="password"
                required
                minLength={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 bg-white"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="user-role" className="block text-sm font-medium text-gray-700">Rôle</label>
              <select
                id="user-role"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 bg-white"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="CITOYEN">Citoyen</option>
                <option value="AGENT">Agent</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Création...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Créer
                </>
              )}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {formatName(user.name)}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Créé le {formatDate(user.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <label htmlFor={`user-role-${user.id}`} className="sr-only">Rôle</label>
                  <select
                    id={`user-role-${user.id}`}
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="text-sm rounded-md border-gray-300 text-gray-900 bg-white"
                  >
                    <option value="CITOYEN">Citoyen</option>
                    <option value="AGENT">Agent</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="inline-flex items-center text-red-600 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

