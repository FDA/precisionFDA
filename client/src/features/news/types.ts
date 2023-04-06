export interface NewsItem {
  id: number;
  title: string;
  link: string;
  isPublication: boolean;
  content: string;
  user_id?: number;
  video: string;
  position: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsListParams {
  type?: 'article' | 'publication'
  year?: string
  page?: number
  perPage?: number
  orderBy?: 'isPublication' | 'createdAt'
}
