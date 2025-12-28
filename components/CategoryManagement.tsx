'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  description: string | null
  _count: {
    reports: number
  }
}

interface CategoryManagementProps {
  categories: Category[]
}

export default function CategoryManagement({ categories: initialCategories }: CategoryManagementProps) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la création')
        return
      }

      setFormData({ name: '', description: '' })
      setShowForm(false)
      router.refresh()
    } catch (error) {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
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

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-500">Total: {categories.length} catégories</p>
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
              Nouvelle catégorie
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Créer une catégorie</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="category-name" className="block text-sm font-medium text-gray-700">Nom *</label>
              <input
                id="category-name"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 bg-white"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="category-description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="category-description"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 bg-white"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
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
          {categories.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500">
              Aucune catégorie
            </li>
          ) : (
            categories.map((category) => (
              <li key={category.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{category.name}</p>
                    {category.description && (
                      <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {category._count.reports} signalement(s)
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="inline-flex items-center text-red-600 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}

