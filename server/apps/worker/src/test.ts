import { createSyncJobStatusTask } from '@shared/queue'
import { startWorker } from './index'

Promise.resolve()
  .then(() => startWorker())
  .then(async () => {
    // different payload does not change the id
    const payload = { dxid: 'job-FyfPxYj00B7105b03ZXZq1g3' }
    // const payload = { dxid: 'job-Fyf0q7j00B740J8j99Xky4Pf' }
    await createSyncJobStatusTask(payload, {
      id: 3,
      dxuser: 'pfda_autotest1',
      accessToken: 'foo-token',
    })
  })
  .catch(err => {
    console.log(err, 'failed to add task to queue')
  })
