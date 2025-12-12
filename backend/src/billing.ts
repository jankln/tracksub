import { Router } from 'express';
import Stripe from 'stripe';
import { AuthRequest, protectedRoute } from './middleware/auth';
import { FinancialTransaction, User } from './models';

const router = Router();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const pricePro = process.env.STRIPE_PRICE_PRO;
const financialConnectionsCountry = process.env.STRIPE_FC_COUNTRY || 'DE';
const financialConnectionsPermissions = (process.env.STRIPE_FC_PERMISSIONS || 'transactions')
  .split(',')
  .map((p) => p.trim())
  .filter(Boolean);

if (!stripeSecretKey) {
  console.warn('Stripe secret key is not set. Billing routes will fail until configured.');
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2024-09-30.acacia' as any }) : null;

const ensureStripe = (res: any) => {
  if (!stripe || !pricePro) {
    res.status(500).json({ message: 'Stripe is not configured' });
    return false;
  }
  return true;
};

const fetchUser = async (userId: number) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

const ensureCustomer = async (user: User) => {
  if (user.stripe_customer_id) {
    return user.stripe_customer_id;
  }
  if (!stripe) throw new Error('Stripe client not configured');

  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { app_user_id: String(user.id) },
  });
  await user.update({ stripe_customer_id: customer.id });
  return customer.id;
};

router.get('/me', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const user = await fetchUser(req.user!.id);
    res.json({
      plan: user.plan || 'free',
      subscription_status: user.subscription_status || 'none',
      stripe_customer_id: user.stripe_customer_id,
      stripe_subscription_id: user.stripe_subscription_id,
      financial_account_id: user.financial_account_id,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to load billing state' });
  }
});

router.post('/checkout-session', protectedRoute, async (req: AuthRequest, res) => {
  if (!ensureStripe(res)) return;
  const successUrl =
    req.body.success_url || process.env.CHECKOUT_SUCCESS_URL || 'https://tracksub-7w3u.onrender.com/billing?success=1';
  const cancelUrl =
    req.body.cancel_url || process.env.CHECKOUT_CANCEL_URL || 'https://tracksub-7w3u.onrender.com/billing?canceled=1';

  try {
    const user = await fetchUser(req.user!.id);
    const customerId = await ensureCustomer(user);
    const session = await stripe!.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: pricePro!, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_method_types: ['card'],
      subscription_data: {
        metadata: { app_user_id: user.id },
      },
      metadata: { app_user_id: user.id },
    });
    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout session error', error);
    res.status(500).json({ message: 'Failed to create checkout session', error: error.message });
  }
});

router.post('/portal-session', protectedRoute, async (req: AuthRequest, res) => {
  if (!ensureStripe(res)) return;
  try {
    const user = await fetchUser(req.user!.id);
    const customerId = await ensureCustomer(user);
    const portalSession = await stripe!.billingPortal.sessions.create({
      customer: customerId,
      return_url: req.body.return_url || 'https://tracksub-7w3u.onrender.com/billing',
    });
    res.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Portal session error', error);
    res.status(500).json({ message: 'Failed to create portal session', error: error.message });
  }
});

router.post('/financial-connections/link-token', protectedRoute, async (req: AuthRequest, res) => {
  if (!ensureStripe(res)) return;
  try {
    const user = await fetchUser(req.user!.id);
    if (user.plan !== 'pro') {
      return res.status(403).json({ message: 'Financial Connections requires an active Pro plan' });
    }
    const customerId = await ensureCustomer(user);
    const session = await stripe!.financialConnections.sessions.create({
      account_holder: { type: 'customer', customer: customerId },
      permissions: financialConnectionsPermissions as any,
      filters: { countries: [financialConnectionsCountry] },
    });
    res.json({ client_secret: session.client_secret, id: session.id });
  } catch (error: any) {
    console.error('Financial Connections session error', error);
    res.status(500).json({ message: 'Failed to create financial connections session', error: error.message });
  }
});

router.post('/financial-connections/attach', protectedRoute, async (req: AuthRequest, res) => {
  const { account_id, session_id } = req.body;
  if (!account_id || !session_id) {
    return res.status(400).json({ message: 'account_id and session_id are required' });
  }
  try {
    const user = await fetchUser(req.user!.id);
    await user.update({ financial_account_id: account_id, financial_session_id: session_id });
    res.json({ message: 'Financial account saved' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to save financial account', error: error.message });
  }
});

router.post('/financial-connections/sync', protectedRoute, async (req: AuthRequest, res) => {
  if (!ensureStripe(res)) return;
  try {
    const user = await fetchUser(req.user!.id);

    if (user.plan !== 'pro') {
      return res.status(403).json({ message: 'Financial Connections sync is available for Pro users only.' });
    }

    if (!user.financial_account_id) {
      return res.status(400).json({ message: 'No financial account linked to this user.' });
    }

    const now = new Date();
    const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    let syncCount = user.financial_sync_count || 0;
    let syncMonth = user.financial_sync_month;
    if (syncMonth !== monthKey) {
      syncMonth = monthKey;
      syncCount = 0;
    }
    if (syncCount >= 2) {
      return res.status(429).json({ message: 'Sync limit reached. You can sync up to 2 times per month.' });
    }

    // Refresh transactions to ensure we get latest data
    await stripe!.financialConnections.accounts.refresh(user.financial_account_id, { features: ['transactions'] });

    const since = user.financial_last_sync_at ? Math.floor(new Date(user.financial_last_sync_at).getTime() / 1000) : undefined;
    const listParams: Stripe.FinancialConnections.TransactionListParams = {
      account: user.financial_account_id,
      limit: 100,
    };
    if (since) {
      listParams.transacted_at = { gt: since };
    }

    let newTransactions = 0;
    let latestTransacted = since || 0;

    const pager = stripe!.financialConnections.transactions.list(listParams);
    for await (const tx of pager.autoPagingEach()) {
      const existing = await FinancialTransaction.findOne({ where: { transaction_id: tx.id } });
      if (existing) continue;
      await FinancialTransaction.create({
        user_id: user.id,
        account_id: tx.account,
        transaction_id: tx.id,
        amount: tx.amount,
        currency: tx.currency,
        description: tx.description,
        status: tx.status,
        transacted_at: new Date(tx.transacted_at * 1000).toISOString(),
      });
      newTransactions += 1;
      latestTransacted = Math.max(latestTransacted, tx.transacted_at);
    }

    await user.update({
      financial_sync_month: syncMonth,
      financial_sync_count: syncCount + 1,
      financial_last_sync_at: latestTransacted ? new Date(latestTransacted * 1000).toISOString() : user.financial_last_sync_at,
    });

    res.json({ message: 'Sync completed', new_transactions: newTransactions });
  } catch (error: any) {
    console.error('Financial Connections sync error', error);
    res.status(500).json({ message: 'Failed to sync financial connections', error: error.message });
  }
});

export default router;
