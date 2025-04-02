export type TreeRootItem = {
  type: 'app' | 'job' | 'file' | 'asset' | 'comparison'
  title: string
  url: string
  identifier: string
  scope?: string
}

export type TreeRoot = {
  data: TreeRootItem
  parents?: TreeRoot[]
}
