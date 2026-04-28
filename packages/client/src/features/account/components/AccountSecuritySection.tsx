import { ExternalLink } from 'lucide-react'
import type React from 'react'
import { Button } from '@/components/Button'

interface AccountSecuritySectionProps {
  changePasswordUrl: string | null
}

export function AccountSecuritySection({
  changePasswordUrl,
}: AccountSecuritySectionProps): React.ReactElement | null {
  if (!changePasswordUrl) return null

  return (
    <section className="flex flex-col gap-4 border-t border-(--c-layout-border) pt-4">
      <h2 className="m-0 text-lg font-semibold text-(--c-text-700)">Security</h2>
      <p className="m-0 text-sm text-(--c-text-500)">Manage your account security settings.</p>
      <Button
        as="a"
        data-variant="primary"
        href={changePasswordUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Change Password
        <ExternalLink size={16} />
      </Button>
    </section>
  )
}
