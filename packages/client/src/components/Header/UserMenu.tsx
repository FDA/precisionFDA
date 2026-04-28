import { Link } from 'react-router'
import { IUser } from '../../types/user'
import Menu from '../Menu/Menu'
import { StyledLink } from './styles'

type UserMenuProps = {
  user: IUser | null | undefined
  userCanAdministerSite?: boolean
  handleLogout: () => void
}

export const UserMenu = ({ user, userCanAdministerSite = false, handleLogout }: UserMenuProps) => (
  <>
    <Menu.Item
      render={
        <StyledLink as={Link} data-turbolinks="false" to="/account">
          Account
        </StyledLink>
      }
    />
    {user && (
      <>
        <Menu.Item
          render={
            <StyledLink as={Link} to="/account/cloud-resources">
              Cloud Resources
            </StyledLink>
          }
        />
      </>
    )}
    <Menu.Item
      render={
        <StyledLink as={Link} to="/account/api-keys">
          API Keys
        </StyledLink>
      }
    />
    <Menu.Item
      render={
        <StyledLink data-turbolinks="false" target="_blank" href="/licenses">
          Manage Licenses
        </StyledLink>
      }
    />
    <Menu.Item
      render={
        <StyledLink as={Link} data-turbolinks="false" to="/account/notifications">
          Notification Settings
        </StyledLink>
      }
    />
    <Menu.Separator />
    <Menu.Item
      render={
        <StyledLink as={Link} to="/about" data-turbolinks="false">
          About
        </StyledLink>
      }
    />
    <Menu.Item
      render={
        <StyledLink data-turbolinks="false" href="/guidelines">
          Guidelines
        </StyledLink>
      }
    />
    <Menu.Item
      render={
        <StyledLink as="a" target="_blank" href="/docs" data-turbolinks="false">
          Docs
        </StyledLink>
      }
    />
    <Menu.Separator />
    {userCanAdministerSite && (
      <>
        <Menu.Item
          render={
            <StyledLink as={Link} to="/account/admin">
              Admin Dashboard
            </StyledLink>
          }
        />
        <Menu.Separator />
      </>
    )}
    <Menu.Item onClick={() => handleLogout()}>Log Out</Menu.Item>
  </>
)
