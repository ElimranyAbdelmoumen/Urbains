import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const commentSchema = z.object({
  content: z.string().min(1, 'Le commentaire ne peut pas être vide'),
  isInternal: z.boolean().default(false),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Seuls les agents et admins peuvent ajouter des commentaires
    if (session.user.role !== 'AGENT' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Seuls les agents peuvent ajouter des commentaires' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { content, isInternal } = commentSchema.parse(body)

    // Vérifier que le signalement existe
    const report = await prisma.report.findUnique({
      where: { id: params.id },
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Signalement non trouvé' },
        { status: 404 }
      )
    }

    // Créer le commentaire
    const comment = await prisma.comment.create({
      data: {
        content,
        isInternal,
        reportId: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      message: 'Commentaire ajouté avec succès',
      comment,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Comment creation error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}


