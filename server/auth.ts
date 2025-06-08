import jwt, { SignOptions } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

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

    // For demo purposes, we'll use a simple check
    // In production, you should hash passwords and store them securely
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Simple password check (in production, use bcrypt)
    if (password !== 'password123') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      entrepreneurId: user.entrepreneurId
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);

    res.json({
      token,
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