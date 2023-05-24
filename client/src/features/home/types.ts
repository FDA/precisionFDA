import { ReactNode } from 'react'
import { CloudResourcesConditionType } from '../../hooks/useCloudResourcesCondition'
import { IChallenge } from '../../types/challenge'

export interface TableSelected<T> {
  selectedItems: T[]
  resetSelected: () => void
}
export interface BaseAPIResponse {
  error?: { message: string, type: 'API Error' }
}

export interface BaseError {
  message: {
    text: string[],
    type: 'error'
  }
}
export type ResourceTypeUrlNames = 'files' | 'apps' | 'workflows' | 'assets' | 'databases' | 'jobs' | 'members' | 'executions'
export type APIResource = 'files' | 'folders' | 'apps' | 'workflows' | 'assets' | 'dbclusters' | 'jobs' | 'app-executions' | 'workflow-executions' | 'spaces'
export type ResourceScope = 'everybody' | 'featured' | 'spaces' | 'me'
export type ServerScope = 'public' | 'private' | `space-${string}`

export interface DownloadListResponse {
  id: number;
  name: string;
  type: 'folder' | 'file';
  fsPath: string;
  viewURL: string;
}

export interface FetchQuery {
  meta: IMeta
}
interface IModal {
  showModal?: boolean
}

export type Link = string | {
  url: string,
  method: 'GET' | 'POST'
}

export type ActionType = {
  isDisabled?: boolean
  key?: string
  shouldHide?: boolean
} & ({
  type: 'link'
  link: Link
  cloudResourcesConditionType?: CloudResourcesConditionType
} | ({
  type: 'modal'
  func: (arg?: IModal) => void,
  modal?: ReactNode | null
  showModal?: boolean
}))

export type ActionFunctionsType<KeyT extends string> = {
  [key in KeyT]?: ActionType
}

export type ResourcePage = 'details' | 'list'

export interface MetaPath {
  'id': number
  'name': string
}
export interface IMeta {
  'links': {
    'copy_private': string
    'comments': string
  },
  'path': MetaPath[],
  'count': number,
  'challenges': IChallenge[],
  'pagination': {
    'current_page': number,
    'next_page': null | number,
    'prev_page': null | number,
    'total_pages': number,
    'total_count': number
  }
}

export type Size = null | number
export interface IFilter {
  id: string
  value: string | number | Size[]
}

export interface SortBy {
  order_by: string,
  order_dir: string
}

export enum SEVERITY {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
}

export type NotificationMeta = {
  linkTitle?: string,
  linkUrl?: string,
}

export type Notification = {
  id: number,
  type: string,
  message: string,
  severity: SEVERITY,
  meta?: NotificationMeta,
  createdAt: Date,
  updatedAt: Date,
  deliveredAt: Date,
}

export type KeyVal = { [key: string]: number | string | boolean }
