import * as z from 'zod'

export const Paginated = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
})

const OrderBySchema = z.union([
  z.literal('isPublication'),
  z.literal('createdAt'),
]).optional();

const NewsTypeSchema = z.union([
  z.literal('publication'),
  z.literal('article'),
]).optional();

export const newsListParamsSchema = Paginated.extend({
  year: z.string().optional(),
  type: NewsTypeSchema,
  orderBy: OrderBySchema,
})

export type NewsListReqBody = z.infer<typeof newsListParamsSchema>

export const newsPostRequestSchema = z.object({
  title: z.string().min(3).max(255),
  createdAt: z.string().max(50).optional(),
  video: z.string().max(255).optional(),
  content: z.string().min(3).max(100000),
  link: z.string().min(3).max(255).optional(),
  isPublication: z.boolean().optional(),
  published: z.boolean().optional(),
})
export type NewsPostReqBody = z.infer<typeof newsPostRequestSchema>

export const newsPositionRequestSchema = z.record(z.string(), z.number()).optional();

