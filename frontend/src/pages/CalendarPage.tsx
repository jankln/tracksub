import React, { useEffect, useMemo, useState } from 'react';
import { Container, Card, Button, Spinner, Badge, InputGroup, FormControl } from 'react-bootstrap';
import api from '../api/axios';
import './CalendarPage.css';

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

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(amount);

const CalendarPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [icalUrl, setIcalUrl] = useState('');
  const [icalError, setIcalError] = useState('');
  const [copyLabel, setCopyLabel] = useState('Copy link');

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

  useEffect(() => {
    const fetchIcal = async () => {
      try {
        const res = await api.get('/calendar/token');
        setIcalUrl(res.data.ical_url);
        setIcalError('');
      } catch (err: any) {
        if (err?.response?.status === 403) {
          setIcalError('Calendar sync is available for Pro users.');
        } else {
          setIcalError('Unable to load calendar link right now.');
        }
      }
    };
    fetchIcal();
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

      <Card className="mb-3" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
        <Card.Body>
          <div className="d-flex justify-content-between flex-wrap gap-2">
            <div>
              <Card.Title className="mb-1">Sync with Google/iCloud</Card.Title>
              <Card.Text className="text-muted mb-0">Use this ICS link to subscribe in your calendar app.</Card.Text>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <Button
                variant="outline-primary"
                onClick={() => {
                  if (icalUrl) {
                    navigator.clipboard.writeText(icalUrl).then(() => {
                      setCopyLabel('Copied!');
                      setTimeout(() => setCopyLabel('Copy link'), 1500);
                    });
                  }
                }}
                disabled={!icalUrl}
              >
                {copyLabel}
              </Button>
              <Button variant="primary" href={icalUrl || '#'} target="_blank" disabled={!icalUrl}>
                Open link
              </Button>
            </div>
          </div>
          <InputGroup className="mt-3">
            <FormControl readOnly value={icalUrl || 'Pro required to generate ICS link'} />
          </InputGroup>
          {icalError && <div className="text-danger small mt-2">{icalError}</div>}
        </Card.Body>
      </Card>

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
          <div className="calendar-scroll">
            <div className="calendar-weekdays text-muted mb-2">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            <div className="calendar-grid">
            {calendarDays.map(({ day, dateKey }) => {
              const dayEvents = day ? eventsByDate[dateKey] || [] : [];
              return (
                <div
                  key={dateKey}
                  className={`calendar-cell${day ? ' calendar-cell-active' : ''}`}
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
                      className="mb-2 calendar-card"
                      style={{
                        background: ev.billing_cycle === 'monthly' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                      }}
                    >
                      <Card.Body className="p-2">
                        <div className="d-flex justify-content-between align-items-center calendar-card-header">
                          <div className="calendar-text">
                            <div className="calendar-name">{ev.name}</div>
                            <div className="calendar-cycle">{ev.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly'}</div>
                          </div>
                          <div className="calendar-amount">{formatCurrency(ev.amount)}</div>
                        </div>
                        <div className="calendar-category">{ev.category}</div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              );
            })}
            </div>
          </div>
        </Card>
      )}
    </Container>
  );
};

export default CalendarPage;
