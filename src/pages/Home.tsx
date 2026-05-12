import { ChartViewer } from '../components/features/ChartViewer'
import { DataSummary } from '../components/features/DataSummary'
import { FileUpload } from '../components/features/FileUpload'
import { InsightPanel } from '../components/features/InsightPanel'
import { useDataStore } from '../store/useDataStore'

export const Home = () => {
  const reset = useDataStore((state) => state.reset)

  return (
    <main className="container">
      <header className="hero">
        <h1>CSV 데이터 분석 자동화</h1>
        <p>CSV 업로드 후 자동으로 EDA, 시각화, 인사이트를 생성합니다.</p>
        <button type="button" className="secondary" onClick={reset}>
          초기화
        </button>
      </header>

      <FileUpload />
      <DataSummary />
      <ChartViewer />
      <InsightPanel />
    </main>
  )
}
