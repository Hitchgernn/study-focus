import { Router } from 'express';

import {
  createSessionHandler,
  endSessionHandler,
  ingestMetricsHandler,
} from '../controllers/session.controller.js';

const router = Router();

router.post('/create', createSessionHandler);
router.post('/metrics', ingestMetricsHandler);
router.post('/end', endSessionHandler);

export default router;
