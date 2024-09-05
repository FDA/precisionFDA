import { IListItem } from './listItem'


interface Regions {
  intro: string
  results: string
  'results-details': string
}
interface ChallengeMeta {
  regions: Regions
}

interface IChallenge extends IListItem {
  id: number,
  name: string,
  appOwnerId: number,
  appId: number,
  description: string,

  // challenge.meta contains the body/content of the challenge details
  // This is structured as a dict as such:
  // { 'regions' : {
  //     'intro': "This is the introduction section of a challenge",
  //     'results': "Populated by challenge admin for the results section",
  //     'results-details': "The results area is separated into two sections",
  //     'pre-registration': "Pre-Registration text",
  // }}
  //
  meta: ChallengeMeta,
  startAt: Date,
  endAt: Date,
  createdAt: Date,
  updatedAt: Date,
  status: "setup" | "pre-registration" | "open" | "paused" | "archived" | "result_announced",
  automated: boolean,
  cardImageUrl: string,
  cardImageId: string,
  preRegistrationUrl: string,
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
