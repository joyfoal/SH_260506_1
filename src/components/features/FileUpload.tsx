import { useState, type ChangeEvent } from 'react'
import { useCSVParser } from '../../hooks/useCSVParser'
import { useEDA } from '../../hooks/useEDA'
import { useDataStore } from '../../store/useDataStore'

export const FileUpload = () => {
  const [error, setError] = useState<string | null>(null)
  const { parseCSV } = useCSVParser()
  const { analyze } = useEDA()
  const setFileData = useDataStore((state) => state.setFileData)

  const onChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      setError('CSV 파일만 업로드할 수 있습니다.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB 이하여야 합니다.')
      return
    }

    try {
      setError(null)
      const rows = await parseCSV(file)
      const { summary, charts } = analyze(rows)
      setFileData({ fileName: file.name, rows, summary, charts })
    } catch {
      setError('CSV 파싱 중 오류가 발생했습니다.')
    }
  }

  return (
    <section className="card">
      <h2>1) CSV 업로드</h2>
      <p className="muted">단일 CSV 파일을 업로드하면 자동 분석이 시작됩니다.</p>
      <input type="file" accept=".csv,text/csv" onChange={onChange} />
      {error && <p className="error">{error}</p>}
    </section>
  )
}
