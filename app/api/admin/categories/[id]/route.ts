import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Vérifier si la catégorie est utilisée
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            reports: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      )
    }

    if (category._count.reports > 0) {
      return NextResponse.json(
        { error: 'Cette catégorie est utilisée par des signalements et ne peut pas être supprimée' },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id: params.id },
    })

    return NextResponse.json(
      { message: 'Catégorie supprimée avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Category deletion error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression' },
      { status: 500 }
    )
  }
}


