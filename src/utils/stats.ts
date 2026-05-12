import type { ColumnSummary, DataRow } from '../types/data'

const isDateLike = (value: string): boolean => {
  if (!value) return false
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp)
}

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const mean = (values: number[]): number =>
  values.reduce((acc, current) => acc + current, 0) / values.length

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

const stdDev = (values: number[]): number => {
  const avg = mean(values)
  const variance =
    values.reduce((acc, current) => acc + (current - avg) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

export const getSummary = (data: DataRow[]): ColumnSummary[] => {
  if (data.length === 0) return []

  const columns = Object.keys(data[0])

  return columns.map((column) => {
    const rawValues = data.map((row) => row[column])
    const cleanedValues = rawValues.filter(
      (value) => value !== null && value !== undefined && value !== '',
    )
    const missing = rawValues.length - cleanedValues.length

    const numericValues = cleanedValues
      .map((value) => toNumber(value))
      .filter((value): value is number => value !== null)

    const stringValues = cleanedValues.map((value) => String(value))
    const dateLikeCount = stringValues.filter((value) => isDateLike(value)).length

    const isNumeric = numericValues.length > 0 && numericValues.length === cleanedValues.length
    const isDatetime =
      !isNumeric &&
      stringValues.length > 0 &&
      dateLikeCount / stringValues.length >= 0.8

    if (isNumeric) {
      return {
        column,
        type: 'numeric',
        count: rawValues.length,
        missing,
        unique: new Set(numericValues).size,
        numericStats: {
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          mean: mean(numericValues),
          median: median(numericValues),
          stdDev: stdDev(numericValues),
        },
      }
    }

    const frequencyMap = new Map<string, number>()
    stringValues.forEach((value) => {
      frequencyMap.set(value, (frequencyMap.get(value) ?? 0) + 1)
    })

    const topValues = [...frequencyMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([value, count]) => ({ value, count }))

    return {
      column,
      type: isDatetime ? 'datetime' : 'categorical',
      count: rawValues.length,
      missing,
      unique: new Set(stringValues).size,
      categoryStats: { topValues },
    }
  })
}
