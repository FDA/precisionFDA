import { IListItem } from './listItem'

interface IExpert extends IListItem {
  id: number,
  user_id: number,
  image: string,
  state: "open" | "closed",
  scope: "public" | "private",
  createdAt: Date,
  updatedAt: Date,
  title: string,
  about: string,
  blog: string,
  blogTitle: string,
  blogPreview: string,
  totalAnswerCount: number,
  totalCommentCount: number,
}

const mapToExpert = (data: any) => {
  return {
    id: data.id,
    user_id: data.user_id,
    image: data.image,
    state: data.state,
    scope: data.scope,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    title: data.title,
    about: data.about,
    blog: data.blog,
    blogTitle: data.blog_title,
    blogPreview: data.blog_preview,
    totalAnswerCount: data.total_answer_count,
    totalCommentCount: data.total_comment_count,
  }
}

const mapToExpertNodeApi = (data: any) => ({
  id: data.id,
  user_id: data.user,
  image: data.image,
  state: data.state,
  scope: data.scope,
  createdAt: new Date(data.createdAt),
  updatedAt: new Date(data.updatedAt),
  title: data.meta.title,
  about: data.meta.about,
  blog: data.meta.blog,
  blogTitle: data.meta.blogTitle,
  blogPreview: data.meta.blogPreview,
  totalAnswerCount: data.meta.totalAnswerCount,
  totalCommentCount: data.meta.totalCommentCount,
})

export type { IExpert }
export { mapToExpertNodeApi, mapToExpert }
