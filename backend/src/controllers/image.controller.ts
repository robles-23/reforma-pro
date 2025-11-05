import { Request, Response } from 'express';
import { imageService } from '@/services/image.service';
import { projectService } from '@/services/project.service';
import { logger } from '@/config/logger';

export class ImageController {
  /**
   * Upload before images
   */
  async uploadBefore(req: Request, res: Response) {
    try {
      const { projectId } = req.body;
      const user = req.user!;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files uploaded',
        });
      }

      // Verify project exists and user has access
      await projectService.getProjectById(projectId, user.id, user.role);

      // Check existing image count
      const existingCount = await imageService.getImageCount(projectId, 'BEFORE');
      if (existingCount + files.length > 20) {
        return res.status(400).json({
          success: false,
          error: `Cannot upload more than 20 before images. Current: ${existingCount}`,
        });
      }

      // Process and upload each image
      const uploadedImages = await Promise.all(
        files.map(async (file, index) => {
          const processed = await imageService.processAndUpload(file, projectId, 'BEFORE');
          const image = await imageService.saveImageMetadata(
            projectId,
            'BEFORE',
            file.originalname,
            processed,
            existingCount + index
          );
          return image;
        })
      );

      logger.info(`Uploaded ${uploadedImages.length} before images for project ${projectId}`);

      res.json({
        success: true,
        data: {
          images: uploadedImages,
          count: uploadedImages.length,
        },
      });
    } catch (error) {
      logger.error('Error uploading before images:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload images',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Upload after images
   */
  async uploadAfter(req: Request, res: Response) {
    try {
      const { projectId } = req.body;
      const user = req.user!;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files uploaded',
        });
      }

      // Verify project exists and user has access
      await projectService.getProjectById(projectId, user.id, user.role);

      // Check existing image count
      const existingCount = await imageService.getImageCount(projectId, 'AFTER');
      if (existingCount + files.length > 20) {
        return res.status(400).json({
          success: false,
          error: `Cannot upload more than 20 after images. Current: ${existingCount}`,
        });
      }

      // Process and upload each image
      const uploadedImages = await Promise.all(
        files.map(async (file, index) => {
          const processed = await imageService.processAndUpload(file, projectId, 'AFTER');
          const image = await imageService.saveImageMetadata(
            projectId,
            'AFTER',
            file.originalname,
            processed,
            existingCount + index
          );
          return image;
        })
      );

      logger.info(`Uploaded ${uploadedImages.length} after images for project ${projectId}`);

      res.json({
        success: true,
        data: {
          images: uploadedImages,
          count: uploadedImages.length,
        },
      });
    } catch (error) {
      logger.error('Error uploading after images:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload images',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Delete image
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user!;

      await imageService.deleteImage(id, user.id, user.role);

      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting image:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to delete image',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const imageController = new ImageController();
