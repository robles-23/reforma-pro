import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { upload } from '@/middleware/upload';
import { imageController } from '@/controllers/image.controller';

const router = Router();

/**
 * GET /api/v1/images/proxy
 * Proxy images from R2 to bypass CORS/SSL issues
 * No authentication required for public presentations
 */
router.get('/proxy', async (req, res) => {
  try {
    const imageUrl = req.query.url as string;

    if (!imageUrl) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Fetch image from R2
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch image' });
    }

    // Get content type
    const contentType = response.headers.get('content-type') || 'image/webp';

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Stream the image
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy image' });
  }
});

// All routes below require authentication
router.use(authenticate);

/**
 * POST /api/v1/images/upload/before
 * Upload before images for a project
 */
router.post(
  '/upload/before',
  upload.array('images', 20),
  imageController.uploadBefore.bind(imageController)
);

/**
 * POST /api/v1/images/upload/after
 * Upload after images for a project
 */
router.post(
  '/upload/after',
  upload.array('images', 20),
  imageController.uploadAfter.bind(imageController)
);

/**
 * DELETE /api/v1/images/:id
 * Delete specific image
 */
router.delete('/:id', imageController.delete.bind(imageController));

export default router;
