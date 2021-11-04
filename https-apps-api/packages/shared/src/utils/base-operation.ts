/* eslint-disable import/group-exports */
/* eslint-disable max-classes-per-file */
import { nanoid } from 'nanoid'
import { path } from 'ramda'
import type { AnyObject, OpsCtx, WorkerOpsCtx } from '../types'
import { utils } from '@pfda/https-apps-shared'

export type DefaultInput = AnyObject

export abstract class BaseOperation<IN, OUT> {
  protected ctx: OpsCtx
  protected id: string

  // input context has to be provided by the server or the worker setup
  constructor(inputCtx: OpsCtx) {
    this.id = nanoid()
    // build context
    this.ctx = {
      log: inputCtx.log,
      em: inputCtx.em,
      user: inputCtx.user,
    }
  }

  async execute(props?: IN): Promise<OUT> {
    const startTime = Date.now()
    this.ctx.log.info(
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
    } catch (err) {
      this.ctx.log.warn(
        { executionTime: Date.now() - startTime, err, id: this.id },
        'Operation failed',
      )
      throw err
    }
  }

  public abstract run(props?: IN): Promise<OUT>
}

export abstract class WorkerBaseOperation<IN, OUT> extends BaseOperation<IN, OUT> {
  protected ctx: WorkerOpsCtx

  constructor(inputCtx: WorkerOpsCtx) {
    super(inputCtx)
    // adding one extra field
    this.ctx.job = inputCtx.job
  }

  async execute(props?: IN): Promise<OUT> {
    const startTime = Date.now()
    this.ctx.log.info(
      {
        name: this.constructor.name,
        startTime,
        id: this.id,
        jobData: { 
          type: this.ctx.job.data?.type,
          payload: this.ctx.job.data?.payload,
          user: utils.maskAccessTokenUserCtx(this.ctx.job.data?.user),
        },
        bullJobId: this.ctx.job.id,
        bullJobCustomId: path(['opts', 'repeat', 'jobId'], this.ctx.job),
      },
      'Worker operation started',
    )
    try {
      // run the operation with context
      const res = await this.run(props)
      this.ctx.log.info({ id: this.id }, 'Worker operation finished')
      return res
    } catch (err) {
      this.ctx.log.warn(
        { executionTime: Date.now() - startTime, err, id: this.id },
        'Operation failed',
      )
      throw err
    }
  }
}
