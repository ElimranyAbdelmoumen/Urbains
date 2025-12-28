'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { formatName } from '@/lib/utils'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'CITOYEN':
        return 'Citoyen'
      case 'AGENT':
        return 'Agent'
      case 'ADMIN':
        return 'Administrateur'
      default:
        return role
    }
  }

  const getNavLinks = () => {
    if (!session) return []

    switch (session.user.role) {
      case 'CITOYEN':
        return [
          { href: '/dashboard', label: 'Mes signalements' },
          { href: '/dashboard/new', label: 'Nouveau signalement' },
        ]
      case 'AGENT':
        return [
          { href: '/agent', label: 'Signalements' },
        ]
      case 'ADMIN':
        return [
          { href: '/admin', label: 'Dashboard' },
          { href: '/admin/users', label: 'Utilisateurs' },
          { href: '/admin/categories', label: 'Catégories' },
        ]
      default:
        return []
    }
  }

  if (!session) return null

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                href="/" 
                className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
              >
                🏙️ Urbains
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {getNavLinks().map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    pathname === link.href
                      ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden lg:flex flex-col items-end mr-2">
              <span className="text-sm font-medium text-gray-900">
                {formatName(session.user.name) || session.user.email}
              </span>
              <span className="text-xs text-gray-500">
                {getRoleLabel(session.user.role)}
              </span>
            </div>
            <Link
              href={
                session.user.role === 'ADMIN'
                  ? '/admin/profile'
                  : session.user.role === 'AGENT'
                  ? '/agent/profile'
                  : '/dashboard/profile'
              }
              className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-lg transition-all duration-200 ${
                pathname?.includes('/profile')
                  ? 'border-indigo-500 text-indigo-700 bg-indigo-50 shadow-sm ring-2 ring-indigo-200'
                  : 'border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300 hover:shadow-sm'
              }`}
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="hidden sm:inline">Profil</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:shadow"
            >
              <svg
                className="h-4 w-4 mr-2 sm:mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

