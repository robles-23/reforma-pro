import { nanoid } from 'nanoid';
import { prisma } from '@/config/database';
import { hashPassword, verifyPassword } from '@/utils/password';
import { generateAccessToken, generateRefreshToken } from '@/utils/jwt';
import { logger } from '@/config/logger';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    companyId: string;
  };
}

export class AuthService {
  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<LoginResult> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokenId = nanoid();
    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    });

    const refreshToken = generateRefreshToken({
      sub: user.id,
      tokenId,
    });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        id: tokenId,
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    logger.info(`User logged in: ${user.email}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify refresh token
    const { verifyRefreshToken } = await import('@/utils/jwt');
    const payload = verifyRefreshToken(refreshToken);

    // Check if token exists and is not revoked
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        id: payload.tokenId,
        token: refreshToken,
        revokedAt: null,
        expiresAt: { gte: new Date() },
      },
      include: { user: true },
    });

    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    // Check if user is still active
    if (!storedToken.user.isActive) {
      throw new Error('User account is inactive');
    }

    // Revoke old refresh token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    const newTokenId = nanoid();
    const newAccessToken = generateAccessToken({
      sub: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
      companyId: storedToken.user.companyId,
    });

    const newRefreshToken = generateRefreshToken({
      sub: storedToken.user.id,
      tokenId: newTokenId,
    });

    // Store new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        id: newTokenId,
        userId: storedToken.user.id,
        token: newRefreshToken,
        expiresAt,
      },
    });

    logger.info(`Token refreshed for user: ${storedToken.user.email}`);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout user (revoke refresh token)
   */
  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    });

    logger.info('User logged out');
  }

  /**
   * Register new user (admin only in production)
   */
  async register(data: {
    email: string;
    password: string;
    name: string;
    role: 'ADMIN' | 'WORKER';
    companyId: string;
  }): Promise<{ id: string; email: string; name: string; role: string }> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role,
        companyId: data.companyId,
      },
    });

    logger.info(`New user registered: ${user.email}`);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}

export const authService = new AuthService();
