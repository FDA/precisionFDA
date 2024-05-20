import { useRef, useState } from 'react'
import { usePopper } from 'react-popper'

export function useTablePopper() {
  const buttonRef = useRef(null)
  const popperRef = useRef(null)
  const [arrowRef, setArrowRef] = useState(null)
  const { styles, attributes } = usePopper(
    buttonRef.current,
    popperRef.current,
    {
      placement: 'right-start',
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

  styles.popper.position = 'unset'

  return ({ buttonRef, popperRef, arrowRef, styles, attributes })
}
