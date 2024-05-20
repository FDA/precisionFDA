import * as React from 'react'
import { NavLink as BaseNavLink } from 'react-router-dom'

export const NavLink = React.forwardRef(
  ({ activeClassName, activeStyle, style, ...props }: any, ref) => {
    return (
      <BaseNavLink
        ref={ref}
        {...props}
        className={({ isActive }) =>
          [props.className, isActive ? activeClassName : null]
            .filter(Boolean)
            .join(' ')
        }
        style={({ isActive }) => ({
          ...style,
          ...(isActive ? activeStyle : null),
        })}
      />
    )
  },
)
