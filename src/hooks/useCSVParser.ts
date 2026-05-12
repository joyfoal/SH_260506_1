import Papa, { type ParseResult } from 'papaparse'
import type { DataRow } from '../types/data'

export const useCSVParser = () => {
  const parseCSV = (file: File): Promise<DataRow[]> =>
    new Promise((resolve, reject) => {
      Papa.parse<DataRow>(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (result: ParseResult<DataRow>) => resolve(result.data),
        error: (error: Error) => reject(error),
      })
    })

  return { parseCSV }
}
