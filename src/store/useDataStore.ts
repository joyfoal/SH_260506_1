import { create } from 'zustand'
import type { ChartSpec, ColumnSummary, DataRow } from '../types/data'

interface DataStoreState {
  fileName: string | null
  rows: DataRow[]
  summary: ColumnSummary[]
  charts: ChartSpec[]
  insights: string[]
  setFileData: (payload: {
    fileName: string
    rows: DataRow[]
    summary: ColumnSummary[]
    charts: ChartSpec[]
  }) => void
  setInsights: (insights: string[]) => void
  reset: () => void
}

const initialState = {
  fileName: null,
  rows: [],
  summary: [],
  charts: [],
  insights: [],
}

export const useDataStore = create<DataStoreState>((set) => ({
  ...initialState,
  setFileData: ({ fileName, rows, summary, charts }) =>
    set(() => ({ fileName, rows, summary, charts, insights: [] })),
  setInsights: (insights) => set(() => ({ insights })),
  reset: () => set(() => initialState),
}))
