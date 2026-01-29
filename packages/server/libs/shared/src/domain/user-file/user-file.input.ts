import { UidInput } from '@shared/types'

export type FOLLOW_UP_ACTION =
  | 'UPDATE_DATA_PORTAL_IMAGE_URL'
  | 'UPDATE_CHALLENGE_IMAGE_URL'
  | 'UPDATE_CHALLENGE_RESOURCE_URL'
  | 'COMPLETE_SPACE_REPORT'

export type FileUidInput = {
  fileUid: string
}

export type FollowUpInput = {
  followUpAction: FOLLOW_UP_ACTION
}

export type SyncFileJobInput = FileUidInput &
  FollowUpInput & {
    isChallengeBotFile: boolean
    followUpAction?: FOLLOW_UP_ACTION
  }

export type UidAndFollowUpInput = UidInput & FollowUpInput

type nodeQueryFilter = {
  locked?: boolean
}

export { nodeQueryFilter }
