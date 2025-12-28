'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from './ToastProvider'

interface Category {
  id: string
  name: string
  description: string | null
}

interface Report {
  id: string
  title: string
  description: string
  categoryId: string
  location: string
  photo: string | null
}

interface EditReportFormProps {
  report: Report
  categories: Category[]
}

export default function EditReportForm({ report, categories }: EditReportFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    title: report.title,
    description: report.description,
    categoryId: report.categoryId,
    location: report.location,
    photo: null as File | null,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, photo: e.target.files[0] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.categoryId) {
      setError('Veuillez sélectionner une catégorie')
      setLoading(false)
      return
    }

    try {
      const data = new FormData()
      data.append('title', formData.title)
      data.append('description', formData.description)
      data.append('categoryId', formData.categoryId)
      data.append('location', formData.location)
      if (formData.photo) {
        data.append('photo', formData.photo)
      }

      const response = await fetch(`/api/reports/${report.id}`, {
        method: 'PATCH',
        body: data,
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMsg = result.error || 'Une erreur est survenue'
        setError(errorMsg)
        showToast(errorMsg, 'error')
        setLoading(false)
        return
      }

      showToast('Signalement modifié avec succès', 'success')
      router.push(`/dashboard/reports/${report.id}`)
      router.refresh()
    } catch (error) {
      const errorMsg = 'Une erreur est survenue'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer ce signalement ?\n\nCette action est irréversible.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/reports/${report.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorMsg = 'Erreur lors de la suppression'
        setError(errorMsg)
        showToast(errorMsg, 'error')
        setLoading(false)
        return
      }

      showToast('Signalement supprimé avec succès', 'success')
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      const errorMsg = 'Une erreur est survenue'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Titre *
          </label>
          <input
            type="text"
            id="title"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Catégorie *
          </label>
          <select
            id="category"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Localisation *
          </label>
          <input
            type="text"
            id="location"
            required
            placeholder="Ex: Rue de la République, 75001 Paris"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
            Photo (optionnelle)
          </label>
          {report.photo && (
            <div className="mb-2">
              <p className="text-sm text-gray-500 mb-1">Photo actuelle:</p>
              <div className="relative w-32 h-32">
                <Image src={report.photo} alt="Current" fill className="object-cover rounded" />
              </div>
            </div>
          )}
          <input
            type="file"
            id="photo"
            accept="image/*"
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 shadow-sm transition-all duration-200"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Supprimer
          </button>
          <div className="flex space-x-3">
            <Link
              href={`/dashboard/reports/${report.id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all duration-200"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Enregistrement...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

