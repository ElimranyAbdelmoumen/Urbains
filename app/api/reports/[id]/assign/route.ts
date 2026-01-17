import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
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

    const { agentId } = await request.json()

    const report = await prisma.report.findUnique({
      where: { id: params.id },
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Signalement non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour le signalement
    const updatedReport = await prisma.report.update({
      where: { id: params.id },
      data: {
        agentId,
        status: report.status === 'NOUVEAU' ? 'PRIS_EN_CHARGE' : report.status,
      },
    })

    // Créer l'entrée d'historique si le statut a changé
    if (updatedReport.status !== report.status) {
      await prisma.reportHistory.create({
        data: {
          reportId: updatedReport.id,
          status: updatedReport.status,
          changedBy: session.user.id,
        },
      })
    }

    return NextResponse.json({
      message: 'Signalement assigné avec succès',
      report: updatedReport,
    })
  } catch (error) {
    console.error('Assign error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}



