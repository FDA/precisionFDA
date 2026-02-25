import { useEffect, useRef, useState } from 'react'

export const useAnimatedProgress = (targetProgress: number | null, isActive: boolean) => {
  const [displayProgress, setDisplayProgress] = useState(targetProgress ?? 0)
  const animationRef = useRef<number | null>(null)
  const lastTargetRef = useRef(targetProgress ?? 0)

  useEffect(() => {
    if (targetProgress === null || !isActive) {
      setDisplayProgress(targetProgress ?? 0)
      return
    }

    const start = lastTargetRef.current
    const end = targetProgress
    const duration = 300 // ms
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Linear interpolation
      const current = start + (end - start) * progress
      setDisplayProgress(Math.round(current))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        lastTargetRef.current = end
        animationRef.current = null
      }
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [targetProgress, isActive])

  return displayProgress
}
