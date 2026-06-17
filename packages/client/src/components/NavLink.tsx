import * as React from 'react'
import { NavLink as BaseNavLink, type NavLinkProps as BaseNavLinkProps } from 'react-router'

type NavLinkProps = Omit<BaseNavLinkProps, 'className' | 'style'> & {
  activeClassName?: string
  activeStyle?: React.CSSProperties
  className?: string
  style?: React.CSSProperties
}

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ activeClassName, activeStyle, className, style, ...props }, ref) => {
    return (
      <BaseNavLink
        ref={ref}
        {...props}
        className={({ isActive }) => [className, isActive ? activeClassName : null].filter(Boolean).join(' ')}
        style={({ isActive }) => ({
          ...style,
          ...(isActive ? activeStyle : null),
        })}
      />
    )
  },
)

NavLink.displayName = 'NavLink'
