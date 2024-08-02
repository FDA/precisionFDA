import React, { useRef } from 'react'
import styled from 'styled-components'
import { SiteSettingsResponse } from '../../features/auth/useSiteSettingsQuery'
import { ActionsDropdownContent } from '../../features/home/ActionDropdownContent'
import { ActionFunctionsType } from '../../features/home/types'
import { Button } from '../Button'
import Dropdown from '../Dropdown'
import { ArrowIcon } from '../icons/ArrowIcon'

const LoginButtonGroup = styled.div`
  display: flex;
  & > button {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
`

const DropdownButton = styled(Button)`
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  height: 100%;
`

const SelectLoginButton = ({ fdaSsoUrl, basicUrl }: { fdaSsoUrl: string; basicUrl: string }) => {
  const [isSSOSelected, setIsSSOSelected] = React.useState(true)
  let dropdownButtonRef = useRef<HTMLInputElement>(null)

  const actions = {
    login_sso: {
      func: () => {
        setIsSSOSelected(true)
        dropdownButtonRef.current?.click()
      },
      isDisabled: false,
      isSelected: isSSOSelected,
      key: 'login_sso',
      type: 'selection',
      content: <p>Log In with SSO</p>,
    },
    login: {
      func: () => {
        setIsSSOSelected(false)
        dropdownButtonRef.current?.click()
      },
      isDisabled: false,
      isSelected: !isSSOSelected,
      key: 'login',
      type: 'selection',
      content: <p>Log In</p>,
    },
  } as ActionFunctionsType<any>

  const handleLogin = () => {
    const redirectUrl = isSSOSelected ? fdaSsoUrl : basicUrl
    window.location.assign(redirectUrl)
  }
  return (
    <LoginButtonGroup>
      <Button variant="primary" onClick={handleLogin}>
        {isSSOSelected ? 'Log In with SSO' : 'Log In'}
      </Button>
      <Dropdown trigger="click" content={<ActionsDropdownContent actions={actions} />}>
        {dropdownProps => {
          dropdownButtonRef = dropdownProps.ref
          return (
            <DropdownButton {...dropdownProps} active={dropdownProps.isActive} variant="primary">
              <ArrowIcon />
            </DropdownButton>
          )
        }}
      </Dropdown>
    </LoginButtonGroup>
  )
}

export const LoginButton = ({ siteSetting }: { siteSetting?: SiteSettingsResponse }) => {
  const returnUrl = `${window.location.pathname}${window.location.search}`
  const loginUrl = `/login${returnUrl !== '/' ? `?user_return_to=${returnUrl}` : ''}`

  const onLogIn = () => {
    window.location.assign(loginUrl)
  }
  return siteSetting?.ssoButton.isEnabled ? (
    <SelectLoginButton fdaSsoUrl={siteSetting.ssoButton.data.fdaSsoUrl} basicUrl={loginUrl} />
  ) : (
    <Button variant="primary" onClick={onLogIn}>
      Log In
    </Button>
  )
}
