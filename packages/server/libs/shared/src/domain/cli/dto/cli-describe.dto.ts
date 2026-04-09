import { invertObj } from 'ramda'
import { App } from '@shared/domain/app/app.entity'
import { getCLIKeyInputSpec } from '@shared/domain/app/app.helper'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { ENGINE, ENGINES, STATUS, STATUSES } from '@shared/domain/db-cluster/db-cluster.enum'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { Job } from '@shared/domain/job/job.entity'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import {
  AppDescribeResponse,
  DbClusterDescribeResponse,
  FileDescribeResponse,
  JobDescribeResponse,
  WorkflowDescribeResponse,
} from '@shared/platform-client/platform-client.responses'
import { EntityScope } from '@shared/types/common'

export class CliFileDescribeDTO {
  types: string[]
  hidden: boolean
  created: number
  addedBy: string
  createdBy: string
  title: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  folder?: string
  size: number
  name: string
  modified: number
  location: EntityScope
  id: Uid<'file'>
  state: string
  class: string
  properties: object
  content?: string[]

  static async fromEntity(describeFile: FileDescribeResponse, file: Asset | UserFile): Promise<CliFileDescribeDTO> {
    let response: CliFileDescribeDTO = {
      ...describeFile,
      id: file.uid,
      title: file.name,
      size: file.fileSize,
      tags: file.taggings.map(t => t.tag?.name),
      properties: file.properties.reduce((acc, p) => {
        acc[p.propertyName] = p.propertyValue
        return acc
      }, {}),
      location: file.scope,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      addedBy: file.user.getProperty('dxuser'),
    }

    if (file.isAsset) {
      const assetFile = file as Asset
      await assetFile.archiveEntries.loadItems()
      response = {
        ...response,
        content: assetFile.archiveEntries.getItems().map(e => e.path),
      }
    }

    return response
  }
}

export class CliWorkflowDescribeDTO extends WorkflowDescribeResponse {
  id: Uid<'workflow'>
  dxid: DxId<'workflow'>
  addedBy: string
  location: string
  revision: number
  createdAt: Date
  updatedAt: Date

  static async fromEntity(
    platformWorkflowData: WorkflowDescribeResponse,
    workflow: Workflow,
  ): Promise<CliWorkflowDescribeDTO> {
    return {
      ...platformWorkflowData,
      dxid: platformWorkflowData.id,
      id: workflow.uid,
      location: workflow.scope,
      revision: workflow.revision,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      addedBy: workflow.user.getProperty('dxuser'),
    }
  }
}

export class CliAppDescribeDTO extends AppDescribeResponse {
  id: Uid<'app'>
  dxid: DxId<'app'>
  createdAt: Date
  internetAccess: boolean
  addedBy: string
  instanceType: string
  location: string
  revision: number
  updatedAt: Date

  static async fromEntity(platformAppData: AppDescribeResponse, app: App): Promise<CliAppDescribeDTO> {
    return {
      ...platformAppData,
      dxid: platformAppData.id,
      id: app.uid,
      title: app.title,
      revision: app.revision,
      location: app.scope,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      addedBy: app.user.getProperty('dxuser'),
      internetAccess: app.spec.internet_access,
      instanceType: app.spec.instance_type,
    }
  }
}

export class CliExecutionDescribeDTO {
  dxid: DxId<'job'>
  createdAt: Date
  addedBy: string
  id: Uid<'job'>
  title: string
  updatedAt: Date
  location: string

  static async fromEntity(platformJobData: JobDescribeResponse, execution: Job): Promise<CliExecutionDescribeDTO> {
    const ignoreInputKeys = getCLIKeyInputSpec().map(spec => spec.name)
    platformJobData.input = Object.fromEntries(
      Object.entries(platformJobData.input).filter(([key]) => !ignoreInputKeys.includes(key)),
    )
    platformJobData.runInput = Object.fromEntries(
      Object.entries(platformJobData.runInput).filter(([key]) => !ignoreInputKeys.includes(key)),
    )
    platformJobData.originalInput = Object.fromEntries(
      Object.entries(platformJobData.originalInput).filter(([key]) => !ignoreInputKeys.includes(key)),
    )
    return {
      ...platformJobData,
      dxid: platformJobData.id,
      id: execution.uid,
      title: execution.name,
      location: execution.scope,
      createdAt: execution.createdAt,
      updatedAt: execution.updatedAt,
      addedBy: execution.user.getProperty('dxuser'),
    }
  }
}

export class CliDbClusterDescribeDTO {
  id: number
  dxid: DxId<'dbcluster'>
  name: string
  title: string
  status: string
  location: string
  description?: string
  addedBy: string
  createdAt: Date
  updatedAt: Date
  engine: string
  engineVersion: string
  dxInstanceClass: string
  statusAsOf: Date
  host: string
  port: string
  tags: string[]
  properties: object

  static fromEntity(platformDbClusterData: DbClusterDescribeResponse, dbcluster: DbCluster): CliDbClusterDescribeDTO {
    return {
      ...platformDbClusterData,
      id: dbcluster.id,
      dxid: dbcluster.dxid,
      name: dbcluster.name,
      title: dbcluster.name,
      status: STATUSES[invertObj(STATUS)[dbcluster.status]],
      location: dbcluster.scope,
      description: dbcluster.description,
      addedBy: dbcluster.user.getProperty('dxuser'),
      createdAt: dbcluster.createdAt,
      updatedAt: dbcluster.updatedAt,
      engine: ENGINES[invertObj(ENGINE)[dbcluster.engine]],
      engineVersion: dbcluster.engineVersion,
      dxInstanceClass: dbcluster.dxInstanceClass,
      statusAsOf: dbcluster.statusAsOf,
      host: dbcluster.host,
      port: dbcluster.port,
      tags: dbcluster.taggings.map(t => t.tag.name),
      properties: dbcluster.properties.reduce((acc, p) => {
        acc[p.propertyName] = p.propertyValue
        return acc
      }, {}),
    }
  }
}

export class CliFolderDescribeDTO {
  id: Uid<'file'>
  name: string
  location: string
  path: string
  createdAt: Date
  updatedAt: Date
  addedBy: string

  static fromEntity(folder: Node, path: string): CliFolderDescribeDTO {
    return {
      id: folder.uid,
      name: folder.name,
      location: folder.scope,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      path: path,
      addedBy: folder.user.getProperty('dxuser'),
    }
  }
}

export class CliDiscussionDescribeDTO {
  id: number
  title: string
  content: string
  user: SimpleUserDTO
  createdAt: Date
  updatedAt: Date
  answersCount: number
  commentsCount: number
  answers: CliAnswerDTO[]
  comments: CliCommentDTO[]
  attachments: CliAttachmentDTO[]
}

class CliAttachmentDTO {
  uid: string | number
  type: string
  name: string
}

export class CliCommentDTO {
  id: number
  content: string
  user: SimpleUserDTO
  createdAt: Date
  updatedAt: Date
}

export class CliAnswerDTO {
  id: number
  user: SimpleUserDTO
  content: string
  comments: CliCommentDTO[]
  createdAt: Date
  updatedAt: Date
  attachments: CliAttachmentDTO[]
}

export type CliDescribeEntityResponse =
  | CliFileDescribeDTO
  | CliWorkflowDescribeDTO
  | CliAppDescribeDTO
  | CliExecutionDescribeDTO
  | CliDiscussionDescribeDTO
  | CliFolderDescribeDTO
  | CliDbClusterDescribeDTO
