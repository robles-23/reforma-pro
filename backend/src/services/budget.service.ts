import sharp from 'sharp';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME, CDN_URL } from '@/config/s3';
import { prisma } from '@/config/database';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { nanoid } from 'nanoid';

export interface ProcessedBudget {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  fileName: string;
  fileSize: number;
  orderIndex: number;
}

export class BudgetService {
  /**
   * Process and upload budget file (supports images and PDFs)
   */
  async processAndUpload(
    file: Express.Multer.File,
    projectId: string,
    orderIndex: number
  ): Promise<ProcessedBudget> {
    try {
      const budgetId = nanoid();

      // Check if file is PDF
      const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');

      if (isPdf) {
        // Upload PDF directly (like technical sheets)
        const extension = 'pdf';
        const pdfKey = `projects/${projectId}/budgets/${budgetId}.${extension}`;

        await this.uploadToS3(pdfKey, file.buffer, 'application/pdf');

        const pdfUrl = `${CDN_URL}/${pdfKey}`;

        // Save to database (use pdfUrl for both imageUrl and thumbnailUrl for consistency)
        const budget = await prisma.budget.create({
          data: {
            projectId,
            imageUrl: pdfUrl,
            thumbnailUrl: pdfUrl,
            fileName: file.originalname,
            fileSize: file.size,
            orderIndex,
          },
        });

        logger.info(`Budget PDF uploaded: ${budgetId}`);

        return {
          id: budget.id,
          imageUrl: budget.imageUrl,
          thumbnailUrl: budget.thumbnailUrl!,
          fileName: budget.fileName,
          fileSize: budget.fileSize,
          orderIndex: budget.orderIndex,
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
        const imageKey = `projects/${projectId}/budgets/${budgetId}.${extension}`;
        const thumbnailKey = `projects/${projectId}/budgets/${budgetId}-thumb.${extension}`;

        // Upload to S3
        await Promise.all([
          this.uploadToS3(imageKey, image, 'image/webp'),
          this.uploadToS3(thumbnailKey, thumbnail, 'image/webp'),
        ]);

        const imageUrl = `${CDN_URL}/${imageKey}`;
        const thumbnailUrl = `${CDN_URL}/${thumbnailKey}`;

        // Save to database
        const budget = await prisma.budget.create({
          data: {
            projectId,
            imageUrl,
            thumbnailUrl,
            fileName: file.originalname,
            fileSize: file.size,
            orderIndex,
          },
        });

        logger.info(`Budget image uploaded: ${budgetId}`);

        return {
          id: budget.id,
          imageUrl: budget.imageUrl,
          thumbnailUrl: budget.thumbnailUrl!,
          fileName: budget.fileName,
          fileSize: budget.fileSize,
          orderIndex: budget.orderIndex,
        };
      }
    } catch (error) {
      logger.error('Error processing budget:', error);
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
   * Get budgets for a project
   */
  async getByProjectId(projectId: string): Promise<ProcessedBudget[]> {
    const budgets = await prisma.budget.findMany({
      where: { projectId },
      orderBy: { orderIndex: 'asc' },
    });

    return budgets.map((budget) => ({
      id: budget.id,
      imageUrl: budget.imageUrl,
      thumbnailUrl: budget.thumbnailUrl!,
      fileName: budget.fileName,
      fileSize: budget.fileSize,
      orderIndex: budget.orderIndex,
    }));
  }

  /**
   * Delete budget
   */
  async delete(id: string): Promise<void> {
    await prisma.budget.delete({
      where: { id },
    });
    logger.info(`Budget deleted: ${id}`);
  }
}

export const budgetService = new BudgetService();
