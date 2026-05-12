import { useMutation } from '@tanstack/react-query'
import { requestInsights } from '../services/api'
import { generateHeuristicInsights } from '../utils/insights'
import type { ChartSpec, ColumnSummary } from '../types/data'

export const useInsights = () => {
  return useMutation({
    mutationFn: async (payload: { summary: ColumnSummary[]; charts: ChartSpec[] }) => {
      try {
        return await requestInsights(payload)
      } catch {
        return { insights: generateHeuristicInsights(payload.summary) }
      }
    },
  })
}
