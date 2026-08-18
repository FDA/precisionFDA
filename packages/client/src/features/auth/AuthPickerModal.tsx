import type React from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { onLogInWithSSO, useSiteSettingsQuery } from './useSiteSettingsQuery'

/*
This modal is rendered for non-logged users when they try to access restricted page.
We want them to choose between logging in with SSO (if available) or logging in with password and MFA.
 */
export const AuthPickerModal: React.FC = () => {
  const { data: siteSettings } = useSiteSettingsQuery()

  const handleSSOLoginWithRedirect = (url: string) => {
    // Get the current URI from the address bar
    const currentUri = `${window.location.pathname}${window.location.search}${window.location.hash}`

    const decodedRedirectUri = new URL(decodeURIComponent(url)).searchParams.get('redirect_uri')

    let loginUrl = url
    if (decodedRedirectUri) {
      // Replace the `redirect_uri` with the current URI
      loginUrl = url.replace(
        encodeURIComponent(decodedRedirectUri),
        encodeURIComponent(`${decodedRedirectUri}?redirect_uri=${currentUri}`),
      )
    }

    onLogInWithSSO(loginUrl)
  }

  const ssoUrl = siteSettings?.ssoButton.data?.ssoUrl

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent
        id="daaas-login-picker-modal"
        showCloseButton={false}
        overlayClassName="supports-backdrop-filter:backdrop-blur-[6px]"
        className="gap-4"
      >
        <DialogHeader>
          <DialogTitle>Access to this page requires login</DialogTitle>
        </DialogHeader>
        <div className="py-1">Please select one of the following options:</div>
        <DialogFooter>
          {siteSettings?.ssoButton.isEnabled && ssoUrl ? (
            <Button onClick={() => handleSSOLoginWithRedirect(ssoUrl)}>Log In with FDA SSO</Button>
          ) : null}
          <Button
            onClick={() => {
              const currentUri = `${window.location.pathname}${window.location.search}${window.location.hash}`
              window.location.assign(`/login?user_return_to=${encodeURIComponent(currentUri)}`)
            }}
          >
            Log In with Password and MFA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
