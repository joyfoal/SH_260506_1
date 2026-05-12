import { generateCharts } from '../utils/charts'
import { getSummary } from '../utils/stats'
import type { ChartSpec, ColumnSummary, DataRow } from '../types/data'

interface EdaResult {
  summary: ColumnSummary[]
  charts: ChartSpec[]
}

export const useEDA = () => {
  const analyze = (data: DataRow[]): EdaResult => {
    const summary = getSummary(data)
    const charts = generateCharts(data, summary)
    return { summary, charts }
  }

  return { analyze }
}
