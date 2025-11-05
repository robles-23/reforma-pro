import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { upload } from '@/middleware/upload';
import { deliveryNoteController } from '@/controllers/deliveryNote.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/projects/:projectId/delivery-notes
 * Upload delivery note images for a project
 */
router.post(
  '/projects/:projectId/delivery-notes',
  upload.array('images', 2),
  deliveryNoteController.upload.bind(deliveryNoteController)
);

/**
 * GET /api/v1/projects/:projectId/delivery-notes
 * Get delivery notes for a project
 */
router.get(
  '/projects/:projectId/delivery-notes',
  deliveryNoteController.getByProject.bind(deliveryNoteController)
);

/**
 * DELETE /api/v1/delivery-notes/:id
 * Delete specific delivery note
 */
router.delete(
  '/delivery-notes/:id',
  deliveryNoteController.delete.bind(deliveryNoteController)
);

export default router;
