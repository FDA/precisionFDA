export abstract class BaseOperation<IN, OUT> {
  protected ctx: Ops.OpsCtx

  // input context has to be provided by the server or the worker setup
  constructor(inputCtx: Ops.OpsCtx) {
    // build context
    this.ctx = {
      log: inputCtx.log,
      em: inputCtx.em,
      user: inputCtx.user,
    }
  }

  async execute(props?: IN): Promise<OUT> {
    const startTime = Date.now()
    this.ctx.log.info({ startTime }, 'Operation started')
    try {
      // run the operation with context
      const res = await this.run(props)
      return res
    } catch (err) {
      this.ctx.log.warn({ executionTime: Date.now() - startTime, err }, 'Operation failed')
      throw err
    }
  }

  public abstract async run(props?: IN): Promise<OUT>
}
