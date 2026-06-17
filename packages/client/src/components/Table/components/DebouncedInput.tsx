import React from 'react'

type Props = {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>

export const DebouncedInput: React.FC<Props> = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = React.useState<number | string>(initialValue)
  const hasUserEditedRef = React.useRef(false)
  const emitChange = React.useEffectEvent((nextValue: string | number) => {
    onChange(nextValue)
  })

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    hasUserEditedRef.current = true
    setValue(event.target.value)
  }

  React.useEffect(() => {
    setValue(initialValue)
    hasUserEditedRef.current = false
  }, [initialValue])

  React.useEffect(() => {
    if (!hasUserEditedRef.current) {
      return
    }

    const timeout = setTimeout(() => {
      emitChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [debounce, value])

  return <input {...props} value={value} onChange={handleInputChange} />
}

export default DebouncedInput
