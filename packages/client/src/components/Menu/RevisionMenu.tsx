import React from 'react'
import { Link } from 'react-router-dom'
import Menu from './Menu'
import { WorkflowRevision } from '../../features/workflows/workflows.types'
import { CaretIcon } from '../icons/CaretIcon'
import { HistoryIcon } from '../icons/HistoryIcon'
import { AppRevision } from '../../features/apps/apps.types'
import styles from './RevisionMenu.module.css'
import baseStyles from './Menu.module.css'
import { cn } from '../../utils/cn'

export const RevisionMenu = ({
  revisions,
  selectedValue,
  linkToRevision,
}: {
  revisions: WorkflowRevision[] | AppRevision[]
  selectedValue: number
  linkToRevision: (revision: WorkflowRevision | AppRevision) => string
}) => {
  const lastRevision = revisions.reduce(
    (acc, shot) => (acc > shot.revision || shot.deleted ? acc : shot.revision),
    0,
  )
  
  const renderRevisionsList = () => (
    <>
      <div className={styles.title} data-testid="dropdown-revisions">Revisions</div>
      {revisions.map(r => (
        !r.deleted && (
          <Menu.Item 
            key={r.id}
            data-testid={`dropdown-revision-${r.revision}`}
            render={
              <Link to={linkToRevision(r)} className={styles.itemLink}>
                {r.revision}
                {r.revision === lastRevision && <span className={styles.tagPill}>Latest</span>}
              </Link>
            }
          />
        )
      ))}
    </>
  )

  return (
    <Menu
      positioner={{ sideOffset: 3, side: 'bottom', align: 'end' }}
      trigger={
        <Menu.Trigger className={cn(baseStyles.trigger, styles.trigger)} data-testid="dropdown-revision-button">
          <div className={styles.dropdownIcon}>
            <HistoryIcon height={13} />
          </div>
          Revision: <span className={styles.revisionNum}>{selectedValue}</span>
          {lastRevision === selectedValue && <span className={styles.tagPill}>Latest</span>}
          <CaretIcon height={5} />
        </Menu.Trigger>
      }
    >
      {renderRevisionsList()}
    </Menu>
  )
}
