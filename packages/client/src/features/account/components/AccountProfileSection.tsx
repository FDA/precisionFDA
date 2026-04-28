import type React from 'react'
import { Button } from '@/components/Button'
import { TIMEZONES } from '@/utils/timezones'
import type { AccountEmailEditor } from '../useAccountEmailEditor'
import { AccountEmailCredentialsModal } from './AccountEmailCredentialsModal'
import { AccountEmailEditModal } from './AccountEmailEditModal'

interface AccountProfileSectionProps {
  currentTimezone: string
  emailConfirmed: boolean
  emailEditor: AccountEmailEditor
  hasTimezoneChanges: boolean
  onSaveTimezone: () => void | Promise<void>
  onTimezoneChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  profileEmail: string
  savingTimezone: boolean
}

export function AccountProfileSection({
  currentTimezone,
  emailConfirmed,
  emailEditor,
  hasTimezoneChanges,
  onSaveTimezone,
  onTimezoneChange,
  profileEmail,
  savingTimezone,
}: AccountProfileSectionProps): React.ReactElement {
  const shouldShowVerificationNotice = profileEmail.length > 0 && !emailConfirmed
  const fieldLabelClassName = 'text-sm font-medium text-(--c-text-600)'
  const fieldDisplayClassName =
    'm-0 flex min-h-[42px] w-full max-w-[420px] flex-[1_1_280px] items-center rounded-md border border-(--c-layout-border) bg-muted/50 px-3 py-2.5 text-sm text-(--c-text-700)'
  const helperTextClassName = 'm-0 text-sm text-(--c-text-500)'
  const sectionClassName = 'flex flex-col gap-4 border-t border-(--c-layout-border) pt-4'

  return (
    <section className={sectionClassName}>
      <h2 className="m-0 text-lg font-semibold text-(--c-text-700)">Profile</h2>
      <p className="m-0 text-sm text-(--c-text-500)">Your account information and preferences.</p>

      <div className="flex max-w-[600px] flex-col gap-2">
        <div className={fieldLabelClassName}>Email Address</div>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className={fieldDisplayClassName}>{profileEmail || '—'}</div>
          <Button onClick={emailEditor.handleEditEmail} disabled={emailEditor.isSavingEmail}>
            Edit
          </Button>
        </div>
        {shouldShowVerificationNotice && (
          <p className={helperTextClassName}>This email change is pending verification. Check the link sent to this address.</p>
        )}
      </div>

      <div className="flex max-w-[600px] flex-col gap-2">
        <label className={fieldLabelClassName} htmlFor="account-time-zone">
          Time Zone
        </label>
        <div className="flex items-center gap-3">
          <select
            id="account-time-zone"
            className="w-full max-w-[420px] rounded-md border border-(--c-layout-border) bg-background px-3 py-2.5 text-sm text-(--c-text-700) transition-[border-color,box-shadow] hover:border-(--c-text-400) focus:border-(--primary-500) focus:outline-none focus:shadow-[0_0_0_2px_var(--primary-100)] disabled:cursor-not-allowed disabled:opacity-60"
            value={currentTimezone}
            onChange={onTimezoneChange}
            disabled={savingTimezone}
          >
            <option value="">Please select...</option>
            {TIMEZONES.map(tz => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          {hasTimezoneChanges && (
            <Button data-variant="primary" onClick={() => void onSaveTimezone()} disabled={savingTimezone}>
              {savingTimezone ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
      </div>

      <AccountEmailEditModal
        emailFieldError={emailEditor.emailFieldError}
        emailInputRef={emailEditor.emailInputRef}
        emailValue={emailEditor.emailValue}
        hasEmailChanges={emailEditor.hasEmailChanges}
        isShown={emailEditor.emailEditModal.isShown}
        onClose={emailEditor.closeEmailEditModal}
        onContinue={emailEditor.handleEmailContinueClick}
        onEmailBlur={emailEditor.handleEmailBlur}
        onEmailChange={emailEditor.setEmailValue}
      />

      <AccountEmailCredentialsModal
        credentialsError={emailEditor.credentialsError}
        isSavingEmail={emailEditor.isSavingEmail}
        isShown={emailEditor.emailCredentialsModal.isShown}
        newEmail={emailEditor.emailValue.trim()}
        onEditNewEmail={emailEditor.handleBackToEditNewEmail}
        onClose={emailEditor.closeEmailCredentialsModal}
        onOtpChange={emailEditor.setOtp}
        onPasswordChange={emailEditor.setPassword}
        onSubmit={emailEditor.handleConfirmEmailChange}
        otp={emailEditor.otp}
        password={emailEditor.password}
      />
    </section>
  )
}
