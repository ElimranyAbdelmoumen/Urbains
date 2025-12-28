import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional().nullable(),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description } = categorySchema.parse(body)

    // Vérifier si la catégorie existe déjà
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Cette catégorie existe déjà' },
        { status: 400 }
      )
    }

    // Créer la catégorie
    const category = await prisma.category.create({
      data: {
        name,
        description: description || null,
      },
    })

    return NextResponse.json(
      { message: 'Catégorie créée avec succès', category },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Category creation error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création' },
      { status: 500 }
    )
  }
}

