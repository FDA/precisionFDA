import { IPagination } from '../../../views/shapes/IPagination'
import { IExpert } from '../../../views/shapes/ExpertShape'

interface IExpertsListActionPayload {
  items: IExpert[],
  pagination: IPagination,
  year: number,
}

export type {
  IExpertsListActionPayload
}
