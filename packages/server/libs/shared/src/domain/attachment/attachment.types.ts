import { App } from '../app/app.entity'
import { Comparison } from '../comparison/comparison.entity'
import { Job } from '../job/job.entity'
import { Node } from '../user-file/node.entity'

type DiscussionAttachmentTypeMap = {
  Node: typeof Node
  App: typeof App
  Job: typeof Job
  Comparison: typeof Comparison
}

export const discussionAttachmentTypeMap: DiscussionAttachmentTypeMap = {
  Node: Node,
  App: App,
  Job: Job,
  Comparison: Comparison,
}
export type DiscussionAttachmentTypeName = keyof typeof discussionAttachmentTypeMap

export type DiscussionAttachmentType = InstanceType<(typeof discussionAttachmentTypeMap)[DiscussionAttachmentTypeName]>
