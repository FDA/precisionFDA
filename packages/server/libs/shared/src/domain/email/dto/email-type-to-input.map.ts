import { EmptyEmailInputDto } from '@shared/domain/email/dto/empty-email-input.dto'
import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { ObjectIdInputDto } from '@shared/domain/email/email.helper'
import { NewContentAddedInputDto } from '@shared/domain/email/dto/new-content-added-input.dto'
import { AlertMessageInputDto } from '@shared/domain/email/dto/alert-message-input.dto'

export const emailTypeToInputDtoMap = {
  0: EmptyEmailInputDto, // emailWithoutTemplate
  2: NewContentAddedInputDto, // newContentAdded
  17: AlertMessageInputDto, // alertMessage
  19: ObjectIdInputDto, // expertQuestionAdded
  21: ObjectIdInputDto, // guestAccessEmail

  1: EmptyEmailInputDto, // jobFinished
  3: EmptyEmailInputDto, // memberChangedAddedRemoved
  4: EmptyEmailInputDto, // spaceChanged
  5: EmptyEmailInputDto, // commentAdded
  6: EmptyEmailInputDto, // challengeOpened
  7: EmptyEmailInputDto, // challengePrereg
  8: EmptyEmailInputDto, // jobTerminationWarning
  9: EmptyEmailInputDto, // staleJobsReport
  10: EmptyEmailInputDto, // nonTerminatedDbClusters
  11: EmptyEmailInputDto, // jobFailed
  12: EmptyEmailInputDto, // adminDataConsistencyReport
  13: EmptyEmailInputDto, // userDataConsistencyReport
  14: EmptyEmailInputDto, // spaceDiscussion
  15: EmptyEmailInputDto, // spaceCreated
  16: EmptyEmailInputDto, // userInactivityAlert
  18: EmptyEmailInputDto, // expertQuestionAdded
  20: EmptyEmailInputDto, // challengeProposalReceived
} satisfies Record<EMAIL_TYPES, new () => object>

export type EmailTypeToInputMap = {
  [K in keyof typeof emailTypeToInputDtoMap]: (typeof emailTypeToInputDtoMap)[K] extends new () => infer R
    ? R
    : (typeof emailTypeToInputDtoMap)[K]
}
