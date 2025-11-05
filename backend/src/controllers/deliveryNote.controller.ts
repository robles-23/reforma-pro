import { Request, Response } from 'express';
import { deliveryNoteService } from '@/services/deliveryNote.service';
import { projectService } from '@/services/project.service';
import { logger } from '@/config/logger';

export class DeliveryNoteController {
  /**
   * Upload delivery note images
   */
  async upload(req: Request, res: Response): Promise<any> {
    try {
      const { projectId } = req.params;
      const user = req.user!;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files uploaded',
        });
      }

      if (files.length > 2) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 2 images allowed for delivery notes',
        });
      }

      // Verify project exists and user has access
      await projectService.getProjectById(projectId, user.id, user.role);

      // Check if delivery notes already exist
      const existing = await deliveryNoteService.getByProjectId(projectId);
      if (existing.length + files.length > 2) {
        return res.status(400).json({
          success: false,
          error: `Maximum 2 delivery note images allowed. Current: ${existing.length}`,
        });
      }

      // Process and upload each image
      const uploadedNotes = await Promise.all(
        files.map((file, index) =>
          deliveryNoteService.processAndUpload(file, projectId, existing.length + index)
        )
      );

      logger.info(`Uploaded ${uploadedNotes.length} delivery notes for project ${projectId}`);

      res.json({
        success: true,
        data: {
          deliveryNotes: uploadedNotes,
          count: uploadedNotes.length,
        },
      });
    } catch (error) {
      logger.error('Error uploading delivery notes:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload delivery notes',
      });
    }
  }

  /**
   * Get delivery notes for a project
   */
  async getByProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const user = req.user!;

      // Verify project exists and user has access
      await projectService.getProjectById(projectId, user.id, user.role);

      const deliveryNotes = await deliveryNoteService.getByProjectId(projectId);

      res.json({
        success: true,
        data: { deliveryNotes },
      });
    } catch (error) {
      logger.error('Error getting delivery notes:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get delivery notes',
      });
    }
  }

  /**
   * Delete delivery note
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Verify user has access (through project)
      // TODO: Add authorization check

      await deliveryNoteService.delete(id);

      logger.info(`Delivery note deleted: ${id}`);

      res.json({
        success: true,
        message: 'Delivery note deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting delivery note:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete delivery note',
      });
    }
  }
}

export const deliveryNoteController = new DeliveryNoteController();
