import { Job } from 'bull'
import { Task } from '@shared/queue/task.input'

export interface JobHandler<T extends Task> {
  handle(job: Job<T>): Promise<void>
}
