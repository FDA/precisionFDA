import { Link } from 'react-router'
import { cn } from '@/utils/cn'
import type { IUser } from '../../types/user'
import Menu from '../Menu/Menu'

/** User dropdown menu links (replaces Header/styles StyledLink) */
const userMenuDropdownLink = cn(
  'block w-auto cursor-pointer px-3 leading-[30px] transition-colors duration-300 ease-in-out',
  'bg-dropdown-bg hover:bg-dropdown-hover-bg hover:text-inherit',
)

type UserMenuProps = {
  user: IUser | null | undefined
  userCanAdministerSite?: boolean
  handleLogout: () => void
}

export const UserMenu = ({ user, userCanAdministerSite = false, handleLogout }: UserMenuProps) => (
  <>
    <Menu.Item
      render={
        <Link className={userMenuDropdownLink} data-turbolinks="false" to="/account">
          Account
        </Link>
      }
    />
    {user && (
      <>
        <Menu.Item
          render={
            <a className={userMenuDropdownLink} data-turbolinks="false" href={`/users/${user.dxuser}`}>
              Public Profile
            </a>
          }
        />
        <Menu.Item
          render={
            <Link className={userMenuDropdownLink} data-turbolinks="false" to="/account/cloud-resources">
              Cloud Resources
            </Link>
          }
        />
      </>
    )}
    <Menu.Item
      render={
        <Link className={userMenuDropdownLink} data-turbolinks="false" to="/account/api-keys">
          API Keys
        </Link>
      }
    />
    <Menu.Item
      render={
        <Link className={userMenuDropdownLink} data-turbolinks="false" to="/account/licenses">
          Manage Licenses
        </Link>
      }
    />
    <Menu.Item
      render={
        <Link className={userMenuDropdownLink} data-turbolinks="false" to="/account/notifications">
          Notification Settings
        </Link>
      }
    />
    <Menu.Separator />
    <Menu.Item
      render={
        <Link className={userMenuDropdownLink} to="/about" data-turbolinks="false">
          About
        </Link>
      }
    />
    <Menu.Item
      render={
        <a className={userMenuDropdownLink} data-turbolinks="false" href="/guidelines">
          Guidelines
        </a>
      }
    />
    <Menu.Item
      render={
        <a className={userMenuDropdownLink} target="_blank" href="/docs" data-turbolinks="false" rel="noreferrer">
          Docs
        </a>
      }
    />
    <Menu.Separator />
    {userCanAdministerSite && (
      <>
        <Menu.Item
          render={
            <Link className={userMenuDropdownLink} to="/account/admin">
              Admin Dashboard
            </Link>
          }
        />
        <Menu.Separator />
      </>
    )}
    <Menu.Item onClick={() => handleLogout()}>Log Out</Menu.Item>
  </>
)
