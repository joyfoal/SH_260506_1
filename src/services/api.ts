import axios from 'axios'
import type { ChartSpec, ColumnSummary } from '../types/data'

interface InsightRequest {
  summary: ColumnSummary[]
  charts: ChartSpec[]
}

interface InsightResponse {
  insights: string[]
}

export const requestInsights = async (
  payload: InsightRequest,
): Promise<InsightResponse> => {
  const response = await axios.post<InsightResponse>('/api/insights', payload)
  return response.data
}
