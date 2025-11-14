import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { FirebaseService } from '../firebase/firebase.service'
import { v4 as uuidv4 } from 'uuid'

@Controller('uploads')
export class UploadsController {
  constructor(private firebaseService: FirebaseService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file provided')
    }

    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ]
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only images are allowed.',
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit')
    }

    // Generate unique filename
    const fileExtension = file.originalname.split('.').pop() || 'jpg'
    const fileName = `images/${uuidv4()}.${fileExtension}`

    try {
      const publicUrl = await this.firebaseService.uploadImage(file, fileName)
      return { url: publicUrl }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload image'
      throw new BadRequestException(`Failed to upload image: ${errorMessage}`)
    }
  }
}
