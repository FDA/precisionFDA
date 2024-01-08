import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { Queue } from 'bull'

@Injectable()
export class QueueProxy {
  constructor(
    @InjectQueue(config.workerJobs.queues.default.name) readonly mainQueue: Queue,
    @InjectQueue(config.workerJobs.queues.maintenance.name) readonly maintenanceQueue: Queue,
    @InjectQueue(config.workerJobs.queues.spaceReport.name) readonly spaceReportQueue: Queue,
    @InjectQueue(config.workerJobs.queues.emails.name) readonly emailQueue: Queue,
    @InjectQueue(config.workerJobs.queues.fileSync.name) readonly fileSyncQueue: Queue,
  ) {}
}
