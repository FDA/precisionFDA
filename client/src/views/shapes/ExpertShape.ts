
interface IExpert {
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
  totalAnswerCount: number,
  totalCommentCount: number,
}

const mapToExpert = (data: any) => {
  const expert = {
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
    totalAnswerCount: data.total_answer_count,
    totalCommentCount: data.total_comment_count,
  }
  return expert
}

export type { IExpert }
export { mapToExpert }
