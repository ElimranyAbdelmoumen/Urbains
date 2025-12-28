import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    NOUVEAU: 'Nouveau',
    PRIS_EN_CHARGE: 'Pris en charge',
    EN_COURS: 'En cours',
    EN_ATTENTE_INFORMATIONS: 'En attente d\'informations',
    RESOLU: 'Résolu',
    CLOS: 'Clos',
    REJETE: 'Rejeté',
  }
  return labels[status] || status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NOUVEAU: 'bg-blue-600 text-white border-2 border-blue-700 shadow-md',
    PRIS_EN_CHARGE: 'bg-yellow-600 text-white border-2 border-yellow-700 shadow-md',
    EN_COURS: 'bg-indigo-600 text-white border-2 border-indigo-700 shadow-lg ring-2 ring-indigo-300',
    EN_ATTENTE_INFORMATIONS: 'bg-orange-600 text-white border-2 border-orange-700 shadow-md',
    RESOLU: 'bg-green-600 text-white border-2 border-green-700 shadow-md',
    CLOS: 'bg-gray-700 text-white border-2 border-gray-800 shadow-md',
    REJETE: 'bg-red-600 text-white border-2 border-red-700 shadow-md',
  }
  return colors[status] || 'bg-gray-600 text-white border-2 border-gray-700 shadow-md'
}

/**
 * Retourne la couleur de fond en hexadécimal pour un statut donné
 * Utilisé pour garantir la couleur via style inline
 */
export function getStatusBgColor(status: string): string {
  const colors: Record<string, string> = {
    NOUVEAU: '#2563eb',      // blue-600
    PRIS_EN_CHARGE: '#ca8a04', // yellow-600
    EN_COURS: '#4f46e5',     // indigo-600
    EN_ATTENTE_INFORMATIONS: '#ea580c', // orange-600
    RESOLU: '#16a34a',       // green-600
    CLOS: '#374151',         // gray-700
    REJETE: '#dc2626',       // red-600
  }
  return colors[status] || '#4b5563' // gray-600
}

export function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    NOUVEAU: '🆕',
    PRIS_EN_CHARGE: '👤',
    EN_COURS: '⚙️',
    EN_ATTENTE_INFORMATIONS: '⏳',
    RESOLU: '✅',
    CLOS: '🔒',
    REJETE: '❌',
  }
  return icons[status] || '📋'
}

/**
 * Formate un nom en majuscules pour un meilleur affichage
 * @param name - Le nom à formater
 * @returns Le nom en majuscules ou une valeur par défaut
 */
export function formatName(name: string | null | undefined): string {
  if (!name) return 'Non renseigné'
  return name.toUpperCase()
}

