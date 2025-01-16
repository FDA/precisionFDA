import React from 'react'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { Content, Footer } from '../modal/styles'
import { UseModal } from '../modal/useModal'
import {
  onLogInWithSSO, useSiteSettingsQuery,
} from './useSiteSettingsQuery'
import { Button } from '../../components/Button'


/*
This modal is rendered for non-logged users when they try to access restricted page.
We want them to choose between logging in with SSO (if available) or logging in with password and MFA.
 */
export const AuthPickerModal: React.FC<{ modal: UseModal }> = ({
  modal,
}) => {

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
    <ModalNext
      id="daaas-login-picker-modal"
      isShown
      blur
      hide={() => {}}
    >
      <ModalHeaderTop
        disableClose
        headerText="Access to this page requires login"
        hide={() => modal.setShowModal(false)}
      />
      <Content $overflowContent={false}>
        Please select one of the following options:
      </Content>
      <Footer>
        <>
          {(siteSettings?.ssoButton.isEnabled && ssoUrl) ? (
            <Button data-variant="primary" onClick={() => handleSSOLoginWithRedirect(ssoUrl)}>
              Log In with FDA SSO
            </Button>
          ) : null}
          <Button data-variant="primary"
                  onClick={() => {
                    const currentUri = `${window.location.pathname}${window.location.search}${window.location.hash}`
                    window.location.assign(`/login?user_return_to=${encodeURIComponent(currentUri)}`)
                  }}
          >
            Log In with Password and MFA
          </Button>
        </>
      </Footer>
    </ModalNext>
  )
}
