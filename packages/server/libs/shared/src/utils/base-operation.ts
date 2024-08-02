/* eslint-disable import/group-exports */
/* eslint-disable max-classes-per-file */
import { Job } from 'bull'
import { nanoid } from 'nanoid'
import { path } from 'ramda'
import { OpsCtx, WorkerOpsCtx } from '../types'
import type { AnyObject } from '../types'
import { maskAccessTokenUserCtx } from './logging'

export type DefaultInput = AnyObject

export abstract class BaseOperation<CtxT extends OpsCtx, In, Out> {
  protected ctx: CtxT
  protected id: string

  // input context has to be provided by the server or the worker setup
  constructor(inputCtx: CtxT) {
    this.id = nanoid()
    // build context
    this.ctx = inputCtx
  }

  async execute(props?: In): Promise<Out> {
    const startTime = Date.now()
    this.ctx.log.log(
      {
        name: this.constructor.name,
        startTime,
        id: this.id,
      },
      'Operation started',
    )
    try {
      // run the operation with context
      const res = await this.run(props)
      return res
    } catch (error) {
      this.ctx.log.error(
        {
          executionTime: Date.now() - startTime,
          error,
          id: this.id,
        },
        'Operation failed',
      )
      throw error
    }
  }

  public abstract run(props?: In): Promise<Out>
}

export abstract class WorkerBaseOperation<Ctx extends OpsCtx, In, Out> extends BaseOperation<Ctx, In, Out> {
  protected ctx: WorkerOpsCtx<Ctx>

  constructor(inputCtx: WorkerOpsCtx<Ctx>) {
    super(inputCtx)
    // adding one extra field
    this.ctx.job = inputCtx.job
  }

  async execute(props?: In): Promise<Out> {
    const startTime = Date.now()
    const operationInfo = {
      name: this.constructor.name,
      startTime,
      id: this.id,
      jobData: {
        type: this.ctx.job.data?.type,
        payload: this.ctx.job.data?.payload,
        user: maskAccessTokenUserCtx(this.ctx.job.data?.user),
      },
      bullJobId: this.ctx.job.id,
      bullJobCustomId: path(['opts', 'repeat', 'jobId'], this.ctx.job),
    }
    this.ctx.log.log({ ...operationInfo }, 'Worker operation started')

    try {
      // run the operation with context
      const res = await this.run(props)
      this.ctx.log.log(
        {
          ...operationInfo,
          executionTime: Date.now() - startTime,
        },
        'Worker operation finished')
      return res
    } catch (error) {
      this.ctx.log.error(
        {
          ...operationInfo,
          executionTime: Date.now() - startTime,
          error,
        },
        'Worker operation failed',
      )
      throw error
    }
  }
}
