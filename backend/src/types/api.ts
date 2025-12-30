export interface CreateSessionRequest {
  title: string;
  description?: string | null;
  planned_duration_seconds: number;
}

export interface CreateSessionResponse {
  session_id: string;
}

export interface MetricsRequest {
  session_id: string;
  avg_focus_score: number;
  productive_seconds: number;
  unproductive_seconds: number;
  distractions: Array<{
    type: string;
    count: number;
  }>;
}

export interface EndSessionRequest {
  session_id: string;
}

export interface ReportResponse {
  overall_focus_score: number;
  focus_quality: number;
  resilience: number;
  successful_nudges: number;
  estimated_time_saved_minutes: number;
  productive_time_seconds: number;
  unproductive_time_seconds: number;
  top_distractions: Array<{ type: string; count: number }>;
  productive_sites: string[];
  summary_text: string;
}
