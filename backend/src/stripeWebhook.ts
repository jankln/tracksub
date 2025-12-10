import { Request, Response } from 'express';
import Stripe from 'stripe';
import { User } from './models';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const pricePro = process.env.STRIPE_PRICE_PRO;

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2024-09-30.acacia' as any }) : null;

const updateUserFromSubscription = async (customerId: string, subscription: Stripe.Subscription) => {
  const user = await User.findOne({ where: { stripe_customer_id: customerId } });
  if (!user) {
    console.warn('No user found for customer', customerId);
    return;
  }
  const plan = subscription.status === 'active' || subscription.status === 'trialing' ? 'pro' : 'free';
  await user.update({
    plan,
    subscription_status: subscription.status,
    stripe_subscription_id: subscription.id,
  });
};

const updateUserStatus = async (customerId: string, status: string, subscriptionId?: string) => {
  const user = await User.findOne({ where: { stripe_customer_id: customerId } });
  if (!user) {
    console.warn('No user found for customer', customerId);
    return;
  }
  const plan = status === 'active' || status === 'trialing' ? 'pro' : 'free';
  await user.update({
    plan,
    subscription_status: status,
    stripe_subscription_id: subscriptionId || user.stripe_subscription_id,
  });
};

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  if (!stripe || !webhookSecret) {
    return res.status(500).send('Stripe not configured');
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).send('Missing signature');
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string | undefined;
        if (customerId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await updateUserFromSubscription(customerId, subscription);
        } else if (customerId) {
          await updateUserStatus(customerId, 'active', subscriptionId);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        await updateUserFromSubscription(customerId, subscription);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        await updateUserStatus(customerId, 'past_due', invoice.subscription as string);
        break;
      }
      default:
        break;
    }
  } catch (error: any) {
    console.error('Error handling webhook', error);
    return res.status(500).send('Webhook handler error');
  }

  res.json({ received: true });
};
