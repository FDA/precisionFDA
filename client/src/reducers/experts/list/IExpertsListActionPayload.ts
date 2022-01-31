import { IPagination } from '../../../types/pagination'
import { IExpert } from '../../../types/expert'

interface IExpertsListActionPayload {
  items: IExpert[],
  pagination: IPagination,
}

export type { IExpertsListActionPayload }
