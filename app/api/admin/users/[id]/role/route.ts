import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const roleSchema = z.enum(['CITOYEN', 'AGENT', 'ADMIN'])

export async function PATCH(
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

    const body = await request.json()
    const parsed = roleSchema.parse(body)
    const role = parsed as 'CITOYEN' | 'AGENT' | 'ADMIN'

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role },
    })

    return NextResponse.json({
      message: 'Rôle mis à jour avec succès',
      user: { ...user, password: undefined },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      )
    }

    console.error('Role update error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour' },
      { status: 500 }
    )
  }
}

