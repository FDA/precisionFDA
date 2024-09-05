import { useMutation, useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Button } from '../../../../components/Button'
import { FileCheckIcon } from '../../../../components/icons/FileCheckIcon'
import { FileIcon } from '../../../../components/icons/FileIcon'
import { FolderOpenIcon } from '../../../../components/icons/FolderOpenIcon'
import { displayPayloadMessage } from '../../../../utils/api'
import { HomeScope, ServerScope } from '../../../home/types'
import { getBasePathFromScope } from '../../../home/utils'
import { ModalHeaderTop, ModalNext } from '../../../modal/ModalNext'
import { ButtonRow, Footer, ModalContentPadding } from '../../../modal/styles'
import { useModal } from '../../../modal/useModal'
import { copyFilesRequest, fetchSelectedFiles, validateCopyingFiles } from '../../files.api'
import { IExistingFileSet, ISelectedFile, ISelectedFolder, SelectedNode } from '../../files.types'
import { ScopeAndFolderSelection } from './ScopeAndFolderSelection'
import {
  CopyHelp,
  CopyModalPageCol,
  CopyModalPageRow,
  CopyModalScrollPlace,
  FileDetailItem,
  FileListItem,
  FolderChildrenList,
  FolderChildrenListItem,
  FolderHeading,
  FolderItem,
  NodeHeading,
  SelectedList,
  ShorternName,
  StyledCopyFileDetail,
  StyledFileDetailIcon,
  StyledStickyTop,
} from './styles'

const FileListItemContent = ({ file }: { file: ISelectedFile }) => {
  const [searchParams, _] = useSearchParams()
  const homeScope = searchParams.get('scope') as HomeScope
  const currentPath = window.location.pathname
  const pathWithScope = homeScope ? `${currentPath}?scope=${homeScope}` : `${currentPath}?scope=me`
  let folderQ = ''
  if (file.sourceFolderId) {
    folderQ = `&folder_id=${file.sourceFolderId}`
  }
  return (
    <>
      <NodeHeading href={`${currentPath}/${file.uid}`} target="_blank">
        <FileIcon width={16} />
        <ShorternName>{file.name}</ShorternName>
      </NodeHeading>
      <StyledCopyFileDetail>
        <FileDetailItem href={`${pathWithScope}${folderQ}`} target="_blank">
          <StyledFileDetailIcon>
            <FolderOpenIcon width={14} />
          </StyledFileDetailIcon>
          <ShorternName>{file.sourceScopePath}</ShorternName>
        </FileDetailItem>
      </StyledCopyFileDetail>
      {file.isCopied && (
        <StyledCopyFileDetail>
          <FileDetailItem href={`${getBasePathFromScope(file.targetScope)}/files/${file.targetUid}`} target="_blank">
            <StyledFileDetailIcon>
              <FileCheckIcon width={14} />
            </StyledFileDetailIcon>
            <ShorternName>{file.targetScopePath}</ShorternName>
          </FileDetailItem>
        </StyledCopyFileDetail>
      )}
    </>
  )
}

const SelectedFile = ({ file }: { file: ISelectedFile }) => {
  return (
    <FileListItem $isCopied={file.isCopied}>
      <FileListItemContent file={file} />
    </FileListItem>
  )
}

const SelectedFolder = ({ folder }: { folder: ISelectedFolder }) => {
  const [searchParams, _] = useSearchParams()
  const homeScope = searchParams.get('scope') as HomeScope
  const currentPath = window.location.pathname
  const pathWithScope = homeScope ? `${currentPath}?scope=${homeScope}&` : `${currentPath}?`
  return (
    <FolderItem $isCopied={folder.isCopied}>
      <FolderHeading href={`${pathWithScope}folder_id=${folder.id}`} target="_blank">
        <FolderOpenIcon width={16} />
        <ShorternName>{folder.name}</ShorternName>
      </FolderHeading>
      <FolderChildrenList>
        {folder.children.map((child: ISelectedFile, index: number) => (
          <FolderChildrenListItem key={index} $isCopied={!folder.isCopied && child.isCopied}>
            <FileListItemContent file={child} />
          </FolderChildrenListItem>
        ))}
      </FolderChildrenList>
    </FolderItem>
  )
}

const CopyFileList = ({ nodes }: { nodes: SelectedNode[] }) => {
  return (
    <SelectedList>
      {nodes.map((node: SelectedNode, index: number) => {
        return node.type === 'UserFile' ? <SelectedFile key={index} file={node} /> : <SelectedFolder key={index} folder={node} />
      })}
    </SelectedList>
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
    onSuccess: (res: any) => {
      if (onSuccess) onSuccess()
      setShowModal(false)
      displayPayloadMessage(res)
    },
    onError: (e: AxiosError) => {
      const error = e?.response?.data?.error
      if (error?.message) {
        toast.error(`${error?.type}: ${error?.message}`)
        return
      }
      toast.error(error.message)
    },
  })

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!selectedScope) return
    mutation.mutateAsync(selectedScope)
    setShowModal(false)
  }

  const modalComp = (
    <ModalNext
      id="modal-files-validate-copied"
      data-testid="modal-files-validate-copied"
      headerText="Add Files To Space"
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop headerText="Copy Files" hide={() => setShowModal(false)} />
      <CopyModalPageRow>
        <CopyModalPageCol>
          <CopyModalScrollPlace>
            <StyledStickyTop>Selected Item(s)</StyledStickyTop>
            {isLoading && <ModalContentPadding>Loading...</ModalContentPadding>}
            {isSuccess && <CopyFileList nodes={copyFiles} />}
          </CopyModalScrollPlace>
          {copyMessage.length > 0 && <CopyHelp>{copyMessage}</CopyHelp>}
        </CopyModalPageCol>
        <ScopeAndFolderSelection
          sourceScopes={sourceScopes}
          onSelectFolder={setSelectedFolderId}
          onSelectScope={setSelectedScope}
        />
      </CopyModalPageRow>
      <Footer>
        <ButtonRow>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button data-variant="primary" type="button" disabled={isLoading || isDisableCopy} onClick={e => handleSubmit(e)}>
            Copy
          </Button>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
