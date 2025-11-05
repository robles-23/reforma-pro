import { Request, Response } from 'express';
import { z } from 'zod';
import { projectService } from '@/services/project.service';
import { queueProjectProcessing } from '@/jobs/queue';
import { logger } from '@/config/logger';

// Validation schemas
const createProjectSchema = z.object({
  title: z.string().min(1).max(500),
  descriptionOriginal: z.string().min(10).max(5000),
  location: z.string().max(500).optional(),
  clientName: z.string().max(255).optional(),
  storeCode: z.string().max(100).optional(),
});

const updateProjectSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  descriptionOriginal: z.string().min(10).max(5000).optional(),
  location: z.string().max(500).optional(),
  clientName: z.string().max(255).optional(),
  storeCode: z.string().max(100).optional(),
});

export class ProjectController {
  /**
   * Create new project
   */
  async create(req: Request, res: Response) {
    try {
      const data = createProjectSchema.parse(req.body);
      const user = req.user!;

      const project = await projectService.createProject({
        ...data,
        companyId: user.companyId,
        createdByUserId: user.id,
      });

      res.status(201).json({
        success: true,
        data: project,
      });
    } catch (error) {
      logger.error('Error creating project:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to create project',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * List projects
   */
  async list(req: Request, res: Response) {
    try {
      const user = req.user!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;

      const result = await projectService.listProjects(user.id, user.role, {
        page,
        limit,
        status,
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      logger.error('Error listing projects:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list projects',
      });
    }
  }

  /**
   * Get project by ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user!;

      const project = await projectService.getProjectById(id, user.id, user.role);

      res.json({
        success: true,
        data: project,
      });
    } catch (error) {
      logger.error('Error fetching project:', error);
      res.status(404).json({
        success: false,
        error: 'Project not found',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update project
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user!;
      const data = updateProjectSchema.parse(req.body);

      const project = await projectService.updateProject(id, user.id, user.role, data);

      res.json({
        success: true,
        data: project,
      });
    } catch (error) {
      logger.error('Error updating project:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to update project',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Delete project
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user!;

      await projectService.deleteProject(id, user.id, user.role);

      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting project:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to delete project',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Generate AI-enhanced presentation
   */
  async generate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user!;

      // Verify project exists and user has access
      const project = await projectService.getProjectById(id, user.id, user.role);

      // Queue processing job
      const job = await queueProjectProcessing(id);

      res.json({
        success: true,
        message: 'Processing started',
        data: {
          projectId: id,
          jobId: job.id,
          presentationToken: project.presentationToken,
          estimatedTime: 30, // seconds
        },
      });
    } catch (error) {
      logger.error('Error generating presentation:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to start processing',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get processing status
   */
  async getStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user!;

      const project = await projectService.getProjectById(id, user.id, user.role);

      res.json({
        success: true,
        data: {
          projectId: id,
          status: project.status,
          presentationToken: project.presentationToken,
          presentationUrl:
            project.status === 'COMPLETED'
              ? `/p/${project.presentationToken}`
              : null,
        },
      });
    } catch (error) {
      logger.error('Error fetching status:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to fetch status',
      });
    }
  }
}

export const projectController = new ProjectController();
