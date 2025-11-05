import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME, CDN_URL } from '@/config/s3';
import { prisma } from '@/config/database';
import { logger } from '@/config/logger';
import { nanoid } from 'nanoid';

export interface ProcessedTechnicalSheet {
  id: string;
  productName: string;
  pdfUrl: string;
  fileName: string;
  fileSize: number;
  orderIndex: number;
}

export class TechnicalSheetService {
  /**
   * Upload technical sheet PDF
   */
  async upload(
    file: Express.Multer.File,
    projectId: string,
    productName: string,
    orderIndex: number
  ): Promise<ProcessedTechnicalSheet> {
    try {
      const sheetId = nanoid();
      const extension = 'pdf';

      // S3 key
      const pdfKey = `projects/${projectId}/technical-sheets/${sheetId}.${extension}`;

      // Upload PDF to S3
      await this.uploadToS3(pdfKey, file.buffer, 'application/pdf');

      const pdfUrl = `${CDN_URL}/${pdfKey}`;

      // Save to database
      const technicalSheet = await prisma.technicalSheet.create({
        data: {
          projectId,
          productName,
          pdfUrl,
          fileName: file.originalname,
          fileSize: file.size,
          orderIndex,
        },
      });

      logger.info(`Technical sheet uploaded: ${sheetId} for product: ${productName}`);

      return {
        id: technicalSheet.id,
        productName: technicalSheet.productName,
        pdfUrl: technicalSheet.pdfUrl,
        fileName: technicalSheet.fileName,
        fileSize: technicalSheet.fileSize,
        orderIndex: technicalSheet.orderIndex,
      };
    } catch (error) {
      logger.error('Error uploading technical sheet:', error);
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
   * Get technical sheets for a project
   */
  async getByProjectId(projectId: string): Promise<ProcessedTechnicalSheet[]> {
    const sheets = await prisma.technicalSheet.findMany({
      where: { projectId },
      orderBy: { orderIndex: 'asc' },
    });

    return sheets.map((sheet) => ({
      id: sheet.id,
      productName: sheet.productName,
      pdfUrl: sheet.pdfUrl,
      fileName: sheet.fileName,
      fileSize: sheet.fileSize,
      orderIndex: sheet.orderIndex,
    }));
  }

  /**
   * Delete technical sheet
   */
  async delete(id: string): Promise<void> {
    await prisma.technicalSheet.delete({
      where: { id },
    });
    logger.info(`Technical sheet deleted: ${id}`);
  }
}

export const technicalSheetService = new TechnicalSheetService();
