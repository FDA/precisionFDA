import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { DataNode } from 'rc-tree/lib/interface'
import { useSearchParams } from 'react-router'
import { useImmer } from 'use-immer'
import { BackendError } from '@/api/types'
import { Button } from '@/components/Button'
import { toastError } from '@/components/NotificationCenter/ToastHelper'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer, StyledModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { findById } from '../file.utils'
import { copyFilesRequest, fetchFolderChildren } from '../files.api'
import { CustomDataNode, IFile } from '../files.types'
import { FileTree } from '../FileTree'

export const useCopyFilesToSpaceModal = ({ spaceId }: { spaceId?: string }) => {
  const [searchParams] = useSearchParams()
  const folderIdParam = searchParams.get('folder_id')
  const folderId = folderIdParam ? parseInt(folderIdParam, 10) : undefined

  const { isShown, setShowModal } = useModal()
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([])
  const [treeData, setTreeData] = useImmer<CustomDataNode[]>([
    { key: 'ROOT', title: '/', checkable: false, children: [] },
  ])
  const scope = spaceId ? `space-${spaceId}` : ''
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['copy-files-to-space-add'],
    mutationFn: () => copyFilesRequest(scope, selectedFileIds, folderId),
    onSuccess: () => {
      setShowModal(false)
    },
    onError: (e: AxiosError<BackendError>) => {
      if (e.response?.data?.error?.message) {
        toastError(`Error: ${e.response.data.error.message}`)
      } else {
        toastError('Error copying files to space')
      }
    },
  })

  const onFileCheck = (checkedKeys: string[]) => {
    const ids = checkedKeys.map(k => parseInt(k, 10)).filter(id => !isNaN(id))
    setSelectedFileIds(ids)
  }

  const loadData = async (node: DataNode) => {
    const nodes = await fetchFolderChildren({
      scopes: ['private', 'public'],
      folderId: node.key.toString(),
      types: ['UserFile', 'Folder'],
    })
    const children = nodes.map(
      (d): CustomDataNode => ({
        key: d.id.toString(),
        title: d.name,
        isLeaf: d.stiType !== 'Folder',
        uid: d.stiType === 'UserFile' ? (d as IFile).uid : '',
        checkable: d.stiType !== 'Folder',
      }),
    )

    setTreeData(draft => {
      const folder = findById(draft, node.key.toString())
      if (folder) {
        folder.children = children
      }
    })
  }

  const modalComp = (
    <ModalNext
      id="modal-files-add-to-space"
      data-testid="modal-files-add-to-space"
      headerText="Add Files To Space"
      isShown={isShown}
      hide={() => setShowModal(false)}
      variant="medium"
    >
      <ModalHeaderTop headerText="Add Files To Space" hide={() => setShowModal(false)} />
      <StyledModalScroll>
        <FileTree
          // @ts-expect-error not use
          onExpand={() => {}}
          loadData={loadData}
          checkable
          selectable={false}
          treeData={treeData}
          onCheck={onFileCheck}
        />
      </StyledModalScroll>
      <Footer>
        <ButtonRow>
          <Button type="button" onClick={() => setShowModal(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button data-variant="primary" type="submit" onClick={() => mutateAsync()} disabled={isPending}>
            Add
          </Button>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
  }
}
