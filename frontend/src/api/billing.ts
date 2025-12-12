import api from './axios';

export const fetchPlan = async () => {
  const res = await api.get('/billing/me');
  return res.data;
};

export const createCheckoutSession = async (successUrl?: string, cancelUrl?: string) => {
  const res = await api.post('/billing/checkout-session', {
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
  return res.data;
};

export const createPortalSession = async (returnUrl?: string) => {
  const res = await api.post('/billing/portal-session', { return_url: returnUrl });
  return res.data;
};

export const createFinancialConnectionsLink = async () => {
  const res = await api.post('/billing/financial-connections/link-token');
  return res.data;
};

export const attachFinancialConnectionsAccount = async (accountId: string, sessionId: string) => {
  const res = await api.post('/billing/financial-connections/attach', {
    account_id: accountId,
    session_id: sessionId,
  });
  return res.data;
};

export const syncFinancialConnections = async () => {
  const res = await api.post('/billing/financial-connections/sync');
  return res.data;
};

export const fetchFinancialCandidates = async () => {
  const res = await api.get('/billing/financial-connections/candidates');
  return res.data;
};

export const importFinancialSubscriptions = async (subscriptions: any[]) => {
  const res = await api.post('/billing/financial-connections/import', { subscriptions });
  return res.data;
};
