import { prisma } from '@/config/database';
import { Prisma } from '@prisma/client';
import { logger } from '@/config/logger';

export interface CreateProjectInput {
  title: string;
  descriptionOriginal: string;
  location?: string;
  clientName?: string;
  companyId: string;
  createdByUserId: string;
}

export interface UpdateProjectInput {
  title?: string;
  descriptionOriginal?: string;
  descriptionEnhanced?: string;
  location?: string;
  clientName?: string;
  status?: 'DRAFT' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

export class ProjectService {
  /**
   * Create new project
   */
  async createProject(data: CreateProjectInput) {
    try {
      const project = await prisma.project.create({
        data: {
          title: data.title,
          descriptionOriginal: data.descriptionOriginal,
          location: data.location,
          clientName: data.clientName,
          companyId: data.companyId,
          createdByUserId: data.createdByUserId,
          status: 'DRAFT',
        },
        include: {
          company: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      logger.info(`Project created: ${project.id}`);
      return project;
    } catch (error) {
      logger.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  }

  /**
   * Get project by ID
   */
  async getProjectById(projectId: string, userId: string, userRole: string) {
    try {
      const where: Prisma.ProjectWhereInput = {
        id: projectId,
        ...(userRole !== 'ADMIN' && { createdByUserId: userId }),
      };

      const project = await prisma.project.findFirst({
        where,
        include: {
          company: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          images: {
            orderBy: [{ type: 'asc' }, { orderIndex: 'asc' }],
          },
        },
      });

      if (!project) {
        throw new Error('Project not found or access denied');
      }

      return project;
    } catch (error) {
      logger.error('Error fetching project:', error);
      throw error;
    }
  }

  /**
   * List projects with pagination
   */
  async listProjects(
    userId: string,
    userRole: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
    } = {}
  ) {
    try {
      const { page = 1, limit = 20, status } = options;
      const skip = (page - 1) * limit;

      const where: Prisma.ProjectWhereInput = {
        ...(userRole !== 'ADMIN' && { createdByUserId: userId }),
        ...(status && { status: status as any }),
      };

      const [projects, total] = await Promise.all([
        prisma.project.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            company: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            images: {
              select: {
                id: true,
                type: true,
                thumbnailUrl: true,
              },
              take: 4,
            },
          },
        }),
        prisma.project.count({ where }),
      ]);

      return {
        data: projects,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error listing projects:', error);
      throw new Error('Failed to list projects');
    }
  }

  /**
   * Update project
   */
  async updateProject(
    projectId: string,
    userId: string,
    userRole: string,
    data: UpdateProjectInput
  ) {
    try {
      // Verify ownership
      await this.getProjectById(projectId, userId, userRole);

      const project = await prisma.project.update({
        where: { id: projectId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          company: true,
          images: true,
        },
      });

      logger.info(`Project updated: ${project.id}`);
      return project;
    } catch (error) {
      logger.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string, userId: string, userRole: string) {
    try {
      // Verify ownership
      await this.getProjectById(projectId, userId, userRole);

      await prisma.project.delete({
        where: { id: projectId },
      });

      logger.info(`Project deleted: ${projectId}`);
    } catch (error) {
      logger.error('Error deleting project:', error);
      throw error;
    }
  }

  /**
   * Get project by presentation token (public)
   */
  async getProjectByToken(token: string) {
    try {
      const project = await prisma.project.findUnique({
        where: { presentationToken: token },
        include: {
          company: true,
          images: {
            orderBy: [{ type: 'asc' }, { orderIndex: 'asc' }],
          },
          deliveryNotes: {
            orderBy: { orderIndex: 'asc' },
          },
          technicalSheets: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      if (!project) {
        throw new Error('Presentation not found');
      }

      // Increment view count
      await prisma.project.update({
        where: { id: project.id },
        data: { viewCount: { increment: 1 } },
      });

      // Transform images to match frontend expectations
      const transformedProject = {
        ...project,
        beforeImages: project.images
          .filter(img => img.type === 'BEFORE')
          .map(img => ({
            id: img.id,
            url: img.fullUrl, // Use full size for display
            thumbnailUrl: img.thumbnailUrl,
            orderIndex: img.orderIndex,
          })),
        afterImages: project.images
          .filter(img => img.type === 'AFTER')
          .map(img => ({
            id: img.id,
            url: img.fullUrl, // Use full size for display
            thumbnailUrl: img.thumbnailUrl,
            orderIndex: img.orderIndex,
          })),
      };

      // Remove the original images array to avoid confusion
      delete (transformedProject as any).images;

      return transformedProject;
    } catch (error) {
      logger.error('Error fetching presentation:', error);
      throw error;
    }
  }

  /**
   * Update project status
   */
  async updateStatus(
    projectId: string,
    status: 'DRAFT' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
    errorMessage?: string
  ) {
    try {
      const data: any = {
        status,
        updatedAt: new Date(),
      };

      if (status === 'COMPLETED') {
        data.completedAt = new Date();
      }

      const project = await prisma.project.update({
        where: { id: projectId },
        data,
      });

      logger.info(`Project status updated: ${projectId} -> ${status}`);
      return project;
    } catch (error) {
      logger.error('Error updating project status:', error);
      throw error;
    }
  }
}

export const projectService = new ProjectService();
