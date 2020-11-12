/* eslint-disable import/group-exports */
// local types that are not to be shared
import { EntityManager } from '@mikro-orm/core'
import Koa from 'koa'
import { Logger } from 'pino'
import { types } from '@pfda/https-apps-shared'

declare global {
  // data needed to be passed from the pfda app to us so we can make requests to the DNANexus API
  interface UserCtx {
    id: number
    accessToken: string
    dxuser: string
  }

  namespace Ops {
    export interface OpsCtx extends types.OpsCtx {}
  }

  // interface Foo extends types.OpsCtx {}

  namespace Api {
    export interface Ctx extends Koa.Context {
      // added to Koa context in log-request middleware
      log: Logger
      em: EntityManager
      user: UserCtx
    }

    export type Mdw = (...args: readonly any[]) => (ctx: Api.Ctx, next: () => any) => Promise<any>

    export type SyncMdw = (...args: readonly any[]) => (ctx: Api.Ctx, next: () => any) => any
  }

  // namespace Ops {
  //   export interface OpsCtx {
  //     log: Logger
  //     em: EntityManager
  //     user: UserCtx
  //   }
  // }
  export type AnyObject = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [s: string]: any
  }
}
