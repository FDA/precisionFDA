import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, Delete, Get, Inject, Logger, Param, UseGuards } from '@nestjs/common'
import { testHeapMemoryAllocationError } from '@shared/debug/memory-tests'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { CleanupWorkerQueueOperation, createTestMaxMemoryTask } from '@shared/queue'
import { debugQueueJobs, removeRepeatableDebug, debugQueueJob, removeJobs } from '@shared/queue/queue.debug'
import { OpsCtx } from '@shared/types'
import { JSONSchema7 } from 'json-schema'
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
  async getQueueJobs() {
    return await debugQueueJobs()
  }

  @Get('/queue/cleanup')
  async cleanupWorkerQueue() {
    const opsCtx: OpsCtx = {
      log: this.logger,
      em: this.em,
    }

    return await new CleanupWorkerQueueOperation(opsCtx).execute()
  }

  @Get('/queue/job/:bullJobId')
  async debugQueueJob(@Param('bullJobId') bullJobId: string) {
    return await debugQueueJob(bullJobId)
  }

  @Delete('/queue/removeJobs/:pattern')
  async removeJobs(@Param('pattern') pattern: string) {
    return await removeJobs(pattern)
  }

  @Delete('/queue/removeRepeatable')
  async removeRepeatableJobs(
    @Body(new JsonSchemaPipe(removeRepeatableSchema)) body: IRemoveRepeatableParams,
  ) {
    return await removeRepeatableDebug(body.key)
  }

  @UseGuards(DebugErrorTestingRoutesGuard)
  @Get('/errors/throwApiException')
  throwApiException() {
    throw new Error('This is a test error')
  }

  @UseGuards(DebugErrorTestingRoutesGuard)
  @Get('/errors/testApiMemoryAllocationError')
  testHeapMemoryAllocationError() {
    testHeapMemoryAllocationError()
    return { result: 'Test api heap memory allocation test finished - did not crash?' }
  }

  @UseGuards(DebugErrorTestingRoutesGuard)
  @Get('/errors/testWorkerMemoryAllocationError')
  createTestMaxMemoryTask() {
    createTestMaxMemoryTask()
    return { result: 'Test worker heap memory allocation test queued' }
  }
}
