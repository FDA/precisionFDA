import React from 'react'
import { Link } from 'react-router'
import type { HomeScope, MetaPath } from '@/features/home/types'
import { getBasePath } from '@/features/home/utils'
import { cleanObject } from '@/utils/object'
import styles from './UploadHeaderText.module.css'

interface UploadHeaderTextProps {
  uploadInProgress: boolean
  spaceId?: string
  spaceName?: string
  homeScope?: HomeScope
  folderPath?: MetaPath[]
  onSwitchToLegacy?: () => void
}

export const UploadHeaderText: React.FC<UploadHeaderTextProps> = ({
  uploadInProgress,
  spaceId,
  spaceName,
  homeScope,
  folderPath,
  onSwitchToLegacy,
}) => {
  const uploadingPrefix = uploadInProgress ? 'Uploading Files to' : 'Upload Files to'

  const createUrl = (folderId?: number | null) => {
    const basePath = `${getBasePath(spaceId)}/files`
    const params = cleanObject({
      scope: homeScope as string,
      folder_id: folderId?.toString(),
    })
    const queryString = new URLSearchParams(params as Record<string, string>).toString()
    return queryString ? `${basePath}?${queryString}` : basePath
  }

  const renderFolderPath = () => {
    if (!folderPath || folderPath.length === 0) return null

    return (
      <>
        {folderPath.map(folder => (
          <React.Fragment key={folder.id}>
            <span className={styles.separator}>/</span>
            <Link className={styles.pathButton} to={createUrl(folder.id)}>
              {folder.name}
            </Link>
          </React.Fragment>
        ))}
      </>
    )
  }

  const renderLegacyLink = () => {
    if (!onSwitchToLegacy || uploadInProgress) return null
    return (
      <button type="button" className={styles.legacyLink} onClick={onSwitchToLegacy}>
        Use legacy uploader
      </button>
    )
  }

  if (spaceId && spaceName) {
    return (
      <div className={styles.headerWrapper}>
        <span className={styles.headerPrefix}>{uploadingPrefix}</span>
        <span className={styles.separator}>/</span>
        <Link className={styles.pathButton} to={createUrl()}>
          {spaceName}
        </Link>
        {renderFolderPath()}
        {renderLegacyLink()}
      </div>
    )
  }

  return (
    <div className={styles.headerWrapper}>
      <span className={styles.headerPrefix}>{uploadingPrefix}</span>
      <span className={styles.separator}>/</span>
      <Link className={styles.pathButton} to={createUrl()}>
        My Home
      </Link>
      {renderFolderPath()}
      {renderLegacyLink()}
    </div>
  )
}
