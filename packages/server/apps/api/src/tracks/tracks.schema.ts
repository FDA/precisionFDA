import * as z from 'zod'
import { schemas } from '@shared/utils/base-schemas'

export const TrackProvenanceUidSchema = z.union([
  schemas.uidSchema,
  z.string().regex(/^comparison-\d+$/),
])