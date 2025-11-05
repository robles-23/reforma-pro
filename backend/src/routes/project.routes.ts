import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { projectController } from '@/controllers/project.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/projects
 * List user's projects
 */
router.get('/', projectController.list.bind(projectController));

/**
 * POST /api/v1/projects
 * Create new project
 */
router.post('/', projectController.create.bind(projectController));

/**
 * GET /api/v1/projects/:id
 * Get project by ID
 */
router.get('/:id', projectController.getById.bind(projectController));

/**
 * PATCH /api/v1/projects/:id
 * Update project
 */
router.patch('/:id', projectController.update.bind(projectController));

/**
 * DELETE /api/v1/projects/:id
 * Delete project
 */
router.delete('/:id', projectController.delete.bind(projectController));

/**
 * POST /api/v1/projects/:id/generate
 * Trigger AI generation for project
 */
router.post('/:id/generate', projectController.generate.bind(projectController));

/**
 * GET /api/v1/projects/:id/status
 * Get project processing status
 */
router.get('/:id/status', projectController.getStatus.bind(projectController));

export default router;
