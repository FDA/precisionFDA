import { App } from '@shared/domain/app/app.entity'
import { CommentDTO, NoteDTO, UserDTO } from '@shared/domain/discussion/discussion.types'
import { Job } from '@shared/domain/job/job.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import {
  AppDescribeResponse,
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
  id: string
  state: string
  class: string
  properties: {}
  content?: string[]

  static async mapToDTO(
    describeFile: FileDescribeResponse,
    file: Node,
  ): Promise<CliFileDescribeDTO> {
    let response: CliFileDescribeDTO = {
      ...describeFile,
      id: file.uid,
      title: file.name,
      size: file.fileSize,
      tags: file.taggings.map((t) => t.tag.name),
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
      let assetFile = file as Asset
      await assetFile.archiveEntries.loadItems()
      response = {
        ...response,
        content: assetFile.archiveEntries.getItems().map((e) => e.path),
      }
    }

    return response
  }
}

export class CliWorkflowDescribeDTO extends WorkflowDescribeResponse {
  dxid: string
  addedBy: string
  location: string
  revision: number
  createdAt: Date
  updatedAt: Date

  static async mapToDTO(
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
  dxid: string
  createdAt: Date
  internetAccess: boolean
  addedBy: string
  instanceType: string
  location: string
  revision: number
  updatedAt: Date

  static async mapToDTO(
    platformAppData: AppDescribeResponse,
    app: App,
  ): Promise<CliAppDescribeDTO> {
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
  dxid: string
  createdAt: Date
  addedBy: string
  id: string
  title: string
  updatedAt: Date
  location: string

  static async mapToDTO(
    platformJobData: JobDescribeResponse,
    execution: Job,
  ): Promise<CliExecutionDescribeDTO> {
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

export class CliDiscussionDescribeDTO {
  id: number
  title: string
  content: string
  user: UserDTO
  createdAt: Date
  updatedAt: Date
  answersCount: number
  commentsCount: number
  answers: {
    id: number
    user: UserDTO
    note: NoteDTO
    comments: CommentDTO[]
    createdAt: Date
    updatedAt: Date
    attachments: CliAttachmentDTO[]
  }[]
  comments: CommentDTO[]
  attachments: CliAttachmentDTO[]
}

class CliAttachmentDTO {
  uid: string
  type: string
  name: string
}
