import * as Yup from 'yup'
import { format } from 'date-fns'
import { AlertType } from './alerts.types'
import { TZDate } from '@date-fns/tz'

export const formatInTimeZone = (date: Date | string, fmt: string, tz: string) => format(new TZDate(new Date(date), tz), fmt)

export const alertTypesArray: AlertType[] = ['info', 'warning', 'danger']
export const alertTypesText = {
  'info': 'Notice',
  'warning': 'Warning',
  'danger': 'Danger',
} satisfies Record<AlertType, string>

export const validationSchema = Yup.object().shape({
  title: Yup.string().min(3).max(255).required(),
  content: Yup.string().min(3).max(255).required(),
  type: Yup.string().required(),
  startTime: Yup.string().required(),
  endTime: Yup.string().required(),
})
