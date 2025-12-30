import { FocusMetric, Session } from '@prisma/client';

import { prisma } from '../prisma.js';
import { CreateSessionRequest, MetricsRequest } from '../types/api.js';

export class SessionNotFoundError extends Error {
  constructor(message = 'Session not found') {
    super(message);
    this.name = 'SessionNotFoundError';
  }
}

export async function createSession(payload: CreateSessionRequest): Promise<string> {
  const session = await prisma.session.create({
    data: {
      title: payload.title.trim(),
      description: payload.description ? payload.description.trim() : null,
      plannedDurationSec: Math.round(payload.planned_duration_seconds),
    },
    select: { id: true },
  });

  return session.id;
}

export async function addSessionMetrics(payload: MetricsRequest): Promise<void> {
  const sessionExists = await prisma.session.findUnique({
    where: { id: payload.session_id },
    select: { id: true },
  });

  if (!sessionExists) {
    throw new SessionNotFoundError();
  }

  await prisma.focusMetric.create({
    data: {
      sessionId: payload.session_id,
      avgFocusScore: Math.round(payload.avg_focus_score),
      productiveSeconds: Math.round(payload.productive_seconds),
      unproductiveSeconds: Math.round(payload.unproductive_seconds),
    },
  });

  if (payload.distractions.length > 0) {
    await prisma.distraction.createMany({
      data: payload.distractions.map((d) => ({
        sessionId: payload.session_id,
        type: d.type.trim(),
        count: Math.round(d.count),
      })),
    });
  }
}

export async function endSession(sessionId: string): Promise<void> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { id: true, endedAt: true },
  });

  if (!session) {
    throw new SessionNotFoundError();
  }

  if (!session.endedAt) {
    await prisma.session.update({
      where: { id: sessionId },
      data: { endedAt: new Date() },
    });
  }
}

export async function getSession(sessionId: string): Promise<Session> {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });

  if (!session) {
    throw new SessionNotFoundError();
  }

  return session;
}

export async function getSessionMetrics(sessionId: string): Promise<FocusMetric[]> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { id: true },
  });

  if (!session) {
    throw new SessionNotFoundError();
  }

  return prisma.focusMetric.findMany({
    where: { sessionId },
    orderBy: { timestamp: 'asc' },
  });
}

export async function getSessionDistractions(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { id: true },
  });

  if (!session) {
    throw new SessionNotFoundError();
  }

  return prisma.distraction.findMany({
    where: { sessionId },
  });
}
