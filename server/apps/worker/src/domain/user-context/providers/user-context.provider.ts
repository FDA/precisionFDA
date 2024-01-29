import { JOB_REF } from '@nestjs/bull'
import { Provider, Scope } from '@nestjs/common'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Job } from 'bull'

export const userContextProvider: Provider = {
  provide: UserContext,
  useFactory: (job: Job) => {
    return job?.data?.user
  },
  inject: [JOB_REF],
  scope: Scope.REQUEST,
}
