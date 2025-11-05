import { Queue, Worker, Job } from 'bullmq';
import { redis } from '@/config/redis';
import { projectService } from '@/services/project.service';
import { imageService } from '@/services/image.service';
import { aiService } from '@/services/ai.service';
import { logger } from '@/config/logger';

// Job data types
export interface ProcessProjectJobData {
  projectId: string;
}

// Create queue
export const processProjectQueue = new Queue<ProcessProjectJobData>('process-project', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});

// Create worker
export const processProjectWorker = new Worker<ProcessProjectJobData>(
  'process-project',
  async (job: Job<ProcessProjectJobData>) => {
    const { projectId } = job.data;
    const startTime = Date.now();

    try {
      logger.info(`Processing project: ${projectId}`);

      // Update status to processing
      await projectService.updateStatus(projectId, 'PROCESSING');

      // Get project data
      const project = await projectService.getProjectById(projectId, '', 'ADMIN');

      // Count images
      const beforeCount = await imageService.getImageCount(projectId, 'BEFORE');
      const afterCount = await imageService.getImageCount(projectId, 'AFTER');

      // Enhance description with AI (fallback to original if AI fails)
      let enhancedDescription = project.descriptionOriginal;
      try {
        enhancedDescription = await aiService.enhanceDescription(
          project.descriptionOriginal,
          project.title,
          { before: beforeCount, after: afterCount }
        );
        logger.info(`AI enhancement successful for project: ${projectId}`);
      } catch (aiError) {
        logger.warn(`AI enhancement failed for project ${projectId}, using original description:`, aiError);
        // Continue with original description - don't fail the whole job
      }

      // Update project with enhanced description
      await projectService.updateProject(projectId, '', 'ADMIN', {
        descriptionEnhanced: enhancedDescription,
        status: 'COMPLETED',
      });

      const processingTime = Date.now() - startTime;

      logger.info(`Project processed successfully: ${projectId}`, {
        processingTime,
        beforeImages: beforeCount,
        afterImages: afterCount,
      });

      return {
        success: true,
        projectId,
        processingTime,
      };
    } catch (error) {
      logger.error(`Error processing project ${projectId}:`, error);

      // Update status to failed
      await projectService.updateStatus(
        projectId,
        'FAILED',
        error instanceof Error ? error.message : 'Unknown error'
      );

      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 5, // Process 5 projects concurrently
  }
);

// Worker event handlers
processProjectWorker.on('completed', (job) => {
  logger.info(`Job completed: ${job.id}`);
});

processProjectWorker.on('failed', (job, err) => {
  logger.error(`Job failed: ${job?.id}`, err);
});

processProjectWorker.on('error', (err) => {
  logger.error('Worker error:', err);
});

/**
 * Add job to queue
 */
export async function queueProjectProcessing(projectId: string) {
  const job = await processProjectQueue.add('process-project', { projectId });
  logger.info(`Job queued: ${job.id} for project: ${projectId}`);
  return job;
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string) {
  const job = await processProjectQueue.getJob(jobId);
  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress;

  return {
    id: job.id,
    state,
    progress,
    data: job.data,
  };
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await processProjectWorker.close();
  await processProjectQueue.close();
});

export default {
  processProjectQueue,
  processProjectWorker,
  queueProjectProcessing,
  getJobStatus,
};
