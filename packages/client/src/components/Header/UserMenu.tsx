import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { IUser } from '@/types/user'
import { cn } from '@/utils/cn'
import Menu from '../Menu/Menu'

/** User dropdown menu links (replaces Header/styles StyledLink) */
const userMenuDropdownLink = cn(
  'block w-auto cursor-pointer px-3 leading-[30px] transition-colors duration-300 ease-in-out',
  'bg-dropdown-bg hover:bg-dropdown-hover-bg hover:text-inherit',
)

type MenuLinkItemProps = {
  /** SPA route rendered as a react-router Link */
  to?: string
  /** Rails-served page rendered as a plain anchor (full page load) */
  href?: string
  newTab?: boolean
  children: ReactNode
}

const MenuLinkItem = ({ to, href, newTab, children }: MenuLinkItemProps) => (
  <Menu.Item
    render={
      to ? (
        <Link className={userMenuDropdownLink} data-turbolinks="false" to={to}>
          {children}
        </Link>
      ) : (
        <a
          className={userMenuDropdownLink}
          data-turbolinks="false"
          href={href}
          {...(newTab && { target: '_blank', rel: 'noreferrer' })}
        >
          {children}
        </a>
      )
    }
  />
)

type UserMenuProps = {
  user: IUser
  handleLogout: () => void
}

export const UserMenu = ({ user, handleLogout }: UserMenuProps) => (
  <>
    <MenuLinkItem to="/account">Account</MenuLinkItem>
    <MenuLinkItem href={`/users/${user.dxuser}`}>Public Profile</MenuLinkItem>
    <MenuLinkItem to="/account/cloud-resources">Cloud Resources</MenuLinkItem>
    <MenuLinkItem to="/account/api-keys">API Keys</MenuLinkItem>
    <MenuLinkItem href="/licenses">Manage Licenses</MenuLinkItem>
    <MenuLinkItem to="/account/notifications">Notification Settings</MenuLinkItem>
    <Menu.Separator />
    <MenuLinkItem to="/about">About</MenuLinkItem>
    <MenuLinkItem href="/guidelines">Guidelines</MenuLinkItem>
    <MenuLinkItem href="/docs" newTab>
      Docs
    </MenuLinkItem>
    <Menu.Separator />
    {user.can_administer_site && (
      <>
        <MenuLinkItem to="/account/admin">Admin Dashboard</MenuLinkItem>
        <Menu.Separator />
      </>
    )}
    <Menu.Item onClick={handleLogout}>Log Out</Menu.Item>
  </>
)
