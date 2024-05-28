import { format, parseISO } from 'date-fns/esm'
import { Attachment, AttachmentKey, AttachmentType, FormAttachments, PostAttachments } from './discussions.types'

export const typeAttachmentKey = {
  App: 'apps',
  Asset: 'assets',
  Comparison: 'comparisons',
  Job: 'jobs',
  UserFile: 'files',
  Folder: 'folders',
  Workflow: 'workflow',
} as Record<AttachmentType, AttachmentKey>

export function formatDiscussionDate(timestamp: string) {
  const date = parseISO(timestamp)
  return format(date, "MMM d 'at' HH:mm")
}

export function areAttachmentsEmpty(attachments?: FormAttachments): boolean {
  if(!attachments) return true
  return Object.values(attachments).every(attachmentArray => attachmentArray.length === 0)
}

export function pickIdsFromFormAttachments(attachments: FormAttachments): PostAttachments {
  const newAttachments: PostAttachments = {
    files: [],
    folders: [],
    apps: [],
    comparisons: [],
    assets: [],
    jobs: [],
  }
  Object.entries(attachments).forEach(([key, attachmentArray]) => {
    newAttachments[key as AttachmentKey] = attachmentArray.map(a => a.id)
  })
  return newAttachments
}

export function groupByAttachmentType(attachments: Attachment[]): FormAttachments {
  const grouped: FormAttachments = {
    files: [],
    folders: [],
    apps: [],
    comparisons: [],
    assets: [],
    jobs: [],
  }

  attachments.forEach(attachment => {
    const key = typeAttachmentKey[attachment.type]
    grouped[key].push(attachment)
  })

  return grouped
}

