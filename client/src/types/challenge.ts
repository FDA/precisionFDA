import { IListItem } from "./listItem";

interface IChallenge extends IListItem {
  id: number,
  name: string,
  appOwnerId: number,
  appId: number,
  description: string,
  meta: object,
  startAt: Date,
  endAt: Date,
  createdAt: Date,
  updatedAt: Date,
  status: "setup" | "open" | "paused" | "archived" | "result_announced",
  automated: boolean,
  cardImageUrl: string,
  cardImageId: string,
  specifiedOrder: number,
  spaceId: number,
  isFollowed: boolean, // True if user has joined the challenge
  canEdit: boolean,
  links: any,
  timeStatus: "upcoming" | "current" | "ended",
}

export type {
  IChallenge,
}
