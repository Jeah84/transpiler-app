import { Router, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { AuthRequest } from '../types/express';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';

const router = Router();

const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';
const FREE_MONTHLY_LIMIT = 10;

// GET /api/translate/stats
router.get('/stats', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { plan: true, credits: true },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyCount = await prisma.translation.count({
      where: {
        userId: req.userId!,
        createdAt: { gte: startOfMonth },
      },
    });

    res.json({
      plan: user?.plan,
      credits: user?.credits ?? 0,
      monthlyCount,
      freeLimit: FREE_MONTHLY_LIMIT,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// POST /api/translate
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { code, fromLanguage, toLanguage } = req.body;

  if (!code || !fromLanguage || !toLanguage) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { plan: true, credits: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // PRO users — unlimited
    if (user.plan !== 'PRO') {
      if (user.credits > 0) {
        // Has credits — use one
      } else {
        // Check free monthly limit
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyCount = await prisma.translation.count({
          where: {
            userId: req.userId!,
            createdAt: { gte: startOfMonth },
          },
        });

        if (monthlyCount >= FREE_MONTHLY_LIMIT) {
          res.status(403).json({
            error: 'no_credits',
            message: 'You have used all your free translations this month. Buy credits or upgrade to Pro.',
          });
          return;
        }
      }
    }

    // Call Together.ai
    const prompt = `Translate the following ${fromLanguage} code to ${toLanguage}. Return only the translated code with no explanation, no markdown, no code blocks. Just the raw code.

${code}`;

    const response = await fetch(TOGETHER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.togetherApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4096,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Together.ai error: ${response.status}`);
    }

    const data = await response.json() as any;
    const translatedCode = data.choices?.[0]?.message?.content?.trim() || '';

    // Save translation and deduct credit atomically
    const ops: any[] = [
      prisma.translation.create({
        data: {
          userId: req.userId!,
          fromLanguage,
          toLanguage,
          inputCode: code,
          outputCode: translatedCode,
        },
      }),
    ];

    // Deduct credit if not Pro and has credits
    if (user.plan !== 'PRO' && user.credits > 0) {
      ops.push(
        prisma.user.update({
          where: { id: req.userId! },
          data: { credits: { decrement: 1 } },
        })
      );
    }

    await prisma.$transaction(ops);

    // Get updated credit count
    const updatedUser = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { credits: true },
    });

    res.json({
      translatedCode,
      credits: updatedUser?.credits ?? 0,
    });
  } catch (err: any) {
    console.error('Translation error:', err);
    res.status(500).json({ error: 'Translation failed' });
  }
});

export default router;
