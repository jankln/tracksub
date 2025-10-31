
import { Router, Request, Response, NextFunction } from 'express';
import { Subscription } from './models';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

interface AuthRequest extends Request {
  user?: any;
}

// Middleware to protect routes
const protectedRoute = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Get all subscriptions for a user
router.get('/', protectedRoute, async (req: AuthRequest, res: Response) => {
  try {
    const subscriptions = await Subscription.findAll({
      where: { user_id: req.user.id },
      order: [['next_payment_date', 'ASC']]
    });
    res.status(200).json({ subscriptions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscriptions' });
  }
});

// Get a single subscription by ID
router.get('/:id', protectedRoute, async (req: AuthRequest, res: Response) => {
  try {
    const subscription = await Subscription.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.id 
      }
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    res.status(200).json({ subscription });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription' });
  }
});

// Create a new subscription
router.post('/', protectedRoute, async (req: AuthRequest, res: Response) => {
  const { name, billing_cycle, start_date, next_payment_date, amount, category, status } = req.body;
  
  try {
    const subscription = await Subscription.create({
      user_id: req.user.id,
      name,
      billing_cycle,
      start_date,
      next_payment_date,
      amount,
      category: category || 'Other',
      status: status || 'active'
    });
    
    res.status(201).json({ id: subscription.id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating subscription' });
  }
});

// Update a subscription
router.put('/:id', protectedRoute, async (req: AuthRequest, res: Response) => {
  const { name, billing_cycle, start_date, next_payment_date, amount, category, status } = req.body;
  
  try {
    const [updated] = await Subscription.update(
      {
        name,
        billing_cycle,
        start_date,
        next_payment_date,
        amount,
        category: category || 'Other',
        status: status || 'active'
      },
      {
        where: { 
          id: req.params.id,
          user_id: req.user.id 
        }
      }
    );
    
    if (updated === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    res.status(200).json({ message: 'Subscription updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating subscription' });
  }
});

// Delete a subscription
router.delete('/:id', protectedRoute, async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await Subscription.destroy({
      where: { 
        id: req.params.id,
        user_id: req.user.id 
      }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    res.status(200).json({ message: 'Subscription deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subscription' });
  }
});

export default router;
