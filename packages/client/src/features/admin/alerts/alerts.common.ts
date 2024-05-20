import * as Yup from 'yup'
import { format } from 'date-fns/esm'
import { utcToZonedTime } from 'date-fns-tz/esm'
import { AlertType } from './alerts.types'

export const formatInTimeZone = (date: Date | string, fmt: string, tz: string) => format(utcToZonedTime(date, tz), fmt, { timeZone: tz })

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
