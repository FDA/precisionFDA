import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'
import { PfdaWebSocket, WEBSOCKET_EVENTS } from '@shared/websocket/model/pfda-web-socket'
import { WebSocket } from 'ws'
import { Job } from '../job.entity'

export class JobLogService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly userClient: PlatformClient,
    @Inject(ADMIN_PLATFORM_CLIENT)
    private readonly adminClient: PlatformClient,
    private readonly em: SqlEntityManager,
  ) {}

  async streamJobLogs(job: Job, client: PfdaWebSocket) {
    const jobDxId = job.dxid
    const isAccessible = await this.isJobAccessible(jobDxId)
    const ws = isAccessible
      ? this.userClient.streamJobLogs(jobDxId)
      : await this.askAdminForJobLogs(jobDxId, client)

    ws.on('message', async (data) => {
      try {
        const logStr = data.toString()
        const log = JSON.parse(logStr)
        client.send(
          JSON.stringify({
            type: WEBSOCKET_EVENTS.JOB_LOG,
            data: log,
          }),
        )
        // close signal from platform
        if (log['source'] === 'SYSTEM' && log['msg'] === 'END_LOG') {
          ws.terminate()
          return
        }
      } catch (error) {
        this.logger.error(`Failed to parse job log: ${error}`)
        ws.terminate()
      }
    })
    client.on('close', () => {
      if (ws.readyState !== WebSocket.CONNECTING) {
        ws.terminate()
      }
    })
  }

  private async isJobAccessible(jobDxId) {
    try {
      await this.userClient.jobDescribe({ jobId: jobDxId })
      return true
    } catch (e) {
      return false
    }
  }

  private async askAdminForJobLogs(jobDxId: DxId<'job'>, client: PfdaWebSocket) {
    try {
      const jobDescribe = await this.adminClient
        .jobDescribe({ jobId: jobDxId })
        .catch(async (err) => {
          if (err.props.clientStatusCode !== 401) {
            throw err
          }
          return null
        })
      let originalProject = ''
      if (!jobDescribe) {
        const job = await this.em.findOne(Job, { dxid: jobDxId }, { orderBy: { createdAt: 'ASC' } })
        originalProject = job.project
        await this.adminClient.projectInvite({
          projectDxid: originalProject,
          invitee: `user-${config.platform.adminUser}`,
          level: 'VIEW',
        })
      }
      const ws = this.adminClient.streamJobLogs(jobDxId)
      ws.on('close', async () => {
        if (originalProject.length > 0) {
          await this.adminClient.projectLeave({ projectDxid: originalProject })
        }
      })
      return ws
    } catch (error) {
      console.error(error)
      client.close()
    }
  }
}
