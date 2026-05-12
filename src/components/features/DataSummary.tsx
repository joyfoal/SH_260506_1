import { useDataStore } from '../../store/useDataStore'

export const DataSummary = () => {
  const fileName = useDataStore((state) => state.fileName)
  const rows = useDataStore((state) => state.rows)
  const summary = useDataStore((state) => state.summary)

  if (!fileName) return null

  return (
    <section className="card">
      <h2>2) 데이터 개요 / EDA</h2>
      <p className="muted">
        파일: <strong>{fileName}</strong> · 행: <strong>{rows.length}</strong> · 열:{' '}
        <strong>{summary.length}</strong>
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>컬럼</th>
              <th>타입</th>
              <th>결측</th>
              <th>고유값</th>
              <th>기초통계</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((col) => (
              <tr key={col.column}>
                <td>{col.column}</td>
                <td>{col.type}</td>
                <td>{col.missing}</td>
                <td>{col.unique}</td>
                <td>
                  {col.numericStats
                    ? `mean ${col.numericStats.mean.toFixed(2)} / std ${col.numericStats.stdDev.toFixed(2)}`
                    : col.categoryStats?.topValues
                        .slice(0, 2)
                        .map((item) => `${item.value}(${item.count})`)
                        .join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
