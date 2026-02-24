import React from 'react'
import { Select } from '@base-ui/react/select'
import styles from './BaseSelect.module.css'
import { cn } from '../../utils/cn'

export interface BaseSelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface BaseSelectProps {
  options: BaseSelectOption[]
  value?: string | null
  onChange?: (value: string | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  'data-testid'?: string
}

function BaseSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className,
  disabled,
  'data-testid': dataTestId,
}: BaseSelectProps) {
  // Find selected option object
  const selectedOption = options.find(opt => opt.value === value) ?? null

  return (
    <Select.Root<BaseSelectOption>
      value={selectedOption}
      onValueChange={(newValue: BaseSelectOption | null) => {
        onChange?.(newValue?.value ?? null)
      }}
      disabled={disabled}
      data-testid={dataTestId}
    >
      <div className={cn(styles.container, className)}>
        <Select.Trigger className={styles.trigger}>
          <Select.Value>
            {(val) => <span className={styles.value}>{val?.label ?? placeholder}</span>}
          </Select.Value>
          <Select.Icon className={styles.icon}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Positioner className={styles.positioner} sideOffset={4} side='bottom' align='start'>
            <Select.Popup className={styles.popup}>
              <Select.List className={styles.list}>
                {options.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={option}
                    disabled={option.disabled}
                    className={styles.item}
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator className={styles.itemIndicator}>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </div>
    </Select.Root>
  )
}

export default BaseSelect
