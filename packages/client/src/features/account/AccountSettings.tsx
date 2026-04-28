import type React from 'react'
import { useState } from 'react'
import { canonicalTimeZoneId } from '@/utils/timezones'
import { useAuthUser } from '../auth/useAuthUser'
import { AccountAppearanceSection } from './components/AccountAppearanceSection'
import { AccountProfileSection } from './components/AccountProfileSection'
import { AccountSecuritySection } from './components/AccountSecuritySection'
import { OrganizationSection } from './components/OrganizationSection'
import { useAccountEmailEditor } from './useAccountEmailEditor'
import { useOrganizationUsersQuery, useProfilePageQuery, useUpdateTimeZoneMutation } from './useProfileQueries'

export const AccountSettings = (): React.ReactElement => {
  const user = useAuthUser()
  const { data: profileData } = useProfilePageQuery()
  const { data: orgUsers } = useOrganizationUsersQuery(!profileData?.user.singular)
  const updateTimeZoneMutation = useUpdateTimeZoneMutation()
  const [selectedTimezone, setSelectedTimezone] = useState<string | null>(null)
  const profileEmail = profileData?.profile.email ?? user?.email ?? ''
  const emailConfirmed = profileData?.profile.emailConfirmed ?? true
  const emailEditor = useAccountEmailEditor({ profileEmail })

  const storedTimeZoneId = canonicalTimeZoneId(user?.time_zone)
  const currentTimezone = selectedTimezone ?? storedTimeZoneId
  const hasTimezoneChanges =
    selectedTimezone !== null && selectedTimezone !== '' && selectedTimezone !== storedTimeZoneId

  const changePasswordUrl = user?.dxuser
    ? `https://platform.dnanexus.com/profile/${user.dxuser}/changePassword?client_id=precision_fda_gov`
    : null

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedTimezone(e.currentTarget.value)
  }

  const handleSaveTimezone = (): void => {
    if (!hasTimezoneChanges || !selectedTimezone) return

    updateTimeZoneMutation.mutate({ timeZone: selectedTimezone }, { onSuccess: () => setSelectedTimezone(null) })
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <h1 className="m-0 text-2xl font-bold text-(--c-text-700)">Account Settings</h1>
      <p className="m-0 text-(--c-text-500)">Manage your account preferences.</p>

      <AccountSecuritySection changePasswordUrl={changePasswordUrl} />

      <AccountAppearanceSection />

      {user && (
        <AccountProfileSection
          emailConfirmed={emailConfirmed}
          emailEditor={emailEditor}
          currentTimezone={currentTimezone}
          hasTimezoneChanges={hasTimezoneChanges}
          onSaveTimezone={handleSaveTimezone}
          onTimezoneChange={handleTimezoneChange}
          profileEmail={profileEmail}
          savingTimezone={updateTimeZoneMutation.isPending}
        />
      )}

      {profileData && !profileData.user.singular && profileData.organization && (
        <section className="flex flex-col gap-4 border-t border-(--c-layout-border) pt-4">
          <h2 className="m-0 text-lg font-semibold text-(--c-text-700)">Organization</h2>
          <p className="m-0 text-sm text-(--c-text-500)">Manage your organization details and users.</p>
          <OrganizationSection
            user={profileData.user}
            organization={profileData.organization}
            users={orgUsers?.users ?? []}
          />
        </section>
      )}
    </div>
  )
}
