import type React from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { UseModal } from '../modal/useModal'
import { onLogInWithSSO, useSiteSettingsQuery } from './useSiteSettingsQuery'

export const SessionExpiredModal: React.FC<UseModal> = props => {
  const { data } = useSiteSettingsQuery()
  return (
    <Dialog open={Boolean(props.isShown)} onOpenChange={() => {}}>
      <DialogContent
        id="session-expired-modal"
        showCloseButton={false}
        overlayClassName="supports-backdrop-filter:backdrop-blur-[6px]"
        className="gap-4"
      >
        <DialogHeader>
          <DialogTitle>Session Expired</DialogTitle>
        </DialogHeader>
        <div className="py-1">You were logged out after 15 minutes of inactivity. Please Log In again.</div>
        <DialogFooter>
          {data?.ssoButton.isEnabled && (
            <Button onClick={() => onLogInWithSSO(data.ssoButton.data?.ssoUrl)}>Log In with SSO</Button>
          )}
          <Button onClick={() => (window.location.href = '/login')}>Log in</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
