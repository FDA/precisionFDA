import { App } from '../app/app.entity'
import { Comparison } from '../comparison/comparison.entity'
import { Job } from '../job/job.entity'
import { Node } from '../user-file/node.entity'

export const discussionAttachmentTypeMap = {
  Node: Node,
  App: App,
  Job: Job,
  Comparison: Comparison,
}
export type DiscussionAttachmentTypeName = keyof typeof discussionAttachmentTypeMap

export type DiscussionAttachmentType = InstanceType<(typeof discussionAttachmentTypeMap)[DiscussionAttachmentTypeName]>
