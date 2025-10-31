import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Container, Card, Row, Col, ListGroup, Badge, Alert, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { getCategoryColor } from '../categories';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

interface Subscription {
  id: number;
  name: string;
  billing_cycle: string;
  start_date: string;
  next_payment_date: string;
  amount: number;
  category: string;
  status: string;
}

const HomePage = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      try {
        const response = await api.get('/subscriptions');
        setSubscriptions(response.data.subscriptions || []);
        setError('');
      } catch (error) {
        setError('Failed to load subscriptions');
        console.error('Error fetching subscriptions', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const totalMonthly = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => {
      if (sub.billing_cycle === 'monthly') {
        return sum + sub.amount;
      } else {
        return sum + sub.amount / 12;
      }
    }, 0);

  const totalYearly = totalMonthly * 12;

  const activeCount = subscriptions.filter(sub => sub.status === 'active').length;
  const inactiveCount = subscriptions.filter(sub => sub.status === 'inactive').length;
  const cancelledCount = subscriptions.filter(sub => sub.status === 'cancelled').length;

  // Pie chart data - show all subscriptions
  const pieChartData = {
    labels: subscriptions.map(sub => sub.name),
    datasets: [
      {
        data: subscriptions.map(sub => sub.amount),
        backgroundColor: [
          '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
          '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981'
        ],
        borderWidth: 2,
        borderColor: 'rgba(15, 23, 42, 0.8)',
      },
    ],
  };

  // Category chart data - show all subscriptions
  const categoryData: { [key: string]: number } = {};
  subscriptions.forEach(sub => {
    if (categoryData[sub.category]) {
      categoryData[sub.category] += sub.amount;
    } else {
      categoryData[sub.category] = sub.amount;
    }
  });

  const categoryChartData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: Object.keys(categoryData).map(cat => getCategoryColor(cat).color),
        borderWidth: 2,
        borderColor: 'rgba(15, 23, 42, 0.8)',
      },
    ],
  };

  // Bar chart for monthly vs yearly - show all subscriptions
  const monthlyTotal = subscriptions
    .filter(sub => sub.billing_cycle === 'monthly')
    .reduce((sum, sub) => sum + sub.amount, 0);

  const yearlyTotal = subscriptions
    .filter(sub => sub.billing_cycle === 'yearly')
    .reduce((sum, sub) => sum + sub.amount, 0);

  const barChartData = {
    labels: ['Monthly', 'Yearly'],
    datasets: [
      {
        label: 'Total Amount (€)',
        data: [monthlyTotal, yearlyTotal],
        backgroundColor: ['#6366f1', '#8b5cf6'],
        borderWidth: 2,
        borderColor: 'rgba(15, 23, 42, 0.8)',
      },
    ],
  };

  // Line chart - Monthly spending history
  const getMonthlySpendingHistory = () => {
    const months: { [key: string]: number } = {};
    const today = new Date();
    
    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[monthKey] = 0;
    }

    subscriptions.forEach(sub => {
      const startDate = new Date(sub.start_date);
      startDate.setHours(0, 0, 0, 0);
      
      Object.keys(months).forEach(monthKey => {
        const [year, month] = monthKey.split('-').map(Number);
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59);
        
        // Check if subscription was active during this month
        if (startDate <= monthEnd) {
          // For active subscriptions, add them if they started before or during this month
          // For inactive/cancelled, only add if they were active during this month
          const shouldCount = sub.status === 'active' || 
                             (startDate <= monthEnd && monthStart >= startDate);
          
          if (shouldCount) {
            if (sub.billing_cycle === 'monthly') {
              months[monthKey] += sub.amount;
            } else if (sub.billing_cycle === 'yearly') {
              // For yearly, divide by 12 to get monthly cost
              months[monthKey] += sub.amount / 12;
            }
          }
        }
      });
    });

    return months;
  };

  const monthlyHistory = getMonthlySpendingHistory();

  const lineChartData = {
    labels: Object.keys(monthlyHistory).map(key => {
      const [year, month] = key.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }),
    datasets: [
      {
        label: 'Monthly Spending (€)',
        data: Object.values(monthlyHistory),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#e2e8f0',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#e2e8f0',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(99, 102, 241, 0.5)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: 'rgba(99, 102, 241, 0.1)',
        },
      },
      y: {
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: 'rgba(99, 102, 241, 0.1)',
        },
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      x: {
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: 'rgba(99, 102, 241, 0.1)',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#94a3b8',
          callback: function(value: any) {
            return '€' + value.toFixed(2);
          }
        },
        grid: {
          color: 'rgba(99, 102, 241, 0.1)',
        },
      }
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1>Dashboard</h1>
      
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Row className="mt-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Monthly Cost</Card.Title>
              <h2>€{totalMonthly.toFixed(2)}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Yearly Cost</Card.Title>
              <h2>€{totalYearly.toFixed(2)}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Active</Card.Title>
              <h2>{activeCount}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Subscriptions</Card.Title>
              <h2>{subscriptions.length}</h2>
              <small className="text-muted">
                {inactiveCount} inactive, {cancelledCount} cancelled
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {subscriptions.length > 0 ? (
        <>
          <Row className="mt-4">
            <Col md={12}>
              <Card>
                <Card.Body>
                  <Card.Title>Monthly Spending History</Card.Title>
                  <div style={{ height: '300px' }}>
                    <Line data={lineChartData} options={lineChartOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row className="mt-4">
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>Subscriptions by Cost</Card.Title>
                  <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Pie data={pieChartData} options={chartOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>By Category</Card.Title>
                  <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Pie data={categoryChartData} options={chartOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>Monthly vs Yearly</Card.Title>
                  <div style={{ height: '300px' }}>
                    <Bar data={barChartData} options={chartOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Card className="mt-4">
          <Card.Body className="text-center py-5">
            <div style={{ fontSize: '4rem', opacity: 0.3 }}>📈</div>
            <h4 className="mt-3">No Data to Display</h4>
            <p className="text-muted">
              Add subscriptions to see charts and analytics of your spending
            </p>
          </Card.Body>
        </Card>
      )}

      <Card className="mt-4">
        <Card.Body>
          <Card.Title>Your Subscriptions</Card.Title>
          <ListGroup variant="flush">
            {subscriptions.length === 0 ? (
              <ListGroup.Item className="text-center py-5">
                <div style={{ fontSize: '4rem', opacity: 0.3 }}>📊</div>
                <h4 className="mt-3">No Subscriptions Yet</h4>
                <p className="text-muted">Start tracking your subscriptions to see your spending overview</p>
                <Link to="/add-subscription">
                  <Button variant="primary" size="lg" className="mt-2">
                    Add Your First Subscription
                  </Button>
                </Link>
              </ListGroup.Item>
            ) : (
              subscriptions.map((sub) => {
                const categoryColor = getCategoryColor(sub.category);
                const getStatusColor = () => {
                  switch(sub.status) {
                    case 'active': return { bg: '#d1e7dd', color: '#0f5132' };
                    case 'inactive': return { bg: '#fff3cd', color: '#664d03' };
                    case 'cancelled': return { bg: '#f8d7da', color: '#842029' };
                    default: return { bg: '#e2e3e5', color: '#41464b' };
                  }
                };
                const statusColor = getStatusColor();
                
                // Calculate subscription age
                const startDate = new Date(sub.start_date);
                const today = new Date();
                const diffTime = Math.abs(today.getTime() - startDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let ageText = '';
                if (diffDays < 30) {
                  ageText = `${diffDays}d`;
                } else if (diffDays < 365) {
                  const months = Math.floor(diffDays / 30);
                  ageText = `${months}mo`;
                } else {
                  const years = Math.floor(diffDays / 365);
                  const remainingMonths = Math.floor((diffDays % 365) / 30);
                  ageText = remainingMonths > 0 ? `${years}y ${remainingMonths}mo` : `${years}y`;
                }
                
                return (
                  <ListGroup.Item key={sub.id} style={{ opacity: sub.status === 'active' ? 1 : 0.6 }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{sub.name}</strong>
                        <Badge 
                          className="ms-2" 
                          style={{ 
                            backgroundColor: categoryColor.bgColor, 
                            color: categoryColor.color,
                            border: `1px solid ${categoryColor.color}`,
                            fontSize: '0.7rem'
                          }}
                        >
                          {sub.category}
                        </Badge>
                        <Badge 
                          className="ms-2" 
                          style={{ 
                            backgroundColor: statusColor.bg, 
                            color: statusColor.color,
                            border: `1px solid ${statusColor.color}`,
                            fontSize: '0.7rem',
                            textTransform: 'capitalize'
                          }}
                        >
                          {sub.status}
                        </Badge>
                        <Badge 
                          bg="light"
                          text="dark"
                          className="ms-2"
                          style={{ fontSize: '0.7rem' }}
                        >
                          {ageText}
                        </Badge>
                        <div className="text-muted small">
                          €{sub.amount} / {sub.billing_cycle}
                        </div>
                      </div>
                      <div className="text-end">
                        <div>Next payment</div>
                        <div className="text-muted">{sub.next_payment_date}</div>
                      </div>
                    </div>
                  </ListGroup.Item>
                );
              })
            )}
          </ListGroup>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default HomePage;
