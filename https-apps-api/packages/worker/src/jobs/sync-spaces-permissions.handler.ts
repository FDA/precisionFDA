import { Job } from 'bull'
import { database, space } from '@pfda/https-apps-shared'
import { SyncSpacesPermissionsJob } from '@pfda/https-apps-shared/src/queue/task.input'
import { getChildLogger } from '../utils'

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

  await new space.SyncSpacesPermissionsOperation(ctx).execute()
}
