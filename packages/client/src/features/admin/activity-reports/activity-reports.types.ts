export interface MetricResult {
  total: number
  data: [number, number][]
}

export interface ActivityTotals {
  apps: number
  publicApps: number
  runtime: number
  dataStorage: number
  numberOfFiles: number
}

export type DateRangePreset = 'day' | 'week' | 'month' | 'year'

export interface ChartConfig {
  key: string
  label: string
  endpoint: string
  formatBytes?: boolean
}

export interface SectionConfig {
  title: string
  icon: string
  charts: ChartConfig[]
}
