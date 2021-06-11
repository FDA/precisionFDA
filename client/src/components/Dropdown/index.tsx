import React, { useState, useRef, FC } from 'react'
import { usePopper } from 'react-popper'
import { PopperContainer, DropdownMenu } from './styles'
import { useOnOutsideClickRef } from '../../hooks/useOnOutsideClick'

export const Dropdown: FC<{
  content: React.ReactNode
  forceShowPopper?: boolean
  trigger?: 'click' | 'hover'
  children: ({}: any) => React.ReactNode
}> = ({ forceShowPopper, trigger = 'hover', content, children }) => {
  const [showPopper, setShowPopper] = useState(false)

  const [delayHandler, setDelayHandler] = useState<any>(null)

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
      placement: 'bottom-end',
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
    }
  )

  return (
    <div ref={clickRef} className="TETE">
      {children({
        style: { cursor: 'pointer' },
        ref: buttonRef,
        onClick: () => trigger === 'click' && setShowPopper(!showPopper),
        onMouseEnter: () => trigger === 'hover' && setShowPopper(true),
        onMouseLeave: () => trigger === 'hover' && setShowPopper(false),
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
    </div>
  )
}

export default Dropdown
