import React from 'react';
import { Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { usePlan, usePlanCatalog } from '../context/PlanContext';

const PlanBadge = () => {
  const { currentPlan, plan } = usePlan();
  const plans = usePlanCatalog();
  const activePlan = plans[currentPlan];

  return (
    <OverlayTrigger
      placement="bottom"
      overlay={
        <Tooltip id="plan-badge-tooltip">
          {activePlan.name} • {plan.status === 'pending' ? 'Pending activation' : 'Includes manual entry'}
        </Tooltip>
      }
    >
      <Badge
        bg={currentPlan === 'pro' ? 'primary' : 'secondary'}
        pill
        style={{
          border: '1px solid rgba(255,255,255,0.15)',
          padding: '0.4rem 0.75rem',
          letterSpacing: '0.02em',
        }}
      >
        {activePlan.name}
      </Badge>
    </OverlayTrigger>
  );
};

export default PlanBadge;
