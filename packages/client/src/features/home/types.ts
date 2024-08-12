import { ReactNode } from 'react'
import { JsonValue } from 'react-use-websocket/src/lib/types'
import { CloudResourcesConditionType } from '../../hooks/useCloudResourcesCondition'
import { IChallenge } from '../../types/challenge'

export interface TableSelected<T> {
  selectedItems: T[]
  resetSelected: () => void
}
export interface BaseAPIResponse {
  error?: { message: string; type: 'API Error' }
}

export interface BaseError {
  message: {
    text: string[]
    type: 'error'
  }
}
export type ResourceTypeUrlNames =
  | 'files'
  | 'apps'
  | 'workflows'
  | 'assets'
  | 'databases'
  | 'jobs'
  | 'members'
  | 'executions'
  | 'reports'
  | 'discussions'
export type APIResource =
  | 'files'
  | 'folders'
  | 'apps'
  | 'workflows'
  | 'assets'
  | 'dbclusters'
  | 'jobs'
  | 'app-executions'
  | 'workflow-executions'
  | 'spaces'
  | 'space-reports'
export type HomeScope = 'everybody' | 'featured' | 'spaces' | 'me'
export type ServerScope = 'public' | 'private' | `space-${string}`
export type PropertiesResource = 'node' | 'asset' | 'workflowSeries' | 'job' | 'appSeries' | 'dbCluster'

export type DialogType = 'radio' | 'checkbox'

export type EmmitScope = (scope: ServerScope, featured: boolean) => void

export interface DownloadListResponse {
  id: number
  name: string
  type: 'folder' | 'file'
  fsPath: string
  viewURL: string
  downloadURL: string
  locked: boolean
}

export interface FetchQuery {
  meta: IMeta
}
interface IModal {
  showModal?: boolean
}

export type Link =
  | string
  | {
      url: string
      method: 'GET' | 'POST'
    }

export type ActionType = {
  isDisabled?: boolean
  key?: string
  shouldHide?: boolean
  modal?: ReactNode | null
  cloudResourcesConditionType?: CloudResourcesConditionType
} & (
  | {
      type: 'route'
      to: string
    }
  | {
      type: 'link'
      link: Link
      cloudResourcesConditionType?: CloudResourcesConditionType
    }
  | {
      type: 'modal'
      func: (arg?: IModal) => void
      modal?: ReactNode | null
      showModal?: boolean
    }
  | {
      type: 'selection'
      title: string
      isSelected: boolean
      func: (isSelected: boolean) => void
    }
)

export type ActionFunctionsType<KeyT extends string> = {
  [key in KeyT]?: ActionType
}

export type ActionGroupType = {
  actions: ActionFunctionsType<any>
  title: string
}

export type ResourcePage = 'details' | 'list'

export interface MetaPath {
  id: number
  name: string
}
export interface IMeta {
  links: {
    copy_private?: string
    comments?: string
    edit_tags?: string
  }
  path: MetaPath[]
  count: number
  challenges: IChallenge[] | null
  pagination: {
    current_page: number
    next_page: null | number
    prev_page: null | number
    total_pages: number
    total_count: number
  }
}

export type Size = null | number
export interface IFilter {
  id: string
  value: string | number | Size[]
}

export interface SortBy {
  order_by: string
  order_dir: string
}

export enum SEVERITY {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
}

// TODO share the enum with backend
export enum NOTIFICATION_ACTION {
  JOB_INITIALIZING = 'JOB_INITIALIZING',
  JOB_RUNNING = 'JOB_RUNNING',
  JOB_RUNNABLE = 'JOB_RUNNABLE',
  JOB_DONE = 'JOB_DONE',
  JOB_TERMINATED = 'JOB_TERMINATED',
  JOB_OUTPUTS_SYNCED = 'JOB_OUTPUTS_SYNCED',
  DATA_PORTAL_CARD_IMAGE_URL_UPDATED = 'DATA_PORTAL_CARD_IMAGE_URL_UPDATED',
  CHALLENGE_RESOURCE_URL_UPDATED = 'CHALLENGE_RESOURCE_URL_UPDATED',
  CHALLENGE_CARD_IMAGE_URL_UPDATED = 'CHALLENGE_CARD_IMAGE_URL_UPDATED',
  JOB_FAILED = 'JOB_FAILED',
  FILE_CLOSED = 'FILE_CLOSED',
  NODES_REMOVED = 'NODES_REMOVED',
  NODES_COPIED = 'NODES_COPIED',
  NODES_LOCKED = 'NODES_LOCKED',
  NODES_UNLOCKED = 'NODES_UNLOCKED',
  SPACE_ACTIVATED = 'SPACE_ACTIVATED',
  WORKSTATION_SNAPSHOT_COMPLETED = 'WORKSTATION_SNAPSHOT_COMPLETED',
  WORKSTATION_SNAPSHOT_ERROR = 'WORKSTATION_SNAPSHOT_ERROR',
  SPACE_REPORT_ERROR = 'SPACE_REPORT_ERROR',
  SPACE_REPORT_DONE = 'SPACE_REPORT_DONE',
}

export type NotificationMeta = {
  linkTitle?: string
  linkUrl?: string
}

export type Notification = JsonValue & {
  id: number
  action: NOTIFICATION_ACTION
  message: string
  severity: SEVERITY
  meta?: NotificationMeta
  // TODO currently not being sent from backend
  // createdAt: Date
  // updatedAt: Date
  // deliveredAt: Date
}

export type JobLogItem = {
  timestamp: number
  source: string
  level: 'INFO' | 'STDOUT' | 'STDERR'
  job: `job-${string}`
  jobTry: number
  line: number
  msg: string
}

export enum WEBSOCKET_MESSSAGE_TYPE {
  NOTIFICATION = 'notification',
  JOB_LOG = 'jobLog',
}

export type WebSocketMessage = {
  type: WEBSOCKET_MESSSAGE_TYPE
  data: Notification | JobLogItem
}

export type KeyVal = { [key: string]: number | string | boolean }
