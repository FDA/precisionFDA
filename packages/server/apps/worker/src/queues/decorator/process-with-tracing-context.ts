import { context, propagation, trace } from '@opentelemetry/api'
import { Job } from 'bull'

export function ProcessWithTracingContext(
  jobName: string,
  tracerName: string = 'bull-worker',
): (descriptor: PropertyDescriptor) => PropertyDescriptor {
  return (descriptor: PropertyDescriptor): PropertyDescriptor => {
    const originalMethod = descriptor.value as (job: Job) => Promise<unknown>

    descriptor.value = function (...args: unknown[]): Promise<unknown> {
      const original = originalMethod as (...a: unknown[]) => Promise<unknown>
      const job = args[0] as Job | undefined

      // If it's not a valid job, bypass tracing immediately
      if (!job?.data) {
        return original.apply(this, args)
      }
      const tracer = trace.getTracer(tracerName)
      const extractedCtx = propagation.extract(context.active(), job.data?.__trace ?? {})

      return context.with(extractedCtx, async (): Promise<unknown> => {
        const span = tracer.startSpan(`bull:${jobName}`)

        try {
          return await originalMethod.apply(this, [job])
        } catch (err) {
          span.recordException(err as Error)
          throw err
        } finally {
          span.end()
        }
      })
    }

    return descriptor
  }
}
