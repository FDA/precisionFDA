// NOTE: This might not be a good way of doing useInterval. for more information see
// https://overreacted.io/making-setinterval-declarative-with-react-hooks/

import { useEffect, useRef } from 'react'

export const useInterval = (callback: (a: unknown) => void, delay: number | null) => {
  // @ts-expect-error unknonwn type
  const savedCallback = useRef()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    function tick() {
      // @ts-expect-error unknonwn type
      savedCallback.current()
    }
    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}
