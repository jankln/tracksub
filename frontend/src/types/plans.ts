export type PlanId = 'free' | 'pro';

export type SubscriptionStatus = 'none' | 'active' | 'trialing' | 'past_due' | 'canceled' | 'pending';

export interface PlanDefinition {
  id: PlanId;
  name: string;
  priceMonthly: number;
  currency: string;
  interval: 'month';
  description: string;
  features: string[];
  includesPlaid: boolean;
  includesManualEntry: boolean;
}

export const planCatalog: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    currency: 'EUR',
    interval: 'month',
    description: 'Manual subscription tracking with reminders.',
    features: [
      'Manual subscription entry',
      'Dashboard and analytics',
      'Email reminders',
    ],
    includesPlaid: false,
    includesManualEntry: true,
  },
  pro: {
    id: 'pro',
    name: 'Tracksub Pro',
    priceMonthly: 7,
    currency: 'EUR',
    interval: 'month',
    description: 'Plaid-powered bank sync plus everything in Free.',
    features: [
      'Manual subscription entry',
      'Dashboard and analytics',
      'Email reminders',
      'Plaid-powered bank sync',
      'Priority support',
    ],
    includesPlaid: true,
    includesManualEntry: true,
  },
};

export interface PlanState {
  planId: PlanId;
  status: SubscriptionStatus;
  renewsAt?: string | null;
  pendingUpgrade?: boolean;
}

export const defaultPlanState: PlanState = {
  planId: 'free',
  status: 'none',
  renewsAt: null,
  pendingUpgrade: false,
};
