import sharp from 'sharp';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME, CDN_URL } from '@/config/s3';
import { prisma } from '@/config/database';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { nanoid } from 'nanoid';

export interface ProcessedDeliveryNote {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  fileName: string;
  fileSize: number;
  orderIndex: number;
}

export class DeliveryNoteService {
  /**
   * Process and upload delivery note image
   */
  async processAndUpload(
    file: Express.Multer.File,
    projectId: string,
    orderIndex: number
  ): Promise<ProcessedDeliveryNote> {
    try {
      const noteId = nanoid();
      const extension = 'webp';

      // Generate image and thumbnail
      const [image, thumbnail] = await Promise.all([
        // Main image (1920px max)
        sharp(file.buffer)
          .resize(env.FULL_SIZE, null, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: env.IMAGE_QUALITY })
          .toBuffer(),

        // Thumbnail (200px)
        sharp(file.buffer)
          .resize(env.THUMBNAIL_SIZE, env.THUMBNAIL_SIZE, { fit: 'cover' })
          .webp({ quality: 80 })
          .toBuffer(),
      ]);

      // S3 keys
      const imageKey = `projects/${projectId}/delivery-notes/${noteId}.${extension}`;
      const thumbnailKey = `projects/${projectId}/delivery-notes/${noteId}-thumb.${extension}`;

      // Upload to S3
      await Promise.all([
        this.uploadToS3(imageKey, image, 'image/webp'),
        this.uploadToS3(thumbnailKey, thumbnail, 'image/webp'),
      ]);

      const imageUrl = `${CDN_URL}/${imageKey}`;
      const thumbnailUrl = `${CDN_URL}/${thumbnailKey}`;

      // Save to database
      const deliveryNote = await prisma.deliveryNote.create({
        data: {
          projectId,
          imageUrl,
          thumbnailUrl,
          fileName: file.originalname,
          fileSize: file.size,
          orderIndex,
        },
      });

      logger.info(`Delivery note uploaded: ${noteId}`);

      return {
        id: deliveryNote.id,
        imageUrl: deliveryNote.imageUrl,
        thumbnailUrl: deliveryNote.thumbnailUrl!,
        fileName: deliveryNote.fileName,
        fileSize: deliveryNote.fileSize,
        orderIndex: deliveryNote.orderIndex,
      };
    } catch (error) {
      logger.error('Error processing delivery note:', error);
      throw error;
    }
  }

  /**
   * Upload buffer to S3
   */
  private async uploadToS3(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<void> {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000',
      })
    );
  }

  /**
   * Get delivery notes for a project
   */
  async getByProjectId(projectId: string): Promise<ProcessedDeliveryNote[]> {
    const notes = await prisma.deliveryNote.findMany({
      where: { projectId },
      orderBy: { orderIndex: 'asc' },
    });

    return notes.map((note) => ({
      id: note.id,
      imageUrl: note.imageUrl,
      thumbnailUrl: note.thumbnailUrl!,
      fileName: note.fileName,
      fileSize: note.fileSize,
      orderIndex: note.orderIndex,
    }));
  }

  /**
   * Delete delivery note
   */
  async delete(id: string): Promise<void> {
    await prisma.deliveryNote.delete({
      where: { id },
    });
    logger.info(`Delivery note deleted: ${id}`);
  }
}

export const deliveryNoteService = new DeliveryNoteService();
