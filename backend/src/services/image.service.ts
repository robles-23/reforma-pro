import sharp from 'sharp';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME, generateS3Key, CDN_URL } from '@/config/s3';
import { prisma } from '@/config/database';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { nanoid } from 'nanoid';

export interface ProcessedImage {
  original: string;
  thumbnail: string;
  medium: string;
  full: string;
  width: number;
  height: number;
  size: number;
}

export class ImageService {
  /**
   * Process and upload image
   */
  async processAndUpload(
    file: Express.Multer.File,
    projectId: string,
    _type: 'BEFORE' | 'AFTER'
  ): Promise<ProcessedImage> {
    try {
      const imageId = nanoid();
      const extension = 'webp'; // Convert all to WebP for optimal size

      // Get original dimensions
      const metadata = await sharp(file.buffer).metadata();
      const originalWidth = metadata.width!;
      const originalHeight = metadata.height!;

      // Generate different sizes
      const [original, thumbnail, medium, full] = await Promise.all([
        // Original (convert to WebP, compress)
        sharp(file.buffer)
          .webp({ quality: env.IMAGE_QUALITY })
          .toBuffer(),

        // Thumbnail (200px)
        sharp(file.buffer)
          .resize(env.THUMBNAIL_SIZE, env.THUMBNAIL_SIZE, { fit: 'cover' })
          .webp({ quality: 80 })
          .toBuffer(),

        // Medium (800px)
        sharp(file.buffer)
          .resize(env.MEDIUM_SIZE, null, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: env.IMAGE_QUALITY })
          .toBuffer(),

        // Full (1920px)
        sharp(file.buffer)
          .resize(env.FULL_SIZE, null, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: env.IMAGE_QUALITY })
          .toBuffer(),
      ]);

      // Upload all versions to S3
      const keys = {
        original: generateS3Key(projectId, imageId, 'original', extension),
        thumbnail: generateS3Key(projectId, imageId, 'thumbnail', extension),
        medium: generateS3Key(projectId, imageId, 'medium', extension),
        full: generateS3Key(projectId, imageId, 'full', extension),
      };

      await Promise.all([
        this.uploadToS3(keys.original, original, 'image/webp'),
        this.uploadToS3(keys.thumbnail, thumbnail, 'image/webp'),
        this.uploadToS3(keys.medium, medium, 'image/webp'),
        this.uploadToS3(keys.full, full, 'image/webp'),
      ]);

      logger.info(`Images processed and uploaded: ${imageId}`);

      return {
        original: `${CDN_URL}/${keys.original}`,
        thumbnail: `${CDN_URL}/${keys.thumbnail}`,
        medium: `${CDN_URL}/${keys.medium}`,
        full: `${CDN_URL}/${keys.full}`,
        width: originalWidth,
        height: originalHeight,
        size: original.length,
      };
    } catch (error) {
      logger.error('Error processing image:', error);
      throw new Error('Failed to process image');
    }
  }

  /**
   * Upload buffer to S3
   */
  private async uploadToS3(key: string, buffer: Buffer, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    });

    await s3Client.send(command);
  }

  /**
   * Save image metadata to database
   */
  async saveImageMetadata(
    projectId: string,
    type: 'BEFORE' | 'AFTER',
    fileName: string,
    processedImage: ProcessedImage,
    orderIndex: number
  ) {
    try {
      const image = await prisma.image.create({
        data: {
          projectId,
          type,
          fileName,
          originalUrl: processedImage.original,
          thumbnailUrl: processedImage.thumbnail,
          mediumUrl: processedImage.medium,
          fullUrl: processedImage.full,
          fileSize: processedImage.size,
          width: processedImage.width,
          height: processedImage.height,
          format: 'webp',
          orderIndex,
        },
      });

      logger.info(`Image metadata saved: ${image.id}`);
      return image;
    } catch (error) {
      logger.error('Error saving image metadata:', error);
      throw new Error('Failed to save image metadata');
    }
  }

  /**
   * Delete image
   */
  async deleteImage(imageId: string, userId: string, userRole: string) {
    try {
      const image = await prisma.image.findUnique({
        where: { id: imageId },
        include: {
          project: true,
        },
      });

      if (!image) {
        throw new Error('Image not found');
      }

      // Verify ownership
      if (userRole !== 'ADMIN' && image.project.createdByUserId !== userId) {
        throw new Error('Access denied');
      }

      // Delete from database
      await prisma.image.delete({
        where: { id: imageId },
      });

      // TODO: Delete from S3 (optional - can keep for backup)

      logger.info(`Image deleted: ${imageId}`);
    } catch (error) {
      logger.error('Error deleting image:', error);
      throw error;
    }
  }

  /**
   * Get project images count
   */
  async getImageCount(projectId: string, type?: 'BEFORE' | 'AFTER') {
    const where: any = { projectId };
    if (type) {
      where.type = type;
    }

    return await prisma.image.count({ where });
  }
}

export const imageService = new ImageService();
