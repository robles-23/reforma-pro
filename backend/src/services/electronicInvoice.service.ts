import sharp from 'sharp';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME, CDN_URL } from '@/config/s3';
import { prisma } from '@/config/database';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { nanoid } from 'nanoid';

export interface ProcessedElectronicInvoice {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  fileName: string;
  fileSize: number;
  orderIndex: number;
}

export class ElectronicInvoiceService {
  /**
   * Process and upload electronic invoice file
   */
  async processAndUpload(
    file: Express.Multer.File,
    projectId: string,
    orderIndex: number
  ): Promise<ProcessedElectronicInvoice> {
    try {
      const electronicInvoiceId = nanoid();
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
      const imageKey = `projects/${projectId}/electronic-invoices/${electronicInvoiceId}.${extension}`;
      const thumbnailKey = `projects/${projectId}/electronic-invoices/${electronicInvoiceId}-thumb.${extension}`;

      // Upload to S3
      await Promise.all([
        this.uploadToS3(imageKey, image, 'image/webp'),
        this.uploadToS3(thumbnailKey, thumbnail, 'image/webp'),
      ]);

      const imageUrl = `${CDN_URL}/${imageKey}`;
      const thumbnailUrl = `${CDN_URL}/${thumbnailKey}`;

      // Save to database
      const electronicInvoice = await prisma.electronicInvoice.create({
        data: {
          projectId,
          imageUrl,
          thumbnailUrl,
          fileName: file.originalname,
          fileSize: file.size,
          orderIndex,
        },
      });

      logger.info(`Electronic invoice uploaded: ${electronicInvoiceId}`);

      return {
        id: electronicInvoice.id,
        imageUrl: electronicInvoice.imageUrl,
        thumbnailUrl: electronicInvoice.thumbnailUrl!,
        fileName: electronicInvoice.fileName,
        fileSize: electronicInvoice.fileSize,
        orderIndex: electronicInvoice.orderIndex,
      };
    } catch (error) {
      logger.error('Error processing electronic invoice:', error);
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
   * Get electronic invoices for a project
   */
  async getByProjectId(projectId: string): Promise<ProcessedElectronicInvoice[]> {
    const electronicInvoices = await prisma.electronicInvoice.findMany({
      where: { projectId },
      orderBy: { orderIndex: 'asc' },
    });

    return electronicInvoices.map((electronicInvoice) => ({
      id: electronicInvoice.id,
      imageUrl: electronicInvoice.imageUrl,
      thumbnailUrl: electronicInvoice.thumbnailUrl!,
      fileName: electronicInvoice.fileName,
      fileSize: electronicInvoice.fileSize,
      orderIndex: electronicInvoice.orderIndex,
    }));
  }

  /**
   * Delete electronic invoice
   */
  async delete(id: string): Promise<void> {
    await prisma.electronicInvoice.delete({
      where: { id },
    });
    logger.info(`Electronic invoice deleted: ${id}`);
  }
}

export const electronicInvoiceService = new ElectronicInvoiceService();
