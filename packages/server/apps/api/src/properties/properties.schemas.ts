import * as z from "zod";

export const propertiesPostRequestSchema = z.object({
    targetId: z.number(),
    targetType: z.enum(['node','asset','workflowSeries','appSeries','dbCluster','job']),
    properties: z.any() // fixme: set to any object
})
