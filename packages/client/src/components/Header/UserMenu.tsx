import React from 'react'
import { Link } from 'react-router'
import Menu from '../Menu/Menu'
import { IUser } from '../../types/user'
import { StyledLink } from './styles'

type UserMenuProps = {
  user: IUser | null | undefined
  userCanAdministerSite?: boolean
  handleLogout: () => void
  showCloudResourcesModal: () => void
  generateCLIKey: () => void
}

export const UserMenu = ({
  user,
  userCanAdministerSite = false,
  handleLogout,
  showCloudResourcesModal,
  generateCLIKey,
}: UserMenuProps) => (
  <>
    <Menu.Item render={<StyledLink data-turbolinks="false" href="/profile">Profile</StyledLink>} />
    {user && (
      <>
        <Menu.Item render={<StyledLink data-turbolinks="false" href={`/users/${user?.dxuser}`}>Public Profile</StyledLink>} />
        <Menu.Item onClick={() => showCloudResourcesModal()}>Cloud Resources</Menu.Item>
      </>
    )}
    <Menu.Item onClick={() => generateCLIKey()}>Generate CLI Key</Menu.Item>
    <Menu.Item render={<StyledLink data-turbolinks="false" href="/licenses">Manage Licenses</StyledLink>} />
    <Menu.Item render={<StyledLink as={Link} data-turbolinks="false" to="/account/notifications">Notification Settings</StyledLink>} />
    <Menu.Separator />
    <Menu.Item render={<StyledLink as={Link} to="/about" data-turbolinks="false">About</StyledLink>} />
    <Menu.Item render={<StyledLink data-turbolinks="false" href="/guidelines">Guidelines</StyledLink>} />
    <Menu.Item render={<StyledLink as="a" target="_blank" href="/docs" data-turbolinks="false">Docs</StyledLink>} />
    <Menu.Separator />
    {userCanAdministerSite && (
      <>
        <Menu.Item render={<StyledLink as={Link} to="/admin">Admin Dashboard</StyledLink>} />
        <Menu.Separator />
      </>
    )}
    <Menu.Item onClick={() => handleLogout()}>Log Out</Menu.Item>
  </>
)
