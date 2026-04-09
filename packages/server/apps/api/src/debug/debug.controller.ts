import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, Delete, Get, Inject, Logger, Param, UseGuards } from '@nestjs/common'
import { JSONSchema7 } from 'json-schema'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { testHeapMemoryAllocationError } from '@shared/debug/memory-tests'
import { CleanupWorkerQueueOperation, createTestMaxMemoryTask } from '@shared/queue'
import {
  DebugQueueJobResult,
  debugQueueJob,
  debugQueueJobs,
  removeJobs,
  removeRepeatableDebug,
} from '@shared/queue/queue.debug'
import { OpsCtx } from '@shared/types'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'
import { DebugErrorTestingRoutesGuard } from './guards/debug-error-testing-routes.guard'
import { DebugUserContextGuard } from './guards/debug-user-context.guard'

interface IRemoveRepeatableParams {
  key: string
}

const removeRepeatableSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    key: { type: 'string', minLength: 1 },
  },
}

@UseGuards(DebugUserContextGuard)
@Controller('/debug')
export class DebugController {
  constructor(
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    private readonly logger: Logger,
  ) {}

  // Debugging bull queue
  @Get('/queue')
  async getQueueJobs(): Promise<
    Awaited<{
      name: unknown
      jobs: Array<unknown>
      jobCounts: unknown
      repeatableJobs: Array<unknown>
    }>[]
  > {
    return await debugQueueJobs()
  }

  @Get('/queue/cleanup')
  async cleanupWorkerQueue(): Promise<boolean> {
    const opsCtx: OpsCtx = {
      log: this.logger,
      em: this.em,
    }

    return await new CleanupWorkerQueueOperation(opsCtx).execute()
  }

  @Get('/queue/job/:bullJobId')
  async debugQueueJob(@Param('bullJobId') bullJobId: string): Promise<DebugQueueJobResult[]> {
    return await debugQueueJob(bullJobId)
  }

  @Delete('/queue/removeJobs/:pattern')
  async removeJobs(@Param('pattern') pattern: string): Promise<string> {
    return await removeJobs(pattern)
  }

  @Delete('/queue/removeRepeatable')
  async removeRepeatableJobs(
    @Body(new JsonSchemaPipe(removeRepeatableSchema)) body: IRemoveRepeatableParams,
  ): Promise<string> {
    return await removeRepeatableDebug(body.key)
  }

  @UseGuards(DebugErrorTestingRoutesGuard)
  @Get('/errors/throwApiException')
  throwApiException(): void {
    throw new Error('This is a test error')
  }

  @UseGuards(DebugErrorTestingRoutesGuard)
  @Get('/errors/testApiMemoryAllocationError')
  testHeapMemoryAllocationError(): { result: string } {
    testHeapMemoryAllocationError()
    return { result: 'Test api heap memory allocation test finished - did not crash?' }
  }

  @UseGuards(DebugErrorTestingRoutesGuard)
  @Get('/errors/testWorkerMemoryAllocationError')
  createTestMaxMemoryTask(): { result: string } {
    createTestMaxMemoryTask()
    return { result: 'Test worker heap memory allocation test queued' }
  }
}
