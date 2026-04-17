import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { env } from '../config/env';

const router = Router();

router.get('/connect', requireAuth, (req, res) => {
  const userId = (req as any).userId;
  const params = new URLSearchParams({
    client_id: env.githubClientId,
    scope: 'repo',
    state: userId,
    redirect_uri: env.githubCallbackUrl,
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

router.get('/callback', async (req, res) => {
  const { code, state } = req.query as { code?: string; state?: string };
  if (!code || !state) return res.redirect(`${env.frontendUrl}/settings?github=error`);
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: env.githubClientId, client_secret: env.githubClientSecret, code }),
    });
    const tokenData = await tokenRes.json() as any;
    if (!tokenData.access_token) return res.redirect(`${env.frontendUrl}/settings?github=error`);
    const ghUser = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/vnd.github.v3+json' },
    }).then(r => r.json()) as any;
    await prisma.user.update({
      where: { id: state },
      data: { githubAccessToken: tokenData.access_token, githubUsername: ghUser.login },
    });
    res.redirect(`${env.frontendUrl}/settings?section=connected-apps&github=connected&username=${ghUser.login}`);
  } catch {
    res.redirect(`${env.frontendUrl}/settings?github=error`);
  }
});

router.get('/status', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: (req as any).userId },
    select: { githubUsername: true, githubAccessToken: true },
  });
  res.json({ connected: !!user?.githubAccessToken, username: user?.githubUsername || null });
});

router.delete('/disconnect', requireAuth, async (req, res) => {
  await prisma.user.update({
    where: { id: (req as any).userId },
    data: { githubAccessToken: null, githubUsername: null },
  });
  res.json({ success: true });
});

router.get('/repos', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: (req as any).userId },
    select: { githubAccessToken: true },
  });
  if (!user?.githubAccessToken) return res.status(401).json({ error: 'GitHub not connected' });
  const data = await fetch(
    'https://api.github.com/user/repos?sort=pushed&per_page=100&type=all',
    { headers: { Authorization: `Bearer ${user.githubAccessToken}`, Accept: 'application/vnd.github.v3+json' } }
  ).then(r => r.json()) as any[];
  res.json(data.map((r: any) => ({
    fullName: r.full_name, name: r.name, owner: r.owner.login,
    private: r.private, defaultBranch: r.default_branch,
  })));
});

router.get('/repos/:owner/:repo/branches', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: (req as any).userId },
    select: { githubAccessToken: true },
  });
  if (!user?.githubAccessToken) return res.status(401).json({ error: 'GitHub not connected' });
  const { owner, repo } = req.params;
  const data = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/branches`,
    { headers: { Authorization: `Bearer ${user.githubAccessToken}`, Accept: 'application/vnd.github.v3+json' } }
  ).then(r => r.json()) as any[];
  res.json(Array.isArray(data) ? data.map((b: any) => b.name) : []);
});

router.post('/push', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: (req as any).userId },
    select: { githubAccessToken: true },
  });
  if (!user?.githubAccessToken) return res.status(401).json({ error: 'GitHub not connected' });
  const { owner, repo, branch, path, content, message } = req.body;
  if (!owner || !repo || !branch || !path || content === undefined || !message)
    return res.status(400).json({ error: 'Missing required fields' });
  const headers: any = {
    Authorization: `Bearer ${user.githubAccessToken}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
  let sha: string | undefined;
  try {
    const ex = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, { headers });
    if (ex.ok) sha = ((await ex.json()) as any).sha;
  } catch {}
  const body: any = { message, content: Buffer.from(content).toString('base64'), branch };
  if (sha) body.sha = sha;
  const pushRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT', headers, body: JSON.stringify(body),
  });
  if (!pushRes.ok) {
    const err = await pushRes.json() as any;
    return res.status(pushRes.status).json({ error: err.message || 'Push failed' });
  }
  const result = await pushRes.json() as any;
  res.json({ success: true, url: result.content?.html_url });
});

export default router;
