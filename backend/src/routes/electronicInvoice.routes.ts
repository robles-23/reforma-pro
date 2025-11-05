import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { upload } from '@/middleware/upload';
import { electronicInvoiceController } from '@/controllers/electronicInvoice.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/projects/:projectId/electronic-invoices
 * Upload electronic invoice file for a project
 */
router.post(
  '/projects/:projectId/electronic-invoices',
  upload.array('files', 1),
  electronicInvoiceController.upload.bind(electronicInvoiceController)
);

/**
 * GET /api/v1/projects/:projectId/electronic-invoices
 * Get electronic invoices for a project
 */
router.get(
  '/projects/:projectId/electronic-invoices',
  electronicInvoiceController.getByProject.bind(electronicInvoiceController)
);

/**
 * DELETE /api/v1/electronic-invoices/:id
 * Delete specific electronic invoice
 */
router.delete(
  '/electronic-invoices/:id',
  electronicInvoiceController.delete.bind(electronicInvoiceController)
);

export default router;
