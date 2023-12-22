import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, Delete, Get, Inject, Logger, Param, UseGuards } from '@nestjs/common'
import { debug, DEPRECATED_SQL_ENTITY_MANAGER_TOKEN, queue } from '@shared'
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
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER_TOKEN) private readonly em: SqlEntityManager,
    private readonly log: Logger,
  ) {}

  // Debugging bull queue
  @Get('/queue')
  async getQueueJobs() {
    return await queue.debug.debugQueueJobs()
  }

  @Get('/queue/cleanup')
  async cleanupWorkerQueue() {
    const opsCtx: OpsCtx = {
      log: this.log,
      em: this.em,
    }

    return await new queue.CleanupWorkerQueueOperation(opsCtx).execute()
  }

  @Get('/queue/job/:bullJobId')
  async debugQueueJob(@Param('bullJobId') bullJobId: string) {
    return await queue.debug.debugQueueJob(bullJobId)
  }

  @Delete('/queue/removeJobs/:pattern')
  async removeJobs(@Param('pattern') pattern: string) {
    return await queue.debug.removeJobs(pattern)
  }

  @Delete('/queue/removeRepeatable')
  async removeRepeatableJobs(
    @Body(new JsonSchemaPipe(removeRepeatableSchema)) body: IRemoveRepeatableParams,
  ) {
    return await queue.debug.removeRepeatable(body.key)
  }

  @UseGuards(DebugErrorTestingRoutesGuard)
  @Get('/errors/throwApiException')
  throwApiException() {
    throw new Error('This is a test error')
  }

  @UseGuards(DebugErrorTestingRoutesGuard)
  @Get('/errors/testApiMemoryAllocationError')
  testHeapMemoryAllocationError() {
    debug.testHeapMemoryAllocationError()
    return { result: 'Test api heap memory allocation test finished - did not crash?' }
  }

  @UseGuards(DebugErrorTestingRoutesGuard)
  @Get('/errors/testWorkerMemoryAllocationError')
  createTestMaxMemoryTask() {
    queue.createTestMaxMemoryTask()
    return { result: 'Test worker heap memory allocation test queued' }
  }
}
