import { IListItem } from "./listItem"

interface IParticipant extends IListItem {
  id: number,
  title: string,
  imageURL: string,
  nodeId: number,
  public: boolean,
  kind: number,
  position: number,
  createdAt: Date,
  updatedAt: Date,
}

const mapToParticipant = (data: any) => {
  const participant = {
    id: data.id,
    title: data.title,
    imageURL: data.image_url,
    nodeId: data.node_id,
    public: data.public,
    position: data.position,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
  return participant
}

export type { IParticipant }
export { mapToParticipant }
