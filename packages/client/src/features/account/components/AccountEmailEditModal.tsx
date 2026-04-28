import type React from 'react'
import { useEffect, useEffectEvent, type RefObject } from 'react'
import { Button } from '@/components/Button'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'

interface AccountEmailEditModalProps {
  emailFieldError: string | null
  emailInputRef: RefObject<HTMLInputElement | null>
  emailValue: string
  hasEmailChanges: boolean
  isShown: boolean
  onClose: () => void
  onContinue: () => void
  onEmailBlur: () => void
  onEmailChange: (value: string) => void
}

export function AccountEmailEditModal({
  emailFieldError,
  emailInputRef,
  emailValue,
  hasEmailChanges,
  isShown,
  onClose,
  onContinue,
  onEmailBlur,
  onEmailChange,
}: AccountEmailEditModalProps): React.ReactElement {
  const fieldLabelClassName = 'text-sm font-medium text-(--c-text-600)'
  const fieldInputClassName =
    'w-full rounded-md border border-(--c-layout-border) bg-background px-3 py-2.5 text-sm text-(--c-text-700) transition-[border-color,box-shadow] hover:border-(--c-text-400) focus:border-(--primary-500) focus:outline-none focus:shadow-[0_0_0_2px_var(--primary-100)]'
  const helperTextClassName = 'm-0 text-sm text-(--c-text-500)'

  const focusEmailField = useEffectEvent(() => {
    requestAnimationFrame(() => {
      emailInputRef.current?.focus()
      emailInputRef.current?.select()
    })
  })

  useEffect(() => {
    if (isShown) {
      focusEmailField()
    }
  }, [isShown])

  return (
    <ModalNext id="account-email-edit-modal" isShown={isShown} hide={onClose} variant="small">
      <ModalHeaderTop headerText="Change email address" hide={onClose} />
      <form
        noValidate
        onSubmit={e => {
          e.preventDefault()
          onContinue()
        }}
      >
        <div className="flex flex-col gap-4 p-6">
          <p className={helperTextClassName}>
            Enter the new address. You will be asked for your password and one-time code on the next step.
          </p>

          <div className="flex flex-col gap-2">
            <label className={fieldLabelClassName} htmlFor="account-email-edit-field">
              Email address
            </label>
            <input
              ref={emailInputRef}
              id="account-email-edit-field"
              type="email"
              autoComplete="email"
              aria-invalid={emailFieldError ? true : undefined}
              aria-describedby={emailFieldError ? 'account-email-edit-field-error' : undefined}
              className={`${fieldInputClassName} ${emailFieldError ? 'border-destructive hover:border-destructive focus:border-destructive' : ''}`}
              value={emailValue}
              onChange={e => onEmailChange(e.currentTarget.value)}
              onBlur={onEmailBlur}
            />
            {emailFieldError ? (
              <p
                id="account-email-edit-field-error"
                role="alert"
                aria-live="polite"
                className="m-0 text-sm font-medium text-red-600 dark:text-red-400"
              >
                {emailFieldError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-(--c-layout-border) px-6 pt-4 pb-6">
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" data-variant="primary" disabled={!hasEmailChanges}>
            Continue
          </Button>
        </div>
      </form>
    </ModalNext>
  )
}
