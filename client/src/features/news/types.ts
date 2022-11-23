export interface NewsItem {
  id: number;
  title: string;
  link: string;
  when?: any;
  content: string;
  user_id?: number;
  video: string;
  position: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewsListParams {
  year?: string
  page?: number
  perPage?: number
}
