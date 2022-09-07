import { queue } from '@pfda/https-apps-shared'

Promise.resolve()
  .then(() => {
    queue.createQueues()
  })
  .then(async () => {
    // different payload does not change the id
    const payload = { dxid: 'job-FyfPxYj00B7105b03ZXZq1g3' }
    // const payload = { dxid: 'job-Fyf0q7j00B740J8j99Xky4Pf' }
    await queue.createSyncJobStatusTask(payload, {
      id: 3,
      dxuser: 'pfda_autotest1',
      accessToken: 'foo-tokeen',
    })
    await queue.disconnectQueues()
  })
  .catch(err => {
    console.log(err, 'failed to add task to queue')
  })
