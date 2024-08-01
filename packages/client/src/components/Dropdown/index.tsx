import React, { useState, useRef, FC } from 'react'
import { usePopper } from 'react-popper'
import styled from 'styled-components'
import { Placement } from '@popperjs/core'
import { PopperContainer, DropdownMenu } from './styles'
import { useOnOutsideClickRef } from '../../hooks/useOnOutsideClick'
import { useKeyPress } from '../../hooks/useKeyPress'

export const StyledDropdown = styled.div``

export const Dropdown: FC<{
  content: React.ReactNode
  placement? : Placement
  forceShowPopper?: boolean
  trigger?: 'click' | 'hover'
  children: ({}: any) => React.ReactNode
}> = ({ forceShowPopper, trigger = 'hover', content, children, placement = 'bottom-end', ...rest }) => {
  const [showPopper, setShowPopper] = useState(false)
  const [delayHandler, setDelayHandler] = useState<any>(null)
  useKeyPress('Escape', () => setShowPopper(false))

  const handleMouseEnter = (event: any) => {
    setDelayHandler(
      setTimeout(() => {
        setShowPopper(!showPopper)
      }, 500)
    )
  }

  const handleMouseLeave = () => {
    clearTimeout(delayHandler)
  }

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
        // {
        //   name: "offset",
        //   options: {
        //     offset: [0, 5],
        //   },
        // },
      ],
    },
  )

  return (
    <StyledDropdown ref={clickRef} { ...rest }>
      {children({
        style: { cursor: 'pointer' },
        ref: buttonRef,
        onClick: () => trigger === 'click' && setShowPopper(!showPopper), // outside only
        onMouseEnter: () => trigger === 'hover' && setShowPopper(true),
        onMouseLeave: () => trigger === 'hover' && setShowPopper(false),
        $isActive: showPopper,
      })}
      {forceShowPopper || showPopper && (
        <PopperContainer
          ref={popperRef}
          style={{ ...styles.popper }}
          {...attributes.popper}
          onMouseEnter={() => trigger === 'hover' && setShowPopper(true)}
          onMouseLeave={() => trigger === 'hover' && setShowPopper(false)}
        >
          <DropdownMenu>
            <div ref={setArrowRef as any} style={styles.arrow} id="arrow" />
            {content}
          </DropdownMenu>
        </PopperContainer>
      )}
    </StyledDropdown>
  )
}

export default Dropdown
