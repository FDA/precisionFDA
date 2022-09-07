import { IListItem } from "./listItem"

interface INewsItem extends IListItem {
  id: number,
  title: string,
  link: string,
  when: Date | undefined,
  content: string | undefined,
  userId: number | undefined,
  video: string | undefined,
  position: number | undefined,
  published: boolean,
  createdAt: Date,
  updatedAt: Date,
}

const mapToNewsItem = (data: any) => ({
  id: data.id,
  title: data.title,
  link: data.link,
  when: new Date(data.when),
  content: data.content,
  userId: data.user_id,
  video: data.video,
  position: data.position,
  published: data.published,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
})

export type { INewsItem }
export {
  mapToNewsItem,
}
