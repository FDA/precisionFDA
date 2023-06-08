
export interface Meta {
  about: string;
  blog: string;
  blogTitle: string;
  blogPreview: string;
  title: string;
  totalQuestionCount: number;
  totalAnswerCount: number;
  totalCommentCount: number;
}

export interface Expert {
  id: number;
  createdAt: string;
  updatedAt: string;
  user: number;
  scope: string;
  state: string;
  meta: Meta;
  image: string;
}

export interface ExpertDetails {
  id: number;
  user_id: number;
  image: string;
  state: 'open' | 'closed',
  scope: 'public' | 'private',
  created_at: Date;
  updated_at: Date;
  title: string;
  about: string;
  blog_title: string;
  blog_preview: string;
  blog: string;
  total_question_count: number;
  total_answer_count: number;
  total_comment_count: number;
}

export interface ExpertDetailsResponse {
  expert: ExpertDetails;
}

