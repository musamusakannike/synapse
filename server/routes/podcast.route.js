import express from 'express';
import { 
  generatePodcastScript, 
  generatePodcastAudio, 
  generateFullPodcast,
  downloadAudio,
  getPodcastHistory,
  getPodcastById,
  deletePodcast
} from '../controllers/podcast.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Generate podcast script only
router.post('/script', authMiddleware, generatePodcastScript);

// Convert script to audio
router.post('/audio', authMiddleware, generatePodcastAudio);

// Generate complete podcast (script + audio)
router.post('/generate', authMiddleware, generateFullPodcast);

// Get user's podcast history
router.get('/history', authMiddleware, getPodcastHistory);

// Get specific podcast by ID
router.get('/:podcastId', authMiddleware, getPodcastById);

// Delete specific podcast
router.delete('/:podcastId', authMiddleware, deletePodcast);

// Download audio file
router.get('/download/:audioId', downloadAudio);

export default router;