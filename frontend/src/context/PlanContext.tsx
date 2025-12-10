import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { defaultPlanState, PlanId, PlanState, planCatalog, SubscriptionStatus } from '../types/plans';

interface PlanContextValue {
  plan: PlanState;
  currentPlan: PlanId;
  isPro: boolean;
  setLocalPlan: (planId: PlanId, status?: SubscriptionStatus) => void;
  markPendingUpgrade: () => void;
  completeUpgrade: (renewalDate?: string | null) => void;
  downgradeToFree: () => void;
}

const PlanContext = createContext<PlanContextValue | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'tracksub.planState';

const loadFromStorage = (): PlanState => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return { ...defaultPlanState, ...JSON.parse(raw) };
    }
  } catch (error) {
    console.warn('Unable to parse stored plan state', error);
  }
  return defaultPlanState;
};

const persistToStorage = (state: PlanState) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Unable to persist plan state', error);
  }
};

export const PlanProvider = ({ children }: { children: React.ReactNode }) => {
  const [plan, setPlan] = useState<PlanState>(loadFromStorage);

  useEffect(() => {
    persistToStorage(plan);
  }, [plan]);

  const setLocalPlan = (planId: PlanId, status: SubscriptionStatus = 'active') => {
    setPlan({
      ...plan,
      planId,
      status,
      pendingUpgrade: false,
    });
  };

  const markPendingUpgrade = () => {
    setPlan({
      ...plan,
      planId: 'pro',
      status: 'pending',
      pendingUpgrade: true,
    });
  };

  const completeUpgrade = (renewalDate: string | null = null) => {
    setPlan({
      planId: 'pro',
      status: 'active',
      renewsAt: renewalDate,
      pendingUpgrade: false,
    });
  };

  const downgradeToFree = () => {
    setPlan({
      planId: 'free',
      status: 'none',
      renewsAt: null,
      pendingUpgrade: false,
    });
  };

  const value = useMemo(
    () => ({
      plan,
      currentPlan: plan.planId,
      isPro: plan.planId === 'pro',
      setLocalPlan,
      markPendingUpgrade,
      completeUpgrade,
      downgradeToFree,
    }),
    [plan]
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
};

export const usePlan = () => {
  const ctx = useContext(PlanContext);
  if (!ctx) {
    throw new Error('usePlan must be used within PlanProvider');
  }
  return ctx;
};

export const usePlanCatalog = () => planCatalog;
