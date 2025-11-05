import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { uploadPDF } from '@/middleware/upload';
import { technicalSheetController } from '@/controllers/technicalSheet.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/projects/:projectId/technical-sheets
 * Upload technical sheet PDFs for a project
 */
router.post(
  '/projects/:projectId/technical-sheets',
  uploadPDF.array('pdfs', 10),
  technicalSheetController.upload.bind(technicalSheetController)
);

/**
 * GET /api/v1/projects/:projectId/technical-sheets
 * Get technical sheets for a project
 */
router.get(
  '/projects/:projectId/technical-sheets',
  technicalSheetController.getByProject.bind(technicalSheetController)
);

/**
 * DELETE /api/v1/technical-sheets/:id
 * Delete specific technical sheet
 */
router.delete(
  '/technical-sheets/:id',
  technicalSheetController.delete.bind(technicalSheetController)
);

export default router;
