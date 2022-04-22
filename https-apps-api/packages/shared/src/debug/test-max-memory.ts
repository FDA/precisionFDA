import { WorkerBaseOperation } from '../utils/base-operation'
import { testHeapMemoryAllocationError } from '.'

// Allocates memory until reaching the heap memory limit, to test the crash scenario
export class TestMaxMemoryOperation extends WorkerBaseOperation<any, any, any> {

  static getJobName(): string {
    return 'test-max-memory'
  }

  async run(): Promise<boolean> {
    testHeapMemoryAllocationError()
    return true
  }
}
