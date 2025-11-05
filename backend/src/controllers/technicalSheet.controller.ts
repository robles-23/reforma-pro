import { Request, Response } from 'express';
import { technicalSheetService } from '@/services/technicalSheet.service';
import { projectService } from '@/services/project.service';
import { logger } from '@/config/logger';

export class TechnicalSheetController {
  /**
   * Upload technical sheet PDFs
   */
  async upload(req: Request, res: Response): Promise<any> {
    try {
      const { projectId } = req.params;
      const user = req.user!;
      const files = req.files as Express.Multer.File[];
      const { productNames } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files uploaded',
        });
      }

      if (files.length > 10) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 10 PDFs allowed for technical sheets',
        });
      }

      // Parse product names
      let names: string[];
      try {
        names = typeof productNames === 'string' ? JSON.parse(productNames) : productNames;
      } catch {
        return res.status(400).json({
          success: false,
          error: 'Invalid product names format',
        });
      }

      if (!Array.isArray(names) || names.length !== files.length) {
        return res.status(400).json({
          success: false,
          error: 'Product names count must match files count',
        });
      }

      // Validate product names
      if (names.some((name) => !name || typeof name !== 'string' || name.trim().length === 0)) {
        return res.status(400).json({
          success: false,
          error: 'All product names must be non-empty strings',
        });
      }

      // Verify project exists and user has access
      await projectService.getProjectById(projectId, user.id, user.role);

      // Check if technical sheets already exist
      const existing = await technicalSheetService.getByProjectId(projectId);
      if (existing.length + files.length > 10) {
        return res.status(400).json({
          success: false,
          error: `Maximum 10 technical sheets allowed. Current: ${existing.length}`,
        });
      }

      // Upload each PDF
      const uploadedSheets = await Promise.all(
        files.map((file, index) =>
          technicalSheetService.upload(
            file,
            projectId,
            names[index].trim(),
            existing.length + index
          )
        )
      );

      logger.info(`Uploaded ${uploadedSheets.length} technical sheets for project ${projectId}`);

      res.json({
        success: true,
        data: {
          technicalSheets: uploadedSheets,
          count: uploadedSheets.length,
        },
      });
    } catch (error) {
      logger.error('Error uploading technical sheets:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload technical sheets',
      });
    }
  }

  /**
   * Get technical sheets for a project
   */
  async getByProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const user = req.user!;

      // Verify project exists and user has access
      await projectService.getProjectById(projectId, user.id, user.role);

      const technicalSheets = await technicalSheetService.getByProjectId(projectId);

      res.json({
        success: true,
        data: { technicalSheets },
      });
    } catch (error) {
      logger.error('Error getting technical sheets:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get technical sheets',
      });
    }
  }

  /**
   * Delete technical sheet
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Verify user has access (through project)
      // TODO: Add authorization check

      await technicalSheetService.delete(id);

      logger.info(`Technical sheet deleted: ${id}`);

      res.json({
        success: true,
        message: 'Technical sheet deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting technical sheet:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete technical sheet',
      });
    }
  }
}

export const technicalSheetController = new TechnicalSheetController();
