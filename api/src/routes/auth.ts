import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword, signToken, signEmailVerifyToken, verifyEmailToken } from '../lib/auth';
import { sendVerificationEmail } from '../services/notification';
import { requireAuth } from '../middleware/auth';
import { AuthRequest } from '../types/express';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash },
    });

    const verifyToken = signEmailVerifyToken(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verifyToken,
        verifyTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await sendVerificationEmail(email, verifyToken);

    const token = signToken(user.id);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, verified: false, plan: user.plan },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = signToken(user.id);
    res.json({
      token,
      user: { id: user.id, email: user.email, verified: user.verified, plan: user.plan, credits: user.credits },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      res.status(400).json({ error: 'Token is required' });
      return;
    }

    const { userId } = verifyEmailToken(token);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.verified) {
      res.json({ message: 'Email already verified' });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        verified: true,
        verifyToken: null,
        verifyTokenExpiry: null,
      },
    });

    res.json({ message: 'Email verified successfully' });
  } catch {
    res.status(400).json({ error: 'Invalid or expired verification token' });
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.verified) {
      res.json({ message: 'Email already verified' });
      return;
    }

    const verifyToken = signEmailVerifyToken(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verifyToken,
        verifyTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await sendVerificationEmail(user.email, verifyToken);
    res.json({ message: 'Verification email sent' });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      res.status(400).json({ error: 'Current password is incorrect' });
      return;
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: req.userId! },
      data: { passwordHash: newHash },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: { subscription: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyCount = await prisma.translation.count({
      where: { userId: req.userId!, createdAt: { gte: startOfMonth } },
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        verified: user.verified,
        plan: user.plan,
        credits: user.credits,
        monthlyCount,
        createdAt: user.createdAt,
        subscription: user.subscription
          ? {
              plan: user.subscription.plan,
              active: user.subscription.active,
              currentPeriodEnd: user.subscription.currentPeriodEnd,
            }
          : null,
      },
    });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
