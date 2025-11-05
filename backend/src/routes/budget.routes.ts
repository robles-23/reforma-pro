import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { upload } from '@/middleware/upload';
import { budgetController } from '@/controllers/budget.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/projects/:projectId/budgets
 * Upload budget file for a project
 */
router.post(
  '/projects/:projectId/budgets',
  upload.array('files', 1),
  budgetController.upload.bind(budgetController)
);

/**
 * GET /api/v1/projects/:projectId/budgets
 * Get budgets for a project
 */
router.get(
  '/projects/:projectId/budgets',
  budgetController.getByProject.bind(budgetController)
);

/**
 * DELETE /api/v1/budgets/:id
 * Delete specific budget
 */
router.delete(
  '/budgets/:id',
  budgetController.delete.bind(budgetController)
);

export default router;
