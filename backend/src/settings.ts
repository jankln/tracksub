import { Router, Request, Response, NextFunction } from 'express';
import { User } from './models';
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

// Get user notification settings
router.get('/', protectedRoute, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ notification_days: user.notification_days || 7 });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

// Update user notification settings
router.put('/', protectedRoute, async (req: AuthRequest, res: Response) => {
  const { notification_days } = req.body;
  
  try {
    await User.update(
      { notification_days },
      { where: { id: req.user.id } }
    );
    
    res.status(200).json({ message: 'Settings updated successfully', notification_days });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings' });
  }
});

export default router;
