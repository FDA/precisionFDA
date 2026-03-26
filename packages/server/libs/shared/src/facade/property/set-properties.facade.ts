import { Injectable } from '@nestjs/common'
import { PropertyService } from '@shared/domain/property/services/property.service'
import { AppService } from '@shared/domain/app/services/app.service'
import { Uid } from '@shared/domain/entity/domain/uid'
import { JobService } from '@shared/domain/job/job.service'
import { WorkflowService } from '@shared/domain/workflow/service/workflow.service'
import { NodeService } from '@shared/domain/user-file/node.service'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { UidUtils } from '@shared/utils/uid.utils'
import { PermissionError } from '@shared/errors'
import { SetPropertiesDTO } from '@shared/domain/property/dto/set-properties.dto'
import { PropertyType } from '@shared/domain/property/property.entity'

@Injectable()
export class SetPropertiesFacade {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly appService: AppService,
    private readonly jobService: JobService,
    private readonly workflowService: WorkflowService,
    private readonly nodeService: NodeService,
    private readonly dbClusterService: DbClusterService,
  ) {}

  async setProperties(body: SetPropertiesDTO): Promise<void> {
    let targetType: PropertyType
    let targetId: number
    if (this.isAppUid(body.targetId)) {
      const result = await this.appService.getEditableEntityByUid(body.targetId)
      if (result) {
        targetId = result.appSeriesId
        targetType = 'appSeries'
      }
    }
    if (this.isJobUid(body.targetId)) {
      const result = await this.jobService.getEditableEntityByUid(body.targetId)
      if (result) {
        targetId = result.id
        targetType = 'job'
      }
    }
    if (this.isWorkflowUid(body.targetId)) {
      const result = await this.workflowService.getEditableEntityByUid(body.targetId)
      if (result) {
        targetId = result.workflowSeriesId
        targetType = 'workflowSeries'
      }
    }
    if (this.isDbClusterUid(body.targetId)) {
      const result = await this.dbClusterService.getEditableEntityByUid(body.targetId)
      if (result) {
        targetId = result.id
        targetType = 'dbCluster'
      }
    }
    if (this.isFileUid(body.targetId)) {
      const result = await this.nodeService.getEditableEntityByUid(body.targetId)
      if (result) {
        targetId = result.id
        targetType = 'node'
      }
    }
    if (this.isFolderId(body.targetId)) {
      const result = await this.nodeService.getEditableEntityById(
        Number(body.targetId.split('-')[1]),
      )
      if (result) {
        targetId = result.id
        targetType = 'node'
      }
    }
    if (!targetType || !targetId) {
      throw new PermissionError(`Target with id ${body.targetId} not found or not editable.`)
    }
    await this.propertyService.setProperty({
      targetType,
      targetId,
      properties: body.properties,
    })
  }

  isAppUid(uid: string): uid is Uid<'app'> {
    return UidUtils.isValidUId(uid, 'app')
  }

  isJobUid(uid: string): uid is Uid<'job'> {
    return UidUtils.isValidUId(uid, 'job')
  }

  isWorkflowUid(uid: string): uid is Uid<'workflow'> {
    return UidUtils.isValidUId(uid, 'workflow')
  }

  isDbClusterUid(uid: string): uid is Uid<'dbcluster'> {
    return UidUtils.isValidUId(uid, 'dbcluster')
  }

  isFileUid(uid: string): uid is Uid<'file'> {
    return UidUtils.isValidUId(uid, 'file')
  }

  isFolderId(id: string): boolean {
    const parts = id.split('-')
    return !(parts.length !== 2 || parts[0] !== 'folder' || Number.isNaN(Number(parts[1])))
  }
}
