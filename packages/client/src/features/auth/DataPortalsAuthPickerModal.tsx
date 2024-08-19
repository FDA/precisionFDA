import React from 'react'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { Content, Footer } from '../modal/styles'
import { UseModal } from '../modal/useModal'
import {
  onLogInWithSSO, useSiteSettingsQuery,
} from './useSiteSettingsQuery'
import { Button } from '../../components/Button'


/*
This modal is rendered for non-logged users when they try to access /DAaaS.
We want them to choose between logging in with SSO or logging in with password and MFA.
 */
export const DataPortalsAuthPickerModal: React.FC<{ modal: UseModal }> = ({
  modal,
}) => {

  const { data: siteSettings } = useSiteSettingsQuery()

  const handleSSOLoginWithDaasRedirect = (url: string) => {
    const decodedRedirectUri = new URL(decodeURIComponent(url)).searchParams.get('redirect_uri')
    if (decodedRedirectUri) {
      url = url.replace(encodeURIComponent(decodedRedirectUri), encodeURIComponent(`${decodedRedirectUri}?redirect_uri=/data-portals/main`))
    }
    onLogInWithSSO(url)
  }

  return (
    <ModalNext
      id="daaas-login-picker-modal"
      isShown={true}
      disableClose
      blur
      hide={() => {}}
    >
      <ModalHeaderTop
        disableClose
        headerText={'Access To Data Analytics as a Service (DAaaS) Requires Login'}
        hide={() => modal.setShowModal(false)}
      />
      <Content $overflowContent={false}>
        {'Please select one of the following options:'}
      </Content>
      <Footer>
        <>
          {siteSettings?.ssoButton.isEnabled && (
            <Button data-variant="primary" onClick={() => handleSSOLoginWithDaasRedirect(siteSettings.ssoButton.data.fdaSsoUrl)}>
              Log In with FDA SSO
            </Button>
          )}
          <Button data-variant="primary"
            onClick={() => window.location.assign(`/login?user_return_to=${encodeURIComponent('/data-portals/main')}`)}>
            Log In with Password and MFA
          </Button>
        </>
      </Footer>
    </ModalNext>
  )
}
