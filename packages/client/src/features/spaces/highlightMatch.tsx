import type React from 'react'
import styles from './spaces.module.css'

export const highlightMatch = (text: string, query: string): React.ReactNode => {
  if (!query) return text
  const lower = text.toLowerCase()
  const q = query.toLowerCase()
  const idx = lower.indexOf(q)
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className={styles.spaceSelectionMatch}>{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  )
}
