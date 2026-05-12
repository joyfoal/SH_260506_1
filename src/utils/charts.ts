import type { ChartSpec, ColumnSummary, DataRow } from '../types/data'

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const quantile = (values: number[], q: number): number => {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const pos = (sorted.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  const next = sorted[base + 1] ?? sorted[base]
  return sorted[base] + rest * (next - sorted[base])
}

const makeHistogram = (data: DataRow[], column: string): ChartSpec | null => {
  let values = data.map((row) => toNumber(row[column])).filter((v): v is number => v !== null)
  if (values.length === 0) return null

  // Notebook pattern: clip extreme tail before drawing target distribution.
  if (column === 'y' || column.toLowerCase() === 'target') {
    const upper = quantile(values, 0.99)
    values = values.map((value) => Math.min(value, upper))
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const binCount = Math.min(12, Math.max(6, Math.floor(Math.sqrt(values.length))))
  const step = (max - min || 1) / binCount
  const bins = Array.from({ length: binCount }, (_, i) => ({
    bin: `${(min + i * step).toFixed(1)}-${(min + (i + 1) * step).toFixed(1)}`,
    count: 0,
  }))

  values.forEach((value) => {
    const index = Math.min(binCount - 1, Math.floor((value - min) / step))
    bins[index].count += 1
  })

  return {
    id: `hist-${column}`,
    title: `${column} distribution`,
    type: 'histogram',
    data: bins,
    xKey: 'bin',
    yKey: 'count',
  }
}

const makeBar = (data: DataRow[], column: string): ChartSpec | null => {
  const map = new Map<string, number>()
  data.forEach((row) => {
    const value = row[column]
    const key = value === null || value === undefined || value === '' ? 'Missing' : String(value)
    map.set(key, (map.get(key) ?? 0) + 1)
  })

  const points = [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([label, count]) => ({ label, count }))

  if (points.length === 0) return null

  return {
    id: `bar-${column}`,
    title: `${column} frequency`,
    type: 'bar',
    data: points,
    xKey: 'label',
    yKey: 'count',
  }
}

const makeScatter = (data: DataRow[], xCol: string, yCol: string): ChartSpec | null => {
  const points = data
    .map((row) => {
      const x = toNumber(row[xCol])
      const y = toNumber(row[yCol])
      if (x === null || y === null) return null
      return { x, y }
    })
    .filter((point): point is { x: number; y: number } => point !== null)
    .slice(0, 300)

  if (points.length < 5) return null

  return {
    id: `scatter-${xCol}-${yCol}`,
    title: `${xCol} vs ${yCol}`,
    type: 'scatter',
    data: points,
    xKey: 'x',
    yKey: 'y',
  }
}

const makeLine = (data: DataRow[], dateCol: string, yCol: string): ChartSpec | null => {
  const points = data
    .map((row) => {
      const y = toNumber(row[yCol])
      const date = row[dateCol] ? new Date(String(row[dateCol])) : null
      if (!date || Number.isNaN(date.getTime()) || y === null) return null
      return { x: date.toISOString().slice(0, 10), y }
    })
    .filter((point): point is { x: string; y: number } => point !== null)
    .sort((a, b) => a.x.localeCompare(b.x))
    .slice(0, 240)

  if (points.length < 5) return null

  return {
    id: `line-${dateCol}-${yCol}`,
    title: `${yCol} over ${dateCol}`,
    type: 'line',
    data: points,
    xKey: 'x',
    yKey: 'y',
  }
}

const makeSortedTargetProfile = (data: DataRow[], targetCol: string): ChartSpec | null => {
  const values = data
    .map((row) => toNumber(row[targetCol]))
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b)

  if (values.length < 5) return null

  const points = values.map((value, index) => ({ index, value }))
  return {
    id: `target-profile-${targetCol}`,
    title: `Sorted ${targetCol} profile`,
    type: 'line',
    data: points,
    xKey: 'index',
    yKey: 'value',
  }
}

const makeCategoryTargetChart = (
  data: DataRow[],
  categoryCol: string,
  targetCol: string,
): ChartSpec | null => {
  const grouped = new Map<string, { sum: number; count: number }>()
  data.forEach((row) => {
    const category =
      row[categoryCol] === null || row[categoryCol] === undefined || row[categoryCol] === ''
        ? 'Missing'
        : String(row[categoryCol])
    const target = toNumber(row[targetCol])
    if (target === null) return
    const previous = grouped.get(category) ?? { sum: 0, count: 0 }
    grouped.set(category, { sum: previous.sum + target, count: previous.count + 1 })
  })

  const points = [...grouped.entries()]
    .map(([label, agg]) => ({ label, meanTarget: agg.sum / agg.count, n: agg.count }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 8)

  if (points.length < 2) return null

  return {
    id: `cat-target-${categoryCol}-${targetCol}`,
    title: `${categoryCol} vs ${targetCol} (mean)`,
    type: 'bar',
    data: points,
    xKey: 'label',
    yKey: 'meanTarget',
  }
}

export const generateCharts = (data: DataRow[], summary: ColumnSummary[]): ChartSpec[] => {
  if (data.length === 0) return []

  const charts: ChartSpec[] = []
  const numericColumns = summary.filter((col) => col.type === 'numeric').map((col) => col.column)
  const categoricalColumns = summary
    .filter((col) => col.type === 'categorical')
    .map((col) => col.column)
  const datetimeColumns = summary.filter((col) => col.type === 'datetime').map((col) => col.column)
  const preferredTarget =
    summary.find((col) => col.column === 'y' && col.type === 'numeric')?.column ??
    summary.find((col) => col.column.toLowerCase() === 'target' && col.type === 'numeric')
      ?.column ??
    null

  numericColumns.slice(0, 2).forEach((column) => {
    const histogram = makeHistogram(data, column)
    if (histogram) charts.push(histogram)
  })

  categoricalColumns.slice(0, 2).forEach((column) => {
    const bar = makeBar(data, column)
    if (bar) charts.push(bar)
  })

  if (numericColumns.length >= 2) {
    const scatter = makeScatter(data, numericColumns[0], numericColumns[1])
    if (scatter) charts.push(scatter)
  }

  if (datetimeColumns.length > 0 && numericColumns.length > 0) {
    const line = makeLine(data, datetimeColumns[0], numericColumns[0])
    if (line) charts.push(line)
  }

  if (preferredTarget) {
    const targetProfile = makeSortedTargetProfile(data, preferredTarget)
    if (targetProfile) charts.unshift(targetProfile)

    const topCategory = categoricalColumns[0]
    if (topCategory) {
      const categoryTarget = makeCategoryTargetChart(data, topCategory, preferredTarget)
      if (categoryTarget) charts.push(categoryTarget)
    }
  }

  return charts.slice(0, 6)
}
