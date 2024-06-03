import * as z from 'zod'

export const commentsPostRequestSchema = z.object({
  content: z.string().min(1).max(100000),
  notifyAll: z.boolean(),
})
export type CommentReqBody = z.infer<typeof commentsPostRequestSchema>
export const discussionsPostRequestSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1).max(100000),
  attachments: z.object({
    files: z.array(z.number()),
    folders: z.array(z.number()),
    assets: z.array(z.number()),
    apps: z.array(z.number()),
    jobs: z.array(z.number()),
    comparisons: z.array(z.number()),
  }),
})
export type DiscussionsPostReqBody = z.infer<typeof discussionsPostRequestSchema>
export const discussionsPutRequestSchema = discussionsPostRequestSchema.partial().extend({
  id: z.number(),
})
export type DiscussionsPutReqBody = z.infer<typeof discussionsPutRequestSchema>

export const discussionsPublishRequestSchema = z.object({
  id: z.number(),
  scope: z.enum(['public', 'private']).or(z.string().refine((value) => value.startsWith('space-'))),
  toPublish: z.object({
    files: z.array(z.number()),
    folders: z.array(z.number()),
    assets: z.array(z.number()),
    apps: z.array(z.number()),
    jobs: z.array(z.number()),
    comparisons: z.array(z.number()),
  }),
  notifyAll: z.boolean(),
})

export type DiscussionsPublishReqBody = z.infer<typeof discussionsPublishRequestSchema>

export const answerPostRequestSchema = discussionsPostRequestSchema
export type AnswerPostReqBody = z.infer<typeof answerPostRequestSchema>

export const answerPutRequestSchema = discussionsPutRequestSchema.partial()
export type AnswerPutReqBody = z.infer<typeof answerPutRequestSchema>

export const answersPublishRequestSchema = discussionsPublishRequestSchema
