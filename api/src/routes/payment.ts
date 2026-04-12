import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { AuthRequest } from '../types/express';
import { env } from '../config/env';

const stripe = new Stripe(env.stripeSecretKey);
const router = Router();

// POST /api/payment/create-checkout-session
router.post('/create-checkout-session', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: { subscription: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.plan === 'PRO') {
      res.status(400).json({ error: 'Already on Pro plan' });
      return;
    }

    // Get or create Stripe customer
    let customerId = user.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: env.stripePriceIdMonthly,
          quantity: 1,
        },
      ],
      success_url: `${env.frontendUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.frontendUrl}/pricing`,
      metadata: { userId: user.id },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout session error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/payment/portal
router.post('/portal', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: { subscription: true },
    });

    if (!user?.subscription?.stripeCustomerId) {
      res.status(400).json({ error: 'No active subscription' });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.subscription.stripeCustomerId,
      return_url: `${env.frontendUrl}/settings`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Portal session error:', err);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// POST /api/payment/webhook
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.stripeWebhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) break;

        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        await prisma.$transaction([
          prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              plan: 'PRO',
              active: true,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscriptionId,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
            update: {
              plan: 'PRO',
              active: true,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscriptionId,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          }),
          prisma.user.update({
            where: { id: userId },
            data: { plan: 'PRO' },
          }),
        ]);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const sub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });
        if (!sub) break;

        const active = subscription.status === 'active';
        await prisma.$transaction([
          prisma.subscription.update({
            where: { id: sub.id },
            data: {
              active,
              plan: active ? 'PRO' : 'FREE',
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          }),
          prisma.user.update({
            where: { id: sub.userId },
            data: { plan: active ? 'PRO' : 'FREE' },
          }),
        ]);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const sub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });
        if (!sub) break;

        await prisma.$transaction([
          prisma.subscription.update({
            where: { id: sub.id },
            data: { active: false, plan: 'FREE' },
          }),
          prisma.user.update({
            where: { id: sub.userId },
            data: { plan: 'FREE' },
          }),
        ]);
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

export default router;
