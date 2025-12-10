import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { usePlan } from '../context/PlanContext';

interface Props {
  children: React.ReactNode;
  featureName?: string;
}

const ProFeatureGate = ({ children, featureName = 'this feature' }: Props) => {
  const { isPro } = usePlan();
  const navigate = useNavigate();

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <Alert
      variant="dark"
      className="d-flex align-items-center justify-content-between"
      style={{ border: '1px solid rgba(99, 102, 241, 0.3)' }}
    >
      <div>
        <div className="fw-bold">Tracksub Pro</div>
        <div className="text-muted small">Upgrade to unlock {featureName}.</div>
      </div>
      <Button variant="primary" onClick={() => navigate('/billing')}>
        Upgrade
      </Button>
    </Alert>
  );
};

export default ProFeatureGate;
