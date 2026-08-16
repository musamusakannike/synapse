import { Router } from 'express';
import { getLeaderboard } from '../controllers/leaderboard.controller';
import { optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', optionalAuth, getLeaderboard);

export default router;
