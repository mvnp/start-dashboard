import jwt, { SignOptions } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'; // 7 days for refresh token

// Helper function to generate secure refresh token
function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

// Helper function to calculate expiration date
function getRefreshTokenExpiry(): Date {
  const now = new Date();
  const expiryDays = parseInt(REFRESH_TOKEN_EXPIRES_IN.replace('d', '')) || 7;
  return new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000);
}

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
        entrepreneurId?: number | null;
      };
      userId?: number;
    }
  }
}

export interface JWTPayload {
  id: number;
  email: string;
  role: string;
  entrepreneurId?: number | null;
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: User login
 *     description: Authenticate user and return JWT token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password with bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      entrepreneurId: user.entrepreneurId
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);
    
    // Generate and store refresh token
    const refreshToken = generateRefreshToken();
    await storage.createRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry()
    });

    res.json({
      accessToken,
      refreshToken,
      expiresIn: JWT_EXPIRES_IN,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        entrepreneurId: user.entrepreneurId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     tags: [Authentication]
 *     summary: Verify JWT token
 *     description: Verify the validity of a JWT token and return user information
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function verifyToken(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No user found in request' });
    }

    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token
 *     description: Generate a new access token using a valid refresh token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *                 example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: New access token
 *                 refreshToken:
 *                   type: string
 *                   description: New refresh token
 *                 expiresIn:
 *                   type: string
 *                   description: Access token expiration time
 *       401:
 *         description: Invalid or expired refresh token
 *       400:
 *         description: Bad request
 */
export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Clean expired tokens
    await storage.cleanExpiredTokens();

    // Validate refresh token
    const storedToken = await storage.getRefreshToken(refreshToken);
    if (!storedToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Check if token is expired
    if (new Date() > storedToken.expiresAt) {
      await storage.revokeRefreshToken(refreshToken);
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    // Get user details
    const user = await storage.getUser(storedToken.userId);
    if (!user) {
      await storage.revokeRefreshToken(refreshToken);
      return res.status(401).json({ error: 'User not found' });
    }

    // Revoke old refresh token for security (token rotation)
    await storage.revokeRefreshToken(refreshToken);

    // Generate new tokens
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      entrepreneurId: user.entrepreneurId
    };

    const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);
    const newRefreshToken = generateRefreshToken();

    // Store new refresh token
    await storage.createRefreshToken({
      token: newRefreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry()
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: JWT_EXPIRES_IN
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: User logout
 *     description: Logout user and revoke refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token to revoke
 *                 example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
 *               logoutFromAllDevices:
 *                 type: boolean
 *                 description: Whether to logout from all devices
 *                 default: false
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout successful"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken, logoutFromAllDevices } = req.body;

    if (logoutFromAllDevices && req.user) {
      // Logout from all devices - revoke all user's refresh tokens
      await storage.revokeAllUserTokens(req.user.id);
      return res.json({ message: 'Logged out from all devices successfully' });
    }

    if (refreshToken) {
      // Logout from current device - revoke specific refresh token
      await storage.revokeRefreshToken(refreshToken);
      return res.json({ message: 'Logout successful' });
    }

    // If no refresh token provided but user is authenticated, revoke all tokens
    if (req.user) {
      await storage.revokeAllUserTokens(req.user.id);
      return res.json({ message: 'Logout successful' });
    }

    return res.status(400).json({ error: 'No valid logout method provided' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout from all devices
 *     description: Revoke all refresh tokens for the authenticated user
 *     responses:
 *       200:
 *         description: Logout from all devices successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logged out from all devices successfully"
 *                 revokedTokens:
 *                   type: integer
 *                   description: Number of tokens revoked
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
 */
export async function logoutFromAllDevices(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const success = await storage.revokeAllUserTokens(req.user.id);
    
    if (success) {
      res.json({ 
        message: 'Logged out from all devices successfully'
      });
    } else {
      res.json({ 
        message: 'No active sessions found'
      });
    }
  } catch (error) {
    console.error('Logout from all devices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// JWT Authentication Middleware
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const payload = decoded as JWTPayload;
    req.user = payload;
    req.userId = payload.id; // For backward compatibility
    next();
  });
}

// Role-based authorization middleware
export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Check if user is entrepreneur or super-admin
export function authorizeEntrepreneurOrAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!['entrepreneur', 'super-admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Entrepreneur or admin access required' });
  }

  next();
}

// Check if user owns the resource or is super-admin
export function authorizeResourceOwner(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Super-admin can access everything
  if (req.user.role === 'super-admin') {
    return next();
  }

  // Entrepreneurs can only access their own resources
  if (req.user.role === 'entrepreneur') {
    return next(); // Additional checks should be done in the route handlers
  }

  return res.status(403).json({ error: 'Access denied' });
}