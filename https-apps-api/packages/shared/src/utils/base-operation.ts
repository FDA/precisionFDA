import { nanoid } from 'nanoid'
import type { AnyObject, OpsCtx } from '../types'

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
    this.ctx.log.info({ startTime, id: this.id }, 'Operation started')
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

  public abstract async run(props?: IN): Promise<OUT>
}
