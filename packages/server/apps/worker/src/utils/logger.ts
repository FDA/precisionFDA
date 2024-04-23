
// todo: should have added message about this is a worker
import { getLogger } from '@shared/logger'

const log = getLogger()

const getChildLogger = (requestId: string) => getLogger(requestId)

export { log, getChildLogger }
