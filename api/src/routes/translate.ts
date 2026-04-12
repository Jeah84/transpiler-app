import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { AuthRequest } from '../types/express';
import { translateCode } from '../services/translation';

const router = Router();

const FREE_DAILY_LIMIT = 5;
const PRO_DAILY_LIMIT = 100;

const SUPPORTED_LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#',
  'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'Scala',
  'R', 'Perl', 'Lua', 'Haskell', 'Elixir', 'Clojure', 'F#',
  'MATLAB', 'SQL', 'Bash', 'PowerShell', 'Assembly',
] as const;

const translateSchema = z.object({
  sourceCode: z.string().min(1, 'Source code is required').max(10000, 'Source code too long'),
  sourceLanguage: z.string().refine((l) => SUPPORTED_LANGUAGES.includes(l as any), 'Unsupported source language'),
  targetLanguage: z.string().refine((l) => SUPPORTED_LANGUAGES.includes(l as any), 'Unsupported target language'),
});

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

// POST /api/translate
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { sourceCode, sourceLanguage, targetLanguage } = translateSchema.parse(req.body);

    if (sourceLanguage === targetLanguage) {
      res.status(400).json({ error: 'Source and target languages must be different' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Reset daily count if new day
    const today = getTodayString();
    let dailyCount = user.dailyCount;
    if (user.dailyDate !== today) {
      dailyCount = 0;
      await prisma.user.update({
        where: { id: user.id },
        data: { dailyCount: 0, dailyDate: today },
      });
    }

    // Check daily limit
    const limit = user.plan === 'PRO' ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
    if (dailyCount >= limit) {
      res.status(429).json({
        error: 'Daily translation limit reached',
        limit,
        plan: user.plan,
        upgradeUrl: user.plan === 'FREE' ? '/pricing' : undefined,
      });
      return;
    }

    // Perform translation
    const { translatedCode, tokensUsed } = await translateCode(sourceCode, sourceLanguage, targetLanguage);

    // Save translation and increment count
    const [translation] = await prisma.$transaction([
      prisma.translation.create({
        data: {
          userId: user.id,
          sourceLanguage,
          targetLanguage,
          sourceCode,
          translatedCode,
          tokensUsed,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          dailyCount: dailyCount + 1,
          dailyDate: today,
        },
      }),
    ]);

    res.json({
      id: translation.id,
      translatedCode,
      sourceLanguage,
      targetLanguage,
      tokensUsed,
      dailyCount: dailyCount + 1,
      dailyLimit: limit,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    console.error('Translation error:', err);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// GET /api/translate/history
router.get('/history', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    const [translations, total] = await Promise.all([
      prisma.translation.findMany({
        where: { userId: req.userId! },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          sourceLanguage: true,
          targetLanguage: true,
          sourceCode: true,
          translatedCode: true,
          tokensUsed: true,
          createdAt: true,
        },
      }),
      prisma.translation.count({ where: { userId: req.userId! } }),
    ]);

    res.json({ translations, total, page, limit });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET /api/translate/languages
router.get('/languages', (_req, res) => {
  res.json({ languages: SUPPORTED_LANGUAGES });
});

export default router;
