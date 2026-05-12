import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useDataStore } from '../../store/useDataStore'

export const ChartViewer = () => {
  const charts = useDataStore((state) => state.charts)
  if (charts.length === 0) return null

  const renderChart = (chart: (typeof charts)[number]) => {
    if (chart.type === 'bar' || chart.type === 'histogram') {
      return (
        <BarChart data={chart.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={chart.xKey} />
          <YAxis />
          <Tooltip />
          <Bar dataKey={chart.yKey} fill="#2563eb" />
        </BarChart>
      )
    }

    if (chart.type === 'line') {
      return (
        <LineChart data={chart.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={chart.xKey} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey={chart.yKey} stroke="#16a34a" />
        </LineChart>
      )
    }

    return (
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={chart.xKey} type="number" />
        <YAxis dataKey={chart.yKey} type="number" />
        <Tooltip />
        <Scatter data={chart.data} fill="#7c3aed" />
      </ScatterChart>
    )
  }

  return (
    <section className="card">
      <h2>3) 자동 생성 시각화</h2>
      <div className="chart-grid">
        {charts.map((chart) => (
          <article key={chart.id} className="chart-card">
            <h3>{chart.title}</h3>
            <ResponsiveContainer width="100%" height={240}>
              {renderChart(chart)}
            </ResponsiveContainer>
          </article>
        ))}
      </div>
    </section>
  )
}
