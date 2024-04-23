import { database } from '@shared/database'
import { SyncSpacesPermissionsOperation } from '@shared/domain/space/ops/permissions-synchronize'
import { Job } from 'bull'
import { SyncSpacesPermissionsJob } from '@shared/queue/task.input'
import { getChildLogger } from '../utils/logger'

export const syncSpacesPermissionsHandler = async (bullJob: Job<SyncSpacesPermissionsJob>) => {
  const requestId = String(bullJob.id)
  const data = bullJob.data
  const log = getChildLogger(requestId)

  const ctx = {
    // TODO(samuel) fix by declaration merging
    em: database.orm().em.fork() as any,
    log,
    user: data.user,
    job: bullJob,
  }

  await new SyncSpacesPermissionsOperation(ctx).execute()
}
