import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const reportUpdateSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  categoryId: z.string().min(1, 'La catégorie est requise'),
  location: z.string().min(1, 'La localisation est requise'),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'CITOYEN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const report = await prisma.report.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        status: 'NOUVEAU', // Seuls les signalements NOUVEAU peuvent être modifiés
      },
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Signalement non trouvé ou non modifiable' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const categoryId = formData.get('categoryId') as string
    const location = formData.get('location') as string
    const photo = formData.get('photo') as File | null

    // Validation
    const validated = reportUpdateSchema.parse({
      title,
      description,
      categoryId,
      location,
    })

    let photoPath: string | null = report.photo

    // Gestion de l'upload de photo si une nouvelle est fournie
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

      // Supprimer l'ancienne photo si elle existe
      if (report.photo) {
        try {
          const oldPhotoPath = join(process.cwd(), 'public', report.photo)
          if (existsSync(oldPhotoPath)) {
            await unlink(oldPhotoPath)
          }
        } catch (error) {
          console.error('Error deleting old photo:', error)
        }
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

    // Mettre à jour le signalement
    const updatedReport = await prisma.report.update({
      where: { id: params.id },
      data: {
        title: validated.title,
        description: validated.description,
        categoryId: validated.categoryId,
        location: validated.location,
        photo: photoPath,
      },
    })

    return NextResponse.json({
      message: 'Signalement mis à jour avec succès',
      report: updatedReport,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Report update error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'CITOYEN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const report = await prisma.report.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        status: 'NOUVEAU', // Seuls les signalements NOUVEAU peuvent être supprimés
      },
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Signalement non trouvé ou non supprimable' },
        { status: 404 }
      )
    }

    // Supprimer la photo si elle existe
    if (report.photo) {
      try {
        const photoPath = join(process.cwd(), 'public', report.photo)
        if (existsSync(photoPath)) {
          await unlink(photoPath)
        }
      } catch (error) {
        console.error('Error deleting photo:', error)
      }
    }

    // Supprimer le signalement (les relations seront supprimées en cascade)
    await prisma.report.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Signalement supprimé avec succès',
    })
  } catch (error) {
    console.error('Report deletion error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression' },
      { status: 500 }
    )
  }
}



