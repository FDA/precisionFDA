import { UserDTO } from '@shared/domain/discussion/discussion.types'
import { Submission } from '@shared/domain/challenge/submission.entity'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { EntityScope } from '@shared/types/common'
import { Uid } from '@shared/domain/entity/domain/uid'

export class SubmissionDTO {
  id: number
  challengeId: number
  name: string
  description: string
  user: UserDTO
  job: {
    state: JOB_STATE
    inputFiles: { id: number; uid: Uid<'file'>; name: string; userId: number; scope: EntityScope }[]
  }
  createdAt: Date
  updatedAt: Date

  static mapToDTO(submission: Submission): SubmissionDTO {
    const user = submission.user.getEntity()

    return {
      id: submission.id,
      name: submission.job.getProperty('name'),
      description: submission.description,
      challengeId: submission.challenge.id,
      user: {
        id: user.id,
        dxuser: user.dxuser,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
      },
      job: {
        state: submission.job.getProperty('state'),
        inputFiles: submission.job
          .getProperty('inputFiles')
          .getItems()
          .map((file) => ({
            id: file.id,
            uid: file.uid,
            name: file.name,
            userId: file.user.id,
            scope: file.scope,
          })),
      },
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
    }
  }
}
