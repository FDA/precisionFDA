export interface NewsItem {
  id: number
  title: string
  link: string
  isPublication: boolean
  content: string
  userId?: number | null
  video: string
  position: number
  published: boolean
  createdAt: string
  updatedAt: string
  user?: null
  when?: null
}

export interface NewsListParams {
  type?: 'article' | 'publication'
  year?: string
  page?: number
  pageSize?: number
  orderBy?: 'isPublication' | 'createdAt'
}

export interface NewsItemPayload {
  title: string
  createdAt: string
  video?: string
  content: string
  link: string
  isPublication: boolean
  published: boolean
}
