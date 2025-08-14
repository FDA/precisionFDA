import { MetaV2 } from '../../home/types'
import { Invitation } from '../admin.api'

export type InvitationListType = { data: Invitation[]; meta: MetaV2 }
