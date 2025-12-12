import { useMutation, useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Button } from '../../../../components/Button'
import { FileCheckIcon } from '../../../../components/icons/FileCheckIcon'
import { FileIcon } from '../../../../components/icons/FileIcon'
import { FolderOpenIcon } from '../../../../components/icons/FolderOpenIcon'
import { cn } from '../../../../utils/cn'
import { displayPayloadMessage, Payload } from '../../../../utils/api'
import { ApiErrorResponse, HomeScope, ServerScope } from '../../../home/types'
import { getBasePathFromScope } from '../../../home/utils'
import { ModalHeaderTop, ModalNext } from '../../../modal/ModalNext'
import { useModal } from '../../../modal/useModal'
import { copyFilesRequest, fetchSelectedFiles, validateCopyingFiles } from '../../files.api'
import { IExistingFileSet, ISelectedFile, ISelectedFolder, SelectedNode } from '../../files.types'
import { ScopeAndFolderSelection } from './ScopeAndFolderSelection'
import styles from './CopyFilesModal.module.css'
import { Footer } from '../../../modal/styles'
import { toastError } from '../../../../components/NotificationCenter/ToastHelper'

interface FileListItemContentProps {
  file: ISelectedFile
}

const FileListItemContent = ({ file }: FileListItemContentProps) => {
  const [searchParams] = useSearchParams()
  const homeScope = searchParams.get('scope') as HomeScope
  const currentPath = window.location.pathname
  const pathWithScope = homeScope ? `${currentPath}?scope=${homeScope}` : `${currentPath}?scope=me`
  let folderQ = ''
  if (file.sourceFolderId) {
    folderQ = `&folder_id=${file.sourceFolderId}`
  }

  return (
    <>
      <div className={styles.fileHeader}>
        <a
          href={`${currentPath}/${file.uid}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.fileLink}
          title={file.name}
        >
          <FileIcon width={16} />
          <span className={styles.fileName}>{file.name}</span>
        </a>
      </div>
      <div className={styles.fileMetadata}>
        <a
          href={`${pathWithScope}${folderQ}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.metadataItem}
          title={file.sourceScopePath}
        >
          <span className={styles.metadataIcon}>
            <FolderOpenIcon width={14} />
          </span>
          <span className={styles.metadataText}>{file.sourceScopePath}</span>
        </a>
        {file.isCopied && (
          <a
            href={`${getBasePathFromScope(file.targetScope)}/files/${file.targetUid}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.metadataItem}
            title={file.targetScopePath}
          >
            <span className={styles.metadataIcon}>
              <FileCheckIcon width={14} />
            </span>
            <span className={styles.metadataText}>{file.targetScopePath}</span>
          </a>
        )}
      </div>
    </>
  )
}

interface SelectedFileProps {
  file: ISelectedFile
}

const SelectedFile = ({ file }: SelectedFileProps) => {
  return (
    <li className={cn(styles.fileCard, file.isCopied && styles.fileCardCopied)}>
      <FileListItemContent file={file} />
    </li>
  )
}

interface SelectedFolderProps {
  folder: ISelectedFolder
}

const SelectedFolder = ({ folder }: SelectedFolderProps) => {
  const [searchParams] = useSearchParams()
  const homeScope = searchParams.get('scope') as HomeScope
  const currentPath = window.location.pathname
  const pathWithScope = homeScope ? `${currentPath}?scope=${homeScope}&` : `${currentPath}?`

  return (
    <li className={cn(styles.folderCard, folder.isCopied && styles.folderCardCopied)}>
      <div className={styles.folderHeader}>
        <a
          href={`${pathWithScope}folder_id=${folder.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.folderLink}
          title={folder.name}
        >
          <FolderOpenIcon width={16} />
          <span className={styles.folderName}>{folder.name}</span>
        </a>
      </div>
      <ul className={styles.folderChildren}>
        {folder.children.map((child: ISelectedFile, index: number) => (
          <li key={index} className={cn(styles.folderChild, !folder.isCopied && child.isCopied && styles.folderChildCopied)}>
            <FileListItemContent file={child} />
          </li>
        ))}
      </ul>
    </li>
  )
}

interface CopyFileListProps {
  nodes: SelectedNode[]
}

const CopyFileList = ({ nodes }: CopyFileListProps) => {
  return (
    <ul className={styles.selectedItemsList}>
      {nodes.map((node: SelectedNode, index: number) => {
        return node.type === 'UserFile' ? <SelectedFile key={index} file={node} /> : <SelectedFolder key={index} folder={node} />
      })}
    </ul>
  )
}

const message = {
  someFilesExist:
    'File(s) already exist in the destination scope and will not be included in the copy. When you click Copy, the remaining file(s) will be copied.',
  allFilesExist: 'All file(s) already exist in the destination scope. No file(s) will be copied.',
}

export const useCopyFilesModal = ({
  sourceScopes,
  selectedIds,
  onSuccess,
}: {
  sourceScopes: ServerScope[]
  selectedIds: number[]
  onSuccess?: () => void
}) => {
  const { isShown, setShowModal } = useModal()
  const [selectedFolderId, setSelectedFolderId] = useState<number | undefined>(undefined)
  const [selectedScope, setSelectedScope] = useState<ServerScope | null>(null)
  const [copyMessage, setCopyMessage] = useState<string>('')
  const [isDisableCopy, setIsDisableCopy] = useState<boolean>(true)
  const [copyIds, setCopyIds] = useState<Set<number>>(new Set())
  const [copyFiles, setCopyFiles] = useState<SelectedNode[]>([])
  const [uids, setUids] = useState<string[]>([])
  const {
    data: selectedFiles = [],
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: ['copyingFiles', selectedIds],
    queryFn: () => fetchSelectedFiles(selectedIds),
    enabled: isShown,
  })

  useEffect(() => {
    if (isSuccess && selectedFiles) {
      const newUids = [] as string[]
      selectedFiles.forEach((nodes: SelectedNode) => {
        if (nodes.type === 'UserFile') {
          newUids.push(nodes.uid)
        } else {
          newUids.push(...nodes.children.map((c: ISelectedFile) => c.uid))
        }
      })
      setUids(newUids)
      setCopyFiles(JSON.parse(JSON.stringify(selectedFiles)))
    }
  }, [selectedFiles])

  useEffect(() => {
    if (!isShown) {
      setCopyIds(new Set())
      setCopyMessage('')
      setSelectedFolderId(undefined)
      setCopyFiles(selectedFiles)
    }
  }, [isShown])

  useEffect(() => {
    if (!uids.length) return
    if (!selectedScope) {
      setSelectedFolderId(undefined)
      setCopyMessage('')
      setCopyFiles(JSON.parse(JSON.stringify(selectedFiles)))
      setCopyIds(new Set())
      setIsDisableCopy(true)
      return
    }

    validateCopyingFiles(uids, selectedScope as ServerScope).then((res: IExistingFileSet) => {
      const nodes = JSON.parse(JSON.stringify(copyFiles))
      const tmpCopyIds = new Set<number>()
      nodes.forEach((node: SelectedNode) => {
        if (node.type === 'UserFile') {
          if (!res[node.uid]) {
            node.isCopied = false
            tmpCopyIds.add(node.id)
          } else {
            node.isCopied = true
            node.targetScope = selectedScope
            node.targetUid = res[node.uid].uid
            node.targetScopePath = res[node.uid].targetScopePath
          }
        } else {
          let count = 0
          node.children.forEach((child: ISelectedFile) => {
            if (!res[child.uid]) {
              child.isCopied = false
            } else {
              count++
              child.isCopied = true
              child.targetScope = selectedScope
              child.targetUid = res[child.uid].uid
              child.targetScopePath = res[child.uid].targetScopePath
            }
          })
          if (count === node.children.length) {
            node.isCopied = true
          } else {
            node.isCopied = false
            tmpCopyIds.add(node.id)
          }
        }
      })
      setCopyFiles(nodes)
      if (tmpCopyIds.size === 0) {
        setCopyMessage(message.allFilesExist)
        setIsDisableCopy(true)
      } else if (Object.keys(res).length > 0 && tmpCopyIds.size <= selectedIds.length) {
        setCopyIds(tmpCopyIds)
        setCopyMessage(message.someFilesExist)
        setIsDisableCopy(false)
      } else if (tmpCopyIds.size > 0) {
        setCopyIds(tmpCopyIds)
        setCopyMessage('')
        setIsDisableCopy(false)
      }
    })
  }, [selectedScope])

  const mutation = useMutation({
    mutationKey: ['copy-to-space', 'files'],
    mutationFn: (space: string) => copyFilesRequest(space, Array.from(copyIds.values()), selectedFolderId),
    onSuccess: (res: unknown) => {
      if (onSuccess) onSuccess()
      setShowModal(false)
      displayPayloadMessage(res as Payload)
    },
    onError: (e: AxiosError<ApiErrorResponse>) => {
      const error = e?.response?.data?.error
      if (error?.message) {
        toastError(`${error?.type}: ${error?.message}`)
        return
      }
      toastError(error?.message)
    },
  })

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!selectedScope) return
    mutation.mutate(selectedScope)
  }

  const modalComp = (
    <ModalNext
      id="modal-files-validate-copied"
      data-testid="modal-files-validate-copied"
      headerText="Add Files To Space"
      isShown={isShown}
      hide={() => setShowModal(false)}
      variant="large"
    >
      <ModalHeaderTop headerText="Copy Files" hide={() => setShowModal(false)} />
      <div className={styles.modalContainer}>
        {/* Left Panel - Selected Items */}
        <div className={cn(styles.panel, styles.panelLeft)}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>Selected Items</div>
          </div>
          <div className={styles.scrollArea}>
            {isLoading && <div className={styles.loadingContainer}>Loading...</div>}
            {isSuccess && <CopyFileList nodes={copyFiles} />}
          </div>
          {copyMessage.length > 0 && <div className={styles.infoCallout}>{copyMessage}</div>}
        </div>

        {/* Right Panel - Destination Selection */}
        <ScopeAndFolderSelection
          sourceScopes={sourceScopes}
          onSelectFolder={setSelectedFolderId}
          onSelectScope={setSelectedScope}
        />
      </div>
      <Footer>
        <Button onClick={() => setShowModal(false)}>Cancel</Button>
        <Button data-variant="primary" type="button" disabled={isLoading || isDisableCopy} onClick={e => handleSubmit(e)}>
          Copy
        </Button>
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
