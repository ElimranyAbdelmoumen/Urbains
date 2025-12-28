import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const statusSchema = z.enum([
  'NOUVEAU',
  'PRIS_EN_CHARGE',
  'EN_COURS',
  'EN_ATTENTE_INFORMATIONS',
  'RESOLU',
  'CLOS',
  'REJETE',
])

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'AGENT' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    // Le body contient { status: 'EN_COURS' }, donc on parse body.status
    const status = statusSchema.parse(body.status) as 'NOUVEAU' | 'PRIS_EN_CHARGE' | 'EN_COURS' | 'EN_ATTENTE_INFORMATIONS' | 'RESOLU' | 'CLOS' | 'REJETE'

    const report = await prisma.report.findUnique({
      where: { id: params.id },
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Signalement non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que le statut n'est pas CLOS (final)
    if (report.status === 'CLOS') {
      return NextResponse.json(
        { error: 'Le statut "Clos" est final et ne peut pas être modifié' },
        { status: 400 }
      )
    }

    // Mettre à jour le statut
    const updatedReport = await prisma.report.update({
      where: { id: params.id },
      data: { status },
    })

    // Créer l'entrée d'historique
    await prisma.reportHistory.create({
      data: {
        reportId: updatedReport.id,
        status,
        changedBy: session.user.id,
      },
    })

    return NextResponse.json({
      message: 'Statut mis à jour avec succès',
      report: updatedReport,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      )
    }

    console.error('Status update error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

