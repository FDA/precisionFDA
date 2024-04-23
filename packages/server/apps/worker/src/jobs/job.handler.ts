import { Job } from 'bull'
import { Task } from '@shared/queue/task.input'

interface JobHandler<T extends Task> {
  handle(job: Job<T>): Promise<void>
}

export { JobHandler }
