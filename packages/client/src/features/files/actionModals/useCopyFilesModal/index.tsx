import { useMutation, useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { FileCheckIcon } from '@/components/icons/FileCheckIcon'
import { FileIcon } from '@/components/icons/FileIcon'
import { FolderOpenIcon } from '@/components/icons/FolderOpenIcon'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { cn } from '@/utils/cn'
import type { ApiErrorResponse, HomeScope, ServerScope } from '../../../home/types'
import { getBasePathFromScope } from '../../../home/utils'
import { useModal } from '../../../modal/useModal'
import type { EditableSpace } from '../../../spaces/spaces.api'
import { copyFilesRequest, fetchSelectedFiles, validateCopyingFiles } from '../../files.api'
import type { IExistingFileSet, ISelectedFile, ISelectedFolder, SelectedNode } from '../../files.types'
import { ScopeAndFolderSelection } from './ScopeAndFolderSelection'

interface FileListItemContentProps {
  file: ISelectedFile
}

const getFileLocationPath = (path: string | undefined, fileName: string): string => {
  if (!path) return ''
  const normalizedPath = path.replace(/\/+$/, '')
  const suffix = `/${fileName}`
  if (normalizedPath.endsWith(suffix)) {
    return normalizedPath.slice(0, -suffix.length) || '/'
  }
  return normalizedPath
}

const FileListItemContent = ({ file }: FileListItemContentProps): React.ReactElement => {
  const [searchParams] = useSearchParams()
  const homeScope = searchParams.get('scope') as HomeScope
  const currentPath = window.location.pathname
  const pathWithScope = homeScope ? `${currentPath}?scope=${homeScope}` : `${currentPath}?scope=me`
  let folderQ = ''
  if (file.sourceFolderId) {
    folderQ = `&folderId=${file.sourceFolderId}`
  }
  const sourceLocationPath = getFileLocationPath(file.sourceScopePath, file.name)
  const targetLocationPath = getFileLocationPath(file.targetScopePath, file.name)

  return (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <a
          href={`${currentPath}/${file.uid}`}
          target="_blank"
          rel="noopener noreferrer"
          className={itemLinkClass}
          title={file.name}
        >
          <span className="-mt-1 inline-block align-middle">
            <FileIcon width={14} height={14} />
          </span>{' '}
          <span>{file.name}</span>
        </a>
      </div>
      <div className="flex flex-col gap-1">
        <a
          href={`${pathWithScope}${folderQ}`}
          target="_blank"
          rel="noopener noreferrer"
          className={metadataLinkClass}
          title={sourceLocationPath}
        >
          <span className="truncate">{sourceLocationPath}</span>
        </a>
        {file.isCopied && (
          <a
            href={`${getBasePathFromScope(file.targetScope)}/files/${file.targetUid}`}
            target="_blank"
            rel="noopener noreferrer"
            className={metadataLinkClass}
            title={targetLocationPath}
          >
            <span className="flex size-3.5 shrink-0 items-center justify-center text-success">
              <FileCheckIcon width={14} />
            </span>
            <span className="truncate">{targetLocationPath}</span>
          </a>
        )}
      </div>
    </>
  )
}
interface SelectedFileProps {
  file: ISelectedFile
}

const SelectedFile = ({ file }: SelectedFileProps): React.ReactElement => {
  return (
    <li
      className={cn(
        'flex flex-col gap-1 rounded-md border border-border bg-background p-2 transition-colors',
        file.isCopied && 'border-success/30 bg-success/10 dark:border-success/40 dark:bg-success/15',
      )}
    >
      <FileListItemContent file={file} />
    </li>
  )
}

interface SelectedFolderProps {
  folder: ISelectedFolder
}

const SelectedFolder = ({ folder }: SelectedFolderProps): React.ReactElement => {
  const [searchParams] = useSearchParams()
  const homeScope = searchParams.get('scope') as HomeScope
  const currentPath = window.location.pathname
  const pathWithScope = homeScope ? `${currentPath}?scope=${homeScope}&` : `${currentPath}?`

  return (
    <li
      className={cn(
        'overflow-hidden rounded-md border border-border bg-background transition-colors',
        folder.isCopied && 'border-success/30 bg-success/10 dark:border-success/40 dark:bg-success/15',
      )}
    >
      <div
        className={cn(
          'flex min-w-0 items-center gap-2 border-b border-border bg-muted/30 px-2 py-1.5',
          folder.isCopied && 'border-success/30 bg-success/15 dark:border-success/40 dark:bg-success/20',
        )}
      >
        <a
          href={`${pathWithScope}folderId=${folder.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold text-foreground no-underline hover:underline"
          title={folder.name}
        >
          <span className="inline-flex size-4 shrink-0 items-center justify-center">
            <FolderOpenIcon width={16} />
          </span>
          <span className="min-w-0 max-w-full break-all whitespace-normal">{folder.name}</span>
        </a>
      </div>
      <ul className="m-0 list-none p-0">
        {folder.children.map((child: ISelectedFile) => (
          <li
            key={child.id}
            className={cn(
              'flex flex-col gap-1 border-b border-border px-2 py-1.5 pl-6 last:border-b-0',
              !folder.isCopied && child.isCopied && 'bg-success/10 dark:bg-success/15',
            )}
          >
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

const CopyFileList = ({ nodes }: CopyFileListProps): React.ReactElement => {
  return (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
      {nodes.map((node: SelectedNode) => {
        return node.type === 'UserFile' ? (
          <SelectedFile key={node.id} file={node} />
        ) : (
          <SelectedFolder key={node.id} folder={node} />
        )
      })}
    </ul>
  )
}

const message = {
  someFilesExist:
    'File(s) already exist in the destination scope and will not be included in the copy. When you click Copy, the remaining file(s) will be copied.',
  allFilesExist: 'All file(s) already exist in the destination scope. No file(s) will be copied.',
}

const panelLeftClass = cn(
  'flex h-full w-full min-h-0 min-w-0 flex-col overflow-hidden bg-background',
  'max-md:border-b max-md:border-border',
)

const scrollAreaClass = cn(
  'min-h-0 flex-1 overflow-auto p-1.5 [scrollbar-color:hsl(var(--muted-foreground)/0.35)_transparent] [scrollbar-width:thin]',
  '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/45 [&::-webkit-scrollbar-track]:bg-transparent',
)

const itemLinkClass =
  'block w-full max-w-full break-all whitespace-normal text-left text-sm font-medium !text-foreground/85 no-underline hover:!text-foreground/85 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

const metadataLinkClass =
  'inline-flex w-fit max-w-full min-w-0 items-center gap-1.5 rounded bg-muted/60 px-1.5 py-0.5 text-xs !text-muted-foreground no-underline hover:bg-muted hover:!text-foreground hover:underline dark:bg-muted/40 dark:hover:bg-muted/60'

export const useCopyFilesModal = ({
  sourceScopes,
  selectedIds,
  onSuccess,
  fixedTarget,
  headerText,
}: {
  sourceScopes: ServerScope[]
  selectedIds: number[]
  onSuccess?: () => void
  /** Locks the destination to this scope, skipping space selection (folder selection remains). */
  fixedTarget?: EditableSpace
  headerText?: string
}): { modalComp: React.ReactElement; setShowModal: (show: boolean) => void; isShown: boolean } => {
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
      // ScopeAndFolderSelection remounts on reopen and re-emits its scope; clearing
      // here guarantees the validation effect below re-runs even for a fixed target.
      setSelectedScope(null)
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
    // uids must be a dependency: with a fixed target the scope is set before the
    // selected-files fetch resolves, so validation has to re-run when uids arrive.
  }, [selectedScope, uids])

  const mutation = useMutation({
    mutationKey: ['copy-to-space', 'files'],
    mutationFn: (space: string) => copyFilesRequest(space, Array.from(copyIds.values()), selectedFolderId),
    onSuccess: () => {
      if (onSuccess) onSuccess()
      setShowModal(false)
      toastSuccess('Copying has started')
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

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    if (!selectedScope) return
    mutation.mutate(selectedScope)
  }

  const selectedItemsPanel = (
    <div className={panelLeftClass}>
      <div className="sticky top-0 z-10 shrink-0 border-b border-border bg-muted/30 px-3 py-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Selected Items</div>
      </div>
      <div className={scrollAreaClass}>
        {isLoading && (
          <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">Loading...</div>
        )}
        {isSuccess && <CopyFileList nodes={copyFiles} />}
      </div>
      {copyMessage.length > 0 && (
        <div className="mx-1.5 mb-2 rounded-md border-l-4 border-primary bg-primary/10 px-3 py-2 text-xs leading-5 text-foreground dark:bg-primary/15">
          {copyMessage}
        </div>
      )}
    </div>
  )

  const destinationPanel = (
    <ScopeAndFolderSelection
      sourceScopes={sourceScopes}
      onSelectFolder={setSelectedFolderId}
      onSelectScope={setSelectedScope}
      fixedTarget={fixedTarget}
    />
  )

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent
        id="modal-files-validate-copied"
        data-testid="modal-files-validate-copied"
        variant="large"
        className="flex flex-col gap-0 overflow-hidden bg-background p-0"
      >
        <DialogHeader className="mx-0 flex-row items-center px-3 py-4 pr-10 sm:px-4 sm:pr-12">
          <DialogTitle>{headerText ?? 'Copy Files'}</DialogTitle>
        </DialogHeader>
        <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1 overflow-hidden bg-background">
          <ResizablePanel defaultSize="50%" minSize="20%" className="min-w-0">
            {selectedItemsPanel}
          </ResizablePanel>
          <ResizableHandle aria-label="Resize panels" />
          <ResizablePanel defaultSize="50%" minSize="20%" className="min-w-0">
            {destinationPanel}
          </ResizablePanel>
        </ResizablePanelGroup>
        <DialogFooter className="mx-0 shrink-0 border-t px-4 py-3">
          <Button variant="outline" onClick={(): void => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isLoading || isDisableCopy}
            onClick={(e: React.MouseEvent<HTMLButtonElement>): void => handleSubmit(e)}
          >
            Copy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
