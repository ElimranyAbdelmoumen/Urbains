import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/LandingPage'

export default async function Home() {
  const session = await getServerSession(authOptions)

  // Si l'utilisateur est connecté, rediriger selon son rôle
  if (session) {
    if (session.user.role === 'ADMIN') {
      redirect('/admin')
    } else if (session.user.role === 'AGENT') {
      redirect('/agent')
    } else {
      redirect('/dashboard')
    }
  }

  // Si non connecté, afficher la landing page
  return <LandingPage />
}
