import { useState } from 'react'
import { Popover } from '@base-ui/react/popover'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './DatePicker.module.css'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function DatePicker({ value, onChange, placeholder = 'Select date' }: DatePickerProps) {
  const selectedDate = value ? new Date(value + 'T00:00:00') : null
  const [viewMonth, setViewMonth] = useState(() =>
    selectedDate ? startOfMonth(selectedDate) : startOfMonth(new Date()),
  )
  const [open, setOpen] = useState(false)

  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const handleSelect = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'))
    setOpen(false)
  }

  const handleClear = () => {
    onChange('')
    setOpen(false)
  }

  const displayValue = selectedDate ? format(selectedDate, 'MMM d, yyyy') : null

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className={styles.trigger}>
        <Calendar size={14} className={styles.triggerIcon} />
        <span className={displayValue ? styles.triggerText : `${styles.triggerText} ${styles.placeholder}`}>
          {displayValue ?? placeholder}
        </span>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner className={styles.positioner} sideOffset={4} side="bottom" align="start">
          <Popover.Popup className={styles.popup}>
            <div className={styles.calendarHeader}>
              <button
                type="button"
                className={styles.navButton}
                onClick={() => setViewMonth(m => subMonths(m, 1))}
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <span className={styles.calendarTitle}>{format(viewMonth, 'MMMM yyyy')}</span>
              <button
                type="button"
                className={styles.navButton}
                onClick={() => setViewMonth(m => addMonths(m, 1))}
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className={styles.weekdays}>
              {WEEKDAYS.map(day => (
                <span key={day} className={styles.weekday}>
                  {day}
                </span>
              ))}
            </div>

            <div className={styles.days}>
              {calendarDays.map(day => {
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isCurrentMonth = isSameMonth(day, viewMonth)
                const isTodayDate = isToday(day)

                let className = styles.day
                if (!isCurrentMonth) className += ` ${styles.dayOutside}`
                if (isTodayDate && !isSelected) className += ` ${styles.dayToday}`
                if (isSelected) className += ` ${styles.daySelected}`

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    role="gridcell"
                    className={className}
                    onClick={() => handleSelect(day)}
                    aria-label={format(day, 'MMMM d, yyyy')}
                    aria-selected={isSelected || undefined}
                  >
                    {day.getDate()}
                  </button>
                )
              })}
            </div>

            {selectedDate && (
              <div className={styles.clearRow}>
                <button type="button" className={styles.clearButton} onClick={handleClear}>
                  Clear
                </button>
              </div>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
