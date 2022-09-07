import { IListItem } from "./listItem";

interface IApp extends IListItem {
  id: number,
  dxid: string,
  addedBy: string,
  addedByFullname: string,
  createdAt: string,
  createdAtDateTime: string,
  updatedAt: Date,
  explorers: number,
  org: string,
  name: string,
  revision: number,
  runByYou: string,
  tags: string[],
  title: string,
  entityType: "regular" | "https",
  links: any,
  featured: boolean,
  isChecked: boolean,
}

export type {
  IApp,
}
