import { ReactNode } from "react-router/node_modules/@types/react"
import { IChallenge } from "../../types/challenge"

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

export type APIResource = 'files' | 'folders' | 'apps' | 'workflows' | 'assets' | 'dbclusters' | 'jobs' | 'app-executions' | 'workflow-executions' | 'spaces'
export type ResourceScope = 'everybody' | 'featured' | 'spaces' | 'me'

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

export type ActionFunctionsType<T extends string> = {
  [key in T]?: {
    func: (arg?: IModal) => void,
    isDisabled?: boolean
    key?: string
    modal?: ReactNode | null
    showModal?: boolean
    hide?: boolean
    link?: Link
  }
}
export type ActionFunctionsTypeRev<T extends string> = {
  [key in T]: {
    func: (arg?: IModal) => void,
    isEnabled?: (arg?: any) => boolean
    modal?: ReactNode | null
    showModal?: boolean
  }
}

export type ResourcePage = 'details' | 'list'

export interface MetaPath {
  "id": number
  "name": string
}
export interface IMeta {
  "links": {
    "copy_private": string
    "comments": string
  },
  "path": MetaPath[],
  "count": number,
  "challenges": IChallenge[],
  "pagination": {
    "current_page": number,
    "next_page": null | number,
    "prev_page": null | number,
    "total_pages": number,
    "total_count": number
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

export type KeyVal = { [key: string]: number | string | boolean }
