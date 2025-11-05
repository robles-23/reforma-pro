import sharp from 'sharp';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME, CDN_URL } from '@/config/s3';
import { prisma } from '@/config/database';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { nanoid } from 'nanoid';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from 'canvas';

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
   * Convert PDF first page to image buffer
   */
  private async convertPdfToImage(pdfBuffer: Buffer): Promise<Buffer> {
    try {
      // Load PDF
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(pdfBuffer),
        useSystemFonts: true,
      });
      const pdf = await loadingTask.promise;

      // Get first page
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for better quality

      // Create canvas
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');

      // Render PDF page to canvas
      await page.render({
        canvasContext: context as any,
        viewport: viewport,
      }).promise;

      // Convert canvas to buffer
      return canvas.toBuffer('image/png');
    } catch (error) {
      logger.error('Error converting PDF to image:', error);
      throw new Error('Failed to convert PDF to image');
    }
  }

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
      const extension = 'webp';

      let imageBuffer: Buffer;

      // Check if file is PDF
      const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');

      if (isPdf) {
        logger.info('Processing PDF electronic invoice file...');
        // Convert PDF to image first
        const pngBuffer = await this.convertPdfToImage(file.buffer);
        imageBuffer = pngBuffer;
      } else {
        // It's already an image
        imageBuffer = file.buffer;
      }

      // Generate image and thumbnail using Sharp
      const [image, thumbnail] = await Promise.all([
        // Main image (1920px max)
        sharp(imageBuffer)
          .resize(env.FULL_SIZE, null, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: env.IMAGE_QUALITY })
          .toBuffer(),

        // Thumbnail (200px)
        sharp(imageBuffer)
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

      logger.info(`Electronic invoice uploaded: ${invoiceId} (${isPdf ? 'PDF converted to image' : 'image'})`);

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
