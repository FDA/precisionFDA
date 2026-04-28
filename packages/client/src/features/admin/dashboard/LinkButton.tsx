import React, { ReactNode } from 'react'
import { Link } from 'react-router'
import styles from './LinkButton.module.css'

const LinkButton = ({
  to,
  nonReact,
  icon,
  label,
}: {
  to: string
  nonReact?: boolean
  icon?: ReactNode
  label?: string
}) => {
  const content = (
    <>
      <div className={styles.iconWrapper}>{icon}</div>
      <span className={styles.label}>{label}</span>
    </>
  )

  if (nonReact) {
    return (
      <a href={to} className={styles.linkCard}>
        {content}
      </a>
    )
  }

  return (
    <Link to={to} className={styles.linkCard}>
      {content}
    </Link>
  )
}

export default LinkButton
