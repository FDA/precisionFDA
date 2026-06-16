import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { Uid } from '@shared/domain/entity/domain/uid'

export class ChallengeDTO {
  id: number
  name: string
  spaceId: number
  description: string
  meta: string
  cardImageUrl: string
  infoContent: string
  infoEditorState: string
  resultsContent: string
  resultsEditorState: string
  preRegistrationContent: string
  preRegistrationEditorState: string
  preRegistrationUrl: string
  startAt: Date
  endAt: Date
  createdAt: Date
  updatedAt: Date
  status: string
  scope: string
  appUid: Uid<'app'>
  follows: boolean
  isSpaceMember: boolean
  canEdit: boolean

  static mapToDTO(
    challenge: Challenge,
    follows: boolean = null,
    isSpaceMember: boolean = null,
    canEdit: boolean = null,
  ): ChallengeDTO {
    return {
      id: challenge.id,
      name: challenge.name,
      spaceId: challenge.space.id,
      description: challenge.description,
      meta: challenge.meta,
      appUid: challenge.app?.getEntity()?.uid ?? null,
      cardImageUrl: challenge.cardImageUrl,
      preRegistrationUrl: challenge.preRegistrationUrl,
      infoContent: challenge.infoContent,
      infoEditorState: challenge.infoEditorState,
      resultsContent: challenge.resultsContent,
      resultsEditorState: challenge.resultsEditorState,
      preRegistrationContent: challenge.preRegistrationContent,
      preRegistrationEditorState: challenge.preRegistrationEditorState,
      startAt: challenge.startAt,
      endAt: challenge.endAt,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
      status: challenge.status,
      scope: challenge.scope,
      follows,
      isSpaceMember,
      canEdit,
    }
  }
}
