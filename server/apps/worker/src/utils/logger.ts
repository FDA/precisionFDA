import { getLogger } from '@shared'

// todo: should have added message about this is a worker
const log = getLogger()

const getChildLogger = (requestId: string) => getLogger(requestId)

export { log, getChildLogger }
