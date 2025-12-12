import { toast, ToastOptions, ToastContent } from 'react-toastify'
import { SEVERITY } from '../../features/home/types'

let markAsReadFn: ((id: string | number | (string | number)[]) => void) | null = null

export const initializeToastHelper = (markAsReadFunction: (id: string | number | (string | number)[]) => void): void => {
  markAsReadFn = markAsReadFunction
}

const fireToast = (
  toastFn: (content: ToastContent, options?: ToastOptions) => string | number,
  content: ToastContent,
  options?: ToastOptions,
): string | number => {
  const toastId = toastFn(content, options)
  if (markAsReadFn) {
    markAsReadFn(toastId)
  }
  return toastId
}

export const toastSuccess = (content: ToastContent, options?: ToastOptions): string | number => {
  return fireToast(toast.success, content, options)
}

export const toastError = (content: ToastContent, options?: ToastOptions): string | number => {
  return fireToast(toast.error, content, options)
}

export const toastInfo = (content: ToastContent, options?: ToastOptions): string | number => {
  return fireToast(toast.info, content, options)
}

export const toastWarning = (content: ToastContent, options?: ToastOptions): string | number => {
  return fireToast(toast.warning, content, options)
}

export const toastHandlers = {
  [SEVERITY.ERROR]: toastError,
  [SEVERITY.WARN]: toastWarning,
  [SEVERITY.INFO]: toastSuccess,
}
