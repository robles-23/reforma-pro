import { Router, Request, Response } from 'express';
import { projectService } from '@/services/project.service';
import { prisma } from '@/config/database';
import { logger } from '@/config/logger';

const router = Router();

/**
 * GET /api/v1/presentations/:token
 * Get public presentation (no auth required)
 */
router.get('/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const project = await projectService.getProjectByToken(token);

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    logger.error('Error fetching presentation:', error);
    res.status(404).json({
      success: false,
      error: 'Presentation not found',
    });
  }
});

/**
 * POST /api/v1/presentations/:token/analytics
 * Track analytics event for presentation
 */
router.post('/:token/analytics', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { eventType, metadata } = req.body;

    // Find project by token
    const project = await prisma.project.findUnique({
      where: { presentationToken: token },
      select: { id: true },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Presentation not found',
      });
    }

    // Track analytics event
    await prisma.analyticsEvent.create({
      data: {
        projectId: project.id,
        eventType: eventType.toUpperCase(),
        metadata: metadata || {},
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        referrer: req.headers.referer,
      },
    });

    // Update share count if event is 'share'
    if (eventType === 'share') {
      await prisma.project.update({
        where: { id: project.id },
        data: { shareCount: { increment: 1 } },
      });
    }

    res.json({
      success: true,
      message: 'Event tracked',
    });
  } catch (error) {
    logger.error('Error tracking analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track event',
    });
  }
});

export default router;
