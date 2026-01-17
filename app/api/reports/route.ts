import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const reportSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  categoryId: z.string().min(1, 'La catégorie est requise'),
  location: z.string().min(1, 'La localisation est requise'),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'CITOYEN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const categoryId = formData.get('categoryId') as string
    const location = formData.get('location') as string
    const photo = formData.get('photo') as File | null

    // Validation
    const validated = reportSchema.parse({
      title,
      description,
      categoryId,
      location,
    })

    let photoPath: string | null = null

    // Gestion de l'upload de photo
    if (photo && photo.size > 0) {
      const bytes = await photo.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(photo.type)) {
        return NextResponse.json(
          { error: 'Type de fichier non autorisé. Utilisez JPEG, PNG ou WebP' },
          { status: 400 }
        )
      }

      // Vérifier la taille (max 5MB)
      if (photo.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'La photo ne doit pas dépasser 5MB' },
          { status: 400 }
        )
      }

      // Créer le dossier uploads s'il n'existe pas
      const uploadsDir = join(process.cwd(), 'public', 'uploads')
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }

      // Générer un nom de fichier unique
      const timestamp = Date.now()
      const extension = photo.name.split('.').pop()
      const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`
      photoPath = `/uploads/${filename}`

      // Sauvegarder le fichier
      const filepath = join(uploadsDir, filename)
      await writeFile(filepath, buffer)
    }

    // Créer le signalement
    const report = await prisma.report.create({
      data: {
        title: validated.title,
        description: validated.description,
        categoryId: validated.categoryId,
        location: validated.location,
        photo: photoPath,
        userId: session.user.id,
        status: 'NOUVEAU',
      },
    })

    // Créer l'entrée d'historique
    await prisma.reportHistory.create({
      data: {
        reportId: report.id,
        status: 'NOUVEAU',
        changedBy: session.user.id,
      },
    })

    return NextResponse.json(
      { message: 'Signalement créé avec succès', report },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Report creation error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du signalement' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = session.user.role

    let reports

    if (role === 'CITOYEN') {
      reports = await prisma.report.findMany({
        where: { userId: session.user.id },
        include: {
          category: true,
          agent: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    } else if (role === 'AGENT' || role === 'ADMIN') {
      reports = await prisma.report.findMany({
        include: {
          category: true,
          creator: { select: { name: true, email: true } },
          agent: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      return NextResponse.json(
        { error: 'Rôle non autorisé' },
        { status: 403 }
      )
    }

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}



