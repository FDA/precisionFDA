import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { FileSyncQueueJobProducer } from '@shared/domain/user-file/producer/file-sync-queue-job.producer'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { MaintenanceQueueJobProducer } from '@shared/queue/producer/maintenance-queue-job.producer'
import { Queue } from 'bull'

@Injectable()
export class QueueProxy {
  constructor(
    @InjectQueue(config.workerJobs.queues.default.name) readonly mainQueue: Queue,
    readonly mainQueueJobProducer: MainQueueJobProducer,
    @InjectQueue(config.workerJobs.queues.maintenance.name) readonly maintenanceQueue: Queue,
    readonly maintenanceQueueJobProducer: MaintenanceQueueJobProducer,
    @InjectQueue(config.workerJobs.queues.emails.name) readonly emailQueue: Queue,
    readonly emailQueueJobProducer: EmailQueueJobProducer,
    @InjectQueue(config.workerJobs.queues.fileSync.name) readonly fileSyncQueue: Queue,
    readonly fileSyncQueueJobProducer: FileSyncQueueJobProducer,
    @InjectQueue(config.workerJobs.queues.spaceReport.name) readonly spaceReportQueue: Queue,
  ) {}
}
