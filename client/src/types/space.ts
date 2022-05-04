import { IUser } from './user'
import { ICounters } from './counters'

interface ISpace {
  id: number,
  scope: string,
  name: string,
  desc: string,
  type: string,
  contextMembership: boolean,
  canDuplicate: boolean,
  updatable: boolean,
  cts: string,
  isExclusive: boolean,
  isPrivate: boolean,
  isLocked: boolean,
  isActive: boolean,
  sharedSpaceId: number,
  privateSpaceId: number,
  hasLockLink: boolean,
  hostLead: IUser, //UserShape,
  guestLead: IUser, //UserShape,
  status: string,
  links: any, // object
  counters: ICounters,
  tags: string,
  createdAt: Date,
  updatedAt: Date,
}

export type { ISpace }
