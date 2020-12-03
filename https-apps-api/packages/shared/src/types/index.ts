/**
 * This file is used to export generic types.
 * It cannot be of the d.ts format because the build would then ignore it,
 * thus this workaround is in place.
 */

import { EntityManager } from '@mikro-orm/core'
import { Job } from 'bull'
import { Logger } from 'pino'

declare type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>
}

declare type Maybe<T> = T | undefined | null

declare type AnyObject = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [s: string]: any
}

interface UserCtx {
  id: number
  accessToken: string
  dxuser: string
}

interface OpsCtx {
  log: Logger
  em: EntityManager
  user: UserCtx
}

interface WorkerOpsCtx extends OpsCtx {
  job: Job
}

export type { DeepPartial, AnyObject, UserCtx, OpsCtx, WorkerOpsCtx, Maybe }
