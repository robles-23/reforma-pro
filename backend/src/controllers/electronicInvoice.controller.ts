import { Request, Response } from 'express';
import { electronicInvoiceService } from '@/services/electronicInvoice.service';
import { projectService } from '@/services/project.service';
import { logger } from '@/config/logger';

export class ElectronicInvoiceController {
  /**
   * Upload electronic invoice file
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

      if (files.length > 1) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 1 electronic invoice file allowed',
        });
      }

      // Verify project exists and user has access
      await projectService.getProjectById(projectId, user.id, user.role);

      // Check if electronic invoice already exists
      const existing = await electronicInvoiceService.getByProjectId(projectId);
      if (existing.length + files.length > 1) {
        return res.status(400).json({
          success: false,
          error: `Maximum 1 electronic invoice file allowed. Current: ${existing.length}`,
        });
      }

      // Process and upload each file
      const uploadedElectronicInvoices = await Promise.all(
        files.map((file, index) =>
          electronicInvoiceService.processAndUpload(file, projectId, existing.length + index)
        )
      );

      logger.info(`Uploaded ${uploadedElectronicInvoices.length} electronic invoice for project ${projectId}`);

      res.json({
        success: true,
        data: {
          electronicInvoices: uploadedElectronicInvoices,
          count: uploadedElectronicInvoices.length,
        },
      });
    } catch (error) {
      logger.error('Error uploading electronic invoice:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload electronic invoice',
      });
    }
  }

  /**
   * Get electronic invoices for a project
   */
  async getByProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const user = req.user!;

      // Verify project exists and user has access
      await projectService.getProjectById(projectId, user.id, user.role);

      const electronicInvoices = await electronicInvoiceService.getByProjectId(projectId);

      res.json({
        success: true,
        data: { electronicInvoices },
      });
    } catch (error) {
      logger.error('Error getting electronic invoices:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get electronic invoices',
      });
    }
  }

  /**
   * Delete electronic invoice
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Verify user has access (through project)
      // TODO: Add authorization check

      await electronicInvoiceService.delete(id);

      logger.info(`Electronic invoice deleted: ${id}`);

      res.json({
        success: true,
        message: 'Electronic invoice deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting electronic invoice:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete electronic invoice',
      });
    }
  }
}

export const electronicInvoiceController = new ElectronicInvoiceController();
