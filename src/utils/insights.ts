import type { ColumnSummary } from '../types/data'

export const generateHeuristicInsights = (summary: ColumnSummary[]): string[] => {
  const insights: string[] = []
  const numericColumns = summary.filter((col) => col.type === 'numeric')
  const categoricalColumns = summary.filter((col) => col.type === 'categorical')

  const highMissing = summary
    .map((col) => ({ name: col.column, ratio: col.missing / Math.max(col.count, 1) }))
    .filter((item) => item.ratio > 0.2)
    .sort((a, b) => b.ratio - a.ratio)

  if (highMissing.length > 0) {
    insights.push(
      `Missing values are high in ${highMissing[0].name} (${(highMissing[0].ratio * 100).toFixed(1)}%).`,
    )
  } else if (summary.length > 0) {
    insights.push('No missing values were detected across columns.')
  }

  const highVariance = numericColumns
    .filter((col) => col.numericStats)
    .sort((a, b) => (b.numericStats?.stdDev ?? 0) - (a.numericStats?.stdDev ?? 0))

  if (highVariance.length > 0) {
    const top = highVariance[0]
    insights.push(
      `${top.column} shows the widest spread (std dev ${top.numericStats?.stdDev.toFixed(2)}), so outlier checks are recommended.`,
    )
  }

  const dominantCategory = categoricalColumns
    .map((col) => ({
      column: col.column,
      top: col.categoryStats?.topValues[0],
    }))
    .filter((item) => item.top)
    .sort((a, b) => (b.top?.count ?? 0) - (a.top?.count ?? 0))

  if (dominantCategory.length > 0) {
    const top = dominantCategory[0]
    insights.push(
      `${top.column} is skewed toward "${top.top?.value}" (${top.top?.count} records), which may indicate class imbalance.`,
    )
  }

  if (numericColumns.length >= 2) {
    insights.push(
      `At least two numeric columns were found (${numericColumns[0].column}, ${numericColumns[1].column}), enabling scatter and correlation analysis.`,
    )
  }

  const binaryLikeColumns = summary.filter((col) => col.unique <= 2)
  if (binaryLikeColumns.length > 0) {
    insights.push(
      `${binaryLikeColumns.length} columns are binary/near-constant, so feature selection may improve analysis quality.`,
    )
  }

  return insights.slice(0, 4)
}
