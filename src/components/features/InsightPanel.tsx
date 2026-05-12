import { useInsights } from '../../hooks/useInsights'
import { useDataStore } from '../../store/useDataStore'
import { generateHeuristicInsights } from '../../utils/insights'

export const InsightPanel = () => {
  const summary = useDataStore((state) => state.summary)
  const charts = useDataStore((state) => state.charts)
  const insights = useDataStore((state) => state.insights)
  const setInsights = useDataStore((state) => state.setInsights)

  const insightsMutation = useInsights()

  if (summary.length === 0) return null

  const onGenerate = async () => {
    const response = await insightsMutation.mutateAsync({ summary, charts })
    setInsights(response.insights?.length ? response.insights : generateHeuristicInsights(summary))
  }

  return (
    <section className="card">
      <h2>4) AI 인사이트</h2>
      <button type="button" onClick={onGenerate} disabled={insightsMutation.isPending}>
        {insightsMutation.isPending ? '인사이트 생성 중...' : '인사이트 생성'}
      </button>
      {insights.length > 0 && (
        <ul className="insight-list">
          {insights.map((insight, idx) => (
            <li key={`${insight}-${idx}`}>{insight}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
