import { Router } from 'express';

import { getReportHandler } from '../controllers/report.controller.js';

const router = Router();

router.get('/:id/report', getReportHandler);

export default router;
