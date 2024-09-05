import { Placement } from '@popperjs/core'
import React, { FC, useRef, useState } from 'react'
import { usePopper } from 'react-popper'
import { useKeyPress } from '../../hooks/useKeyPress'
import { useOnOutsideClickRef } from '../../hooks/useOnOutsideClick'
import { DropdownMenu, PopperContainer } from './styles'

export type DropdownChildProps = {
  style: any
  ref: React.MutableRefObject<any>
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  $isActive: boolean,
}

export const DropdownNext: FC<{
  placement?: Placement
  forceShowPopper?: boolean
  trigger?: 'click' | 'hover'
  children: (props: DropdownChildProps, actions: { hide: () => void }) => React.ReactNode
  content: (props: DropdownChildProps, actions: { hide: () => void }) => React.ReactNode
}> = ({
  forceShowPopper,
  trigger = 'hover',
  content,
  children,
  placement = 'bottom-end',
}) => {
  const [showPopper, setShowPopper] = useState(false)
  useKeyPress('Escape', () => setShowPopper(false))

  const clickRef = useOnOutsideClickRef(showPopper, setShowPopper)
  const buttonRef = useRef(null)
  const popperRef = useRef(null)
  // the ref for the arrow must be a callback ref
  const [arrowRef, setArrowRef] = useState(null)

  const { styles, attributes } = usePopper(
    buttonRef.current,
    popperRef.current,
    {
      placement,
      modifiers: [
        {
          name: 'arrow',
          options: {
            element: arrowRef,
          },
        },
      ],
    },
  )

  const handleMouseEnter = () => trigger === 'hover' && setShowPopper(true)
  const handleMouseLeave = () => trigger === 'hover' && setShowPopper(false)

  return (
    <div ref={clickRef} style={{ display: 'contents' }}>
      {children({
        style: { cursor: 'pointer' },
        ref: buttonRef,
        onClick: () => trigger === 'click' && setShowPopper(!showPopper), // outside only
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        $isActive: showPopper,
      }, {
        hide: () => setShowPopper(false),
      })}
      {forceShowPopper ||
        (showPopper && (
          <PopperContainer
            ref={popperRef}
            style={{ ...styles.popper }}
            {...attributes.popper}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <DropdownMenu>
              <div ref={setArrowRef as any} style={styles.arrow} id="arrow" />
              {content({
                style: { cursor: 'pointer' },
                ref: buttonRef,
                onClick: () =>
                  trigger === 'click' && setShowPopper(!showPopper), // outside only
                onMouseEnter: handleMouseEnter,
                onMouseLeave: handleMouseLeave,
                $isActive: showPopper,
              }, { hide: () => setShowPopper(false) })}
            </DropdownMenu>
          </PopperContainer>
        ))}
    </div>
  )
}
