import { getLogger } from '@pfda/https-apps-shared'

// todo: should have added message about this is a worker
const log = getLogger()

const getChildLogger = (requestId: string) => log.child({ requestId })

export { log, getChildLogger }
