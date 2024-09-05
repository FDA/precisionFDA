/* eslint-disable import/group-exports */
// local types that are not to be shared
import { EntityManager } from '@mikro-orm/mysql'
import Koa from 'koa'
import { Logger } from '@nestjs/common'
import { types } from '@shared'
import { BaseEntity } from '@shared/database/base-entity'
import { MapValueObjectByKey, MapValuesToReturnType } from '@shared/utils/generics'
import { FilterSchemaNode } from '@shared/utils/filters'

declare global {
  // data needed to be passed from the pfda app to us so we can make requests to the DNANexus API
  interface UserCtx {
    id: number
    accessToken: string
    dxuser: string
  }

  namespace Ops {
    export type UserOpsCtx = types.UserOpsCtx
    export type OpsCtx = types.OpsCtx
  }

  // interface Foo extends types.OpsCtx {}

  namespace Api {

    export type OrderDir = 'ASC' | 'DESC'

    // TODO(samuel) 1. create better interface so that I don't end up with generic with 200 params
    // TODO(samuel) 2. find a way to optimize this, so that we don't have to remember corresponding flag to middlewares
    export type CtxTypeConfig<
      PaginatedEntityT extends BaseEntity = BaseEntity,
      SortColumnT extends string = string,
      FilterSchemaT
      extends Record<string, FilterSchemaNode>
      = Record<string, FilterSchemaNode>
    > = {
      pagination: {
        enabled: boolean
        paginatedEntity: PaginatedEntityT
        sortColumn: SortColumnT
        filterSchema: FilterSchemaT
      }
    }

    // TODO(samuel) replace this with parser schema and feature flag
    export type Request<BodyT = any> = Omit<Koa.Request, 'body'> & {
      body?: BodyT
    }

    export type Ctx<ConfigT extends Partial<CtxTypeConfig> = {}, BodyT = {}> = Omit<Koa.Context,'request'> & {
      request: Request<BodyT>
      // added to Koa context in log-request middleware
      log: Logger
      em: EntityManager
      user?: UserCtx
      validatedQuery: AnyObject
      // @ts-ignore
    } & (ConfigT['pagination']['enabled'] extends true ? {
      pagination: {
        page: number
        perPage: number
        // @ts-ignore
        orderBy: ConfigT['pagination']['sortColumn']
        orderDir: OrderDir
        // @ts-ignore
        filters: Partial<MapValuesToReturnType<MapValuesToReturnType<MapValueObjectByKey<'parser', ConfigT['pagination']['filterSchema']>>>>
      }
    } : {})
  }

  // TODO(samuel) remove unnecessary type
  // can be substituted by "Record<string, any>"
  export type AnyObject = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [s: string]: any
  }
}
