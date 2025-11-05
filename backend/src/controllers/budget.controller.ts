import { Request, Response } from 'express';
import { budgetService } from '@/services/budget.service';
import { projectService } from '@/services/project.service';
import { logger } from '@/config/logger';

export class BudgetController {
  /**
   * Upload budget file
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
          error: 'Maximum 1 budget file allowed',
        });
      }

      // Verify project exists and user has access
      await projectService.getProjectById(projectId, user.id, user.role);

      // Check if budget already exists
      const existing = await budgetService.getByProjectId(projectId);
      if (existing.length + files.length > 1) {
        return res.status(400).json({
          success: false,
          error: `Maximum 1 budget file allowed. Current: ${existing.length}`,
        });
      }

      // Process and upload each file
      const uploadedBudgets = await Promise.all(
        files.map((file, index) =>
          budgetService.processAndUpload(file, projectId, existing.length + index)
        )
      );

      logger.info(`Uploaded ${uploadedBudgets.length} budget for project ${projectId}`);

      res.json({
        success: true,
        data: {
          budgets: uploadedBudgets,
          count: uploadedBudgets.length,
        },
      });
    } catch (error) {
      logger.error('Error uploading budget:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload budget',
      });
    }
  }

  /**
   * Get budgets for a project
   */
  async getByProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const user = req.user!;

      // Verify project exists and user has access
      await projectService.getProjectById(projectId, user.id, user.role);

      const budgets = await budgetService.getByProjectId(projectId);

      res.json({
        success: true,
        data: { budgets },
      });
    } catch (error) {
      logger.error('Error getting budgets:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get budgets',
      });
    }
  }

  /**
   * Delete budget
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Verify user has access (through project)
      // TODO: Add authorization check

      await budgetService.delete(id);

      logger.info(`Budget deleted: ${id}`);

      res.json({
        success: true,
        message: 'Budget deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting budget:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete budget',
      });
    }
  }
}

export const budgetController = new BudgetController();
