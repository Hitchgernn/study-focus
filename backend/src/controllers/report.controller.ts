import { Request, Response } from 'express';

import { SessionNotFoundError } from '../services/session.service.js';
import { generateReport } from '../services/report.service.js';

export async function getReportHandler(req: Request, res: Response) {
  const sessionId = req.params.id;
  if (!sessionId) {
    return res.status(400).json({ error: 'Session id is required' });
  }

  try {
    const report = await generateReport(sessionId);
    return res.status(200).json(report);
  } catch (error) {
    if (error instanceof SessionNotFoundError) {
      return res.status(404).json({ error: 'Session not found' });
    }

    console.error('Failed to generate report', error);
    return res.status(500).json({ error: 'Failed to generate report' });
  }
}
