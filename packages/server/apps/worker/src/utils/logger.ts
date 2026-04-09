// todo: should have added message about this is a worker
import { Logger } from '@nestjs/common'
import { getLogger } from '@shared/logger'

const log: Logger = getLogger()

const getChildLogger: (requestId: string) => Logger = (requestId: string) => getLogger(requestId)

export { getChildLogger, log }
