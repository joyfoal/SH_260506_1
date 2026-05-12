export type DataRow = Record<string, string | number | null>

export type ColumnType = 'numeric' | 'categorical' | 'datetime' | 'unknown'

export interface NumericStats {
  min: number
  max: number
  mean: number
  median: number
  stdDev: number
}

export interface CategoryStats {
  topValues: Array<{ value: string; count: number }>
}

export interface ColumnSummary {
  column: string
  type: ColumnType
  count: number
  missing: number
  unique: number
  numericStats?: NumericStats
  categoryStats?: CategoryStats
}

export type ChartType = 'histogram' | 'bar' | 'scatter' | 'line'

export interface ChartSpec {
  id: string
  title: string
  type: ChartType
  data: Array<Record<string, string | number>>
  xKey: string
  yKey: string
}
