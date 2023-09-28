import { Job } from 'bull'
import { Task } from '@pfda/https-apps-shared/src/queue/task.input'

interface JobHandler<T extends Task> {
  handle(job: Job<T>): Promise<void>
}

export { JobHandler }
