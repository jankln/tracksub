import React, { useEffect, useMemo, useState } from 'react';
import { Container, Card, Button, Spinner, Badge } from 'react-bootstrap';
import api from '../api/axios';

interface Subscription {
  id: number;
  name: string;
  billing_cycle: 'monthly' | 'yearly';
  start_date: string;
  next_payment_date: string;
  amount: number;
  category: string;
  status: string;
}

interface CalendarEvent {
  id: number;
  name: string;
  amount: number;
  category: string;
  billing_cycle: 'monthly' | 'yearly';
}

const monthLabel = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const CalendarPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      try {
        const response = await api.get('/subscriptions');
        setSubscriptions(response.data.subscriptions || []);
        setError('');
      } catch (err) {
        setError('Failed to load subscriptions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const slots = [] as Array<{ day: number | null; dateKey: string }>;

    for (let i = 0; i < startDay; i++) {
      slots.push({ day: null, dateKey: `pad-${i}` });
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      slots.push({ day, dateKey });
    }

    return slots;
  }, [visibleMonth]);

  const eventsByDate = useMemo(() => {
    const byDate: Record<string, CalendarEvent[]> = {};
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const totalDays = daysInMonth(year, month);

    const addEvent = (dateKey: string, event: CalendarEvent) => {
      if (!byDate[dateKey]) byDate[dateKey] = [];
      byDate[dateKey].push(event);
    };

    subscriptions
      .filter((sub) => sub.status === 'active')
      .forEach((sub) => {
        const nextDate = new Date(sub.next_payment_date);
        const day = Math.min(nextDate.getDate(), totalDays);
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        if (sub.billing_cycle === 'monthly') {
          addEvent(dateKey, {
            id: sub.id,
            name: sub.name,
            amount: sub.amount,
            category: sub.category,
            billing_cycle: 'monthly',
          });
        } else {
          if (nextDate.getMonth() === month) {
            addEvent(dateKey, {
              id: sub.id,
              name: sub.name,
              amount: sub.amount,
              category: sub.category,
              billing_cycle: 'yearly',
            });
          }
        }
      });

    return byDate;
  }, [subscriptions, visibleMonth]);

  const nextMonth = () => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    setVisibleMonth(new Date(year, month + 1, 1));
  };

  const prevMonth = () => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    setVisibleMonth(new Date(year, month - 1, 1));
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="mb-0">Payment Calendar</h1>
          <div className="text-muted">See when each subscription is charged</div>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Button variant="outline-secondary" onClick={prevMonth}>
            ‹ Prev
          </Button>
          <Card className="px-3 py-2" style={{ background: 'rgba(99, 102, 241, 0.08)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
            <strong>{monthLabel(visibleMonth)}</strong>
          </Card>
          <Button variant="outline-secondary" onClick={nextMonth}>
            Next ›
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : error ? (
        <Card className="p-3" bg="dark" text="light">
          <div>{error}</div>
        </Card>
      ) : (
        <Card className="p-3" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
          <div className="d-flex text-muted mb-2" style={{ fontSize: '0.85rem' }}>
            <div style={{ width: '14.28%', textAlign: 'center' }}>Sun</div>
            <div style={{ width: '14.28%', textAlign: 'center' }}>Mon</div>
            <div style={{ width: '14.28%', textAlign: 'center' }}>Tue</div>
            <div style={{ width: '14.28%', textAlign: 'center' }}>Wed</div>
            <div style={{ width: '14.28%', textAlign: 'center' }}>Thu</div>
            <div style={{ width: '14.28%', textAlign: 'center' }}>Fri</div>
            <div style={{ width: '14.28%', textAlign: 'center' }}>Sat</div>
          </div>

          <div className="d-flex flex-wrap">
            {calendarDays.map(({ day, dateKey }) => {
              const dayEvents = day ? eventsByDate[dateKey] || [] : [];
              return (
                <div
                  key={dateKey}
                  style={{
                    width: '14.28%',
                    minHeight: '120px',
                    border: '1px solid rgba(99, 102, 241, 0.12)',
                    padding: '8px',
                    boxSizing: 'border-box',
                    background: day ? 'rgba(255,255,255,0.02)' : 'transparent',
                  }}
                >
                  {day && (
                    <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>
                      <span>{day}</span>
                      {dayEvents.length > 0 && (
                        <Badge bg="primary" pill style={{ fontSize: '0.7rem' }}>
                          {dayEvents.length}
                        </Badge>
                      )}
                    </div>
                  )}
                  {dayEvents.map((ev) => (
                    <Card
                      key={ev.id}
                      className="mb-2"
                      style={{
                        background: ev.billing_cycle === 'monthly' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                      }}
                    >
                      <Card.Body className="p-2">
                        <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '0.9rem' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{ev.name}</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{ev.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly'}</div>
                          </div>
                          <div style={{ fontWeight: 700, color: '#e2e8f0' }}>ƒ'ª{ev.amount.toFixed(2)}</div>
                        </div>
                        <div style={{ color: '#cbd5e1', fontSize: '0.75rem', marginTop: '4px' }}>{ev.category}</div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </Container>
  );
};

export default CalendarPage;
