export interface NewsItem {
  id: number;
  title: string;
  link: string;
  isPublication: boolean;
  content: string;
  userId?: number | null;
  video: string;
  position: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  user?: null
  when?: null
}

export interface NewsListParams {
  type?: 'article' | 'publication'
  year?: string
  page?: number
  perPage?: number
  orderBy?: 'isPublication' | 'createdAt'
}
