import { Router, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { AuthRequest } from '../types/express';
import { prisma } from '../lib/prisma';
import { reviewCode } from '../services/codeReview';

const router = Router();

const reviewSchema = z.object({
  code: z.string().min(1).max(10000),
  language: z.string().min(1),
});

router.post('/review', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { code, language } = reviewSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user || user.plan !== 'PRO') {
      res.status(403).json({ error: 'Code review is a Pro feature. Please upgrade your plan.' });
      return;
    }

    const review = await reviewCode(code, language);
    res.json({ review });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    console.error('Review error:', err);
    res.status(500).json({ error: 'Code review failed' });
  }
});

export default router;
