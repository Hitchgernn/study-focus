import { FocusMetric } from '@prisma/client';

import { ReportResponse } from '../types/api.js';
import {
  getSession,
  getSessionDistractions,
  getSessionMetrics,
  SessionNotFoundError,
} from './session.service.js';

const average = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

const sum = (values: number[]) => values.reduce((acc, value) => acc + value, 0);

function buildTopDistractions(distractions: { type: string; count: number }[]) {
  const tally = distractions.reduce<Record<string, number>>((acc, distraction) => {
    const key = distraction.type.trim();
    acc[key] = (acc[key] ?? 0) + distraction.count;
    return acc;
  }, {});

  return Object.entries(tally)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

function calculateResilience(metrics: FocusMetric[]) {
  if (metrics.length < 2) {
    return { resilience: metrics.length === 0 ? 0 : 100, successfulNudges: 0 };
  }

  let drops = 0;
  let recoveries = 0;

  for (let i = 1; i < metrics.length; i += 1) {
    const previous = metrics[i - 1].avgFocusScore;
    const current = metrics[i].avgFocusScore;
    const drop = previous - current;

    if (drop >= 10) {
      drops += 1;
      const next = metrics[i + 1];
      if (next && next.avgFocusScore - current >= 5) {
        recoveries += 1;
      }
    }
  }

  const resilienceScore =
    drops === 0 ? 100 : Math.min(100, Math.round((recoveries / drops) * 100));

  return { resilience: resilienceScore, successfulNudges: recoveries };
}

function estimateTimeSavedMinutes(productiveSeconds: number, plannedDurationSec: number) {
  const baselineProductive = plannedDurationSec * 0.6;
  const savedSeconds = Math.max(0, productiveSeconds - baselineProductive);
  return Math.round(savedSeconds / 60);
}

export async function generateReport(sessionId: string): Promise<ReportResponse> {
  const session = await getSession(sessionId);
  if (!session) {
    throw new SessionNotFoundError();
  }

  const [metrics, distractions] = await Promise.all([
    getSessionMetrics(sessionId),
    getSessionDistractions(sessionId),
  ]);

  const overallFocusScore = Math.round(average(metrics.map((metric) => metric.avgFocusScore)));
  const productiveTimeSeconds = sum(metrics.map((metric) => metric.productiveSeconds));
  const unproductiveTimeSeconds = sum(metrics.map((metric) => metric.unproductiveSeconds));
  const totalTrackedTime = productiveTimeSeconds + unproductiveTimeSeconds;
  const focusQuality =
    totalTrackedTime === 0
      ? 0
      : Math.round((productiveTimeSeconds / totalTrackedTime) * 100);

  const { resilience, successfulNudges } = calculateResilience(metrics);
  const estimatedTimeSavedMinutes = estimateTimeSavedMinutes(
    productiveTimeSeconds,
    session.plannedDurationSec,
  );
  const topDistractions = buildTopDistractions(distractions);

  const summaryText = `Session "${session.title}" recorded with ${productiveTimeSeconds} productive seconds and ${unproductiveTimeSeconds} unproductive seconds.`;

  return {
    overall_focus_score: overallFocusScore,
    focus_quality: focusQuality,
    resilience,
    successful_nudges: successfulNudges,
    estimated_time_saved_minutes: estimatedTimeSavedMinutes,
    productive_time_seconds: productiveTimeSeconds,
    unproductive_time_seconds: unproductiveTimeSeconds,
    top_distractions: topDistractions,
    productive_sites: [],
    summary_text: summaryText,
  };
}
