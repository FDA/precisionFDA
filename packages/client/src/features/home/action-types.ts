import { ReactNode } from 'react'
import { CloudResourcesConditionType } from '../../hooks/useCloudResourcesCondition'

export interface IModal {
  showModal?: boolean
}

export type Link =
  | string
  | {
      url: string
      method: 'GET' | 'POST'
    }

export interface BaseAction {
  name: string
  isDisabled?: boolean
  shouldHide?: boolean
  modal?: ReactNode | null
  cloudResourcesConditionType?: CloudResourcesConditionType
}

export interface ModalAction extends BaseAction {
  type: 'modal'
  func: (arg?: IModal) => void
  showModal?: boolean
}

export interface RouteAction extends BaseAction {
  type: 'route'
  to: string
}

export interface LinkAction extends BaseAction {
  type: 'link'
  link: Link
}

export interface SelectionAction extends BaseAction {
  type: 'selection'
  title: string
  isSelected: boolean
  func: (isSelected: boolean) => void
}

export interface FunctionAction extends BaseAction {
  type?: undefined // explicitly no type for function actions
  func: (arg?: IModal) => void
}

export type Action = ModalAction | RouteAction | LinkAction | SelectionAction | FunctionAction

export type ActionGroup = {
  actions: Action[]
  title: string
}

