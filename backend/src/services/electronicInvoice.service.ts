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
   * Process and upload electronic invoice file (supports images and PDFs)
   */
  async processAndUpload(
    file: Express.Multer.File,
    projectId: string,
    orderIndex: number
  ): Promise<ProcessedElectronicInvoice> {
    try {
      const invoiceId = nanoid();

      // Check if file is PDF
      const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');

      if (isPdf) {
        // Upload PDF directly (like technical sheets)
        const extension = 'pdf';
        const pdfKey = `projects/${projectId}/electronic-invoices/${invoiceId}.${extension}`;

        await this.uploadToS3(pdfKey, file.buffer, 'application/pdf');

        const pdfUrl = `${CDN_URL}/${pdfKey}`;

        // Save to database (use pdfUrl for both imageUrl and thumbnailUrl for consistency)
        const invoice = await prisma.electronicInvoice.create({
          data: {
            projectId,
            imageUrl: pdfUrl,
            thumbnailUrl: pdfUrl,
            fileName: file.originalname,
            fileSize: file.size,
            orderIndex,
          },
        });

        logger.info(`Electronic invoice PDF uploaded: ${invoiceId}`);

        return {
          id: invoice.id,
          imageUrl: invoice.imageUrl,
          thumbnailUrl: invoice.thumbnailUrl!,
          fileName: invoice.fileName,
          fileSize: invoice.fileSize,
          orderIndex: invoice.orderIndex,
        };
      } else {
        // It's an image - process with Sharp
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
        const imageKey = `projects/${projectId}/electronic-invoices/${invoiceId}.${extension}`;
        const thumbnailKey = `projects/${projectId}/electronic-invoices/${invoiceId}-thumb.${extension}`;

        // Upload to S3
        await Promise.all([
          this.uploadToS3(imageKey, image, 'image/webp'),
          this.uploadToS3(thumbnailKey, thumbnail, 'image/webp'),
        ]);

        const imageUrl = `${CDN_URL}/${imageKey}`;
        const thumbnailUrl = `${CDN_URL}/${thumbnailKey}`;

        // Save to database
        const invoice = await prisma.electronicInvoice.create({
          data: {
            projectId,
            imageUrl,
            thumbnailUrl,
            fileName: file.originalname,
            fileSize: file.size,
            orderIndex,
          },
        });

        logger.info(`Electronic invoice image uploaded: ${invoiceId}`);

        return {
          id: invoice.id,
          imageUrl: invoice.imageUrl,
          thumbnailUrl: invoice.thumbnailUrl!,
          fileName: invoice.fileName,
          fileSize: invoice.fileSize,
          orderIndex: invoice.orderIndex,
        };
      }
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
        ContentDisposition: 'inline', // Display in browser instead of download
      })
    );
  }

  /**
   * Get electronic invoices for a project
   */
  async getByProjectId(projectId: string): Promise<ProcessedElectronicInvoice[]> {
    const invoices = await prisma.electronicInvoice.findMany({
      where: { projectId },
      orderBy: { orderIndex: 'asc' },
    });

    return invoices.map((invoice) => ({
      id: invoice.id,
      imageUrl: invoice.imageUrl,
      thumbnailUrl: invoice.thumbnailUrl!,
      fileName: invoice.fileName,
      fileSize: invoice.fileSize,
      orderIndex: invoice.orderIndex,
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
