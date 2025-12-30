import { Request, Response } from 'express';

import {
  addSessionMetrics,
  createSession,
  endSession,
  SessionNotFoundError,
} from '../services/session.service.js';
import {
  CreateSessionRequest,
  EndSessionRequest,
  MetricsRequest,
} from '../types/api.js';

const isValidString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const isValidCreateBody = (body: any): body is CreateSessionRequest =>
  body &&
  isValidString(body.title) &&
  (body.description === null || body.description === undefined || typeof body.description === 'string') &&
  isFiniteNumber(body.planned_duration_seconds) &&
  body.planned_duration_seconds > 0;

const isValidMetricsBody = (body: any): body is MetricsRequest =>
  body &&
  isValidString(body.session_id) &&
  isFiniteNumber(body.avg_focus_score) &&
  body.avg_focus_score >= 0 &&
  body.avg_focus_score <= 100 &&
  isFiniteNumber(body.productive_seconds) &&
  body.productive_seconds >= 0 &&
  isFiniteNumber(body.unproductive_seconds) &&
  body.unproductive_seconds >= 0 &&
  Array.isArray(body.distractions) &&
  body.distractions.every(
    (d: any) => d && isValidString(d.type) && isFiniteNumber(d.count) && d.count >= 0,
  );

const isValidEndBody = (body: any): body is EndSessionRequest =>
  body && isValidString(body.session_id);

export async function createSessionHandler(req: Request, res: Response) {
  if (!isValidCreateBody(req.body)) {
    return res.status(400).json({ error: 'Invalid request payload' });
  }

  try {
    const sessionId = await createSession(req.body);
    const response = { session_id: sessionId };
    return res.status(201).json(response);
  } catch (error) {
    console.error('Failed to create session', error);
    return res.status(500).json({ error: 'Failed to create session' });
  }
}

export async function ingestMetricsHandler(req: Request, res: Response) {
  if (!isValidMetricsBody(req.body)) {
    return res.status(400).json({ error: 'Invalid request payload' });
  }

  try {
    await addSessionMetrics(req.body);
    return res.status(201).json({ status: 'ok' });
  } catch (error) {
    if (error instanceof SessionNotFoundError) {
      return res.status(404).json({ error: 'Session not found' });
    }

    console.error('Failed to record metrics', error);
    return res.status(500).json({ error: 'Failed to record metrics' });
  }
}

export async function endSessionHandler(req: Request, res: Response) {
  if (!isValidEndBody(req.body)) {
    return res.status(400).json({ error: 'Invalid request payload' });
  }

  try {
    await endSession(req.body.session_id);
    return res.status(200).json({ status: 'ended' });
  } catch (error) {
    if (error instanceof SessionNotFoundError) {
      return res.status(404).json({ error: 'Session not found' });
    }

    console.error('Failed to end session', error);
    return res.status(500).json({ error: 'Failed to end session' });
  }
}
