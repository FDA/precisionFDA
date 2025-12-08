import { useMutation } from '@tanstack/react-query'
import { DataNode } from 'rc-tree/lib/interface'
import React, { useState } from 'react'
import { useSearchParams } from 'react-router'
import { useImmer } from 'use-immer'
import { Button } from '../../../components/Button'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer, StyledModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { addData } from '../../spaces/spaces.api'
import { fetchFolderChildren } from '../files.api'
import { FileTree } from '../FileTree'
import { findById } from '../file.utils'
import { CustomDataNode, IFile } from '../files.types'

export const useCopyFilesToSpaceModal = ({ spaceId }: { spaceId?: string }) => {
  const [searchParams] = useSearchParams()
  const folderId = searchParams.get('folder_id') ?? undefined

  const { isShown, setShowModal } = useModal()
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [treeData, setTreeData] = useImmer<CustomDataNode[]>([
    { key: 'ROOT', title: '/', checkable: false, children: []},
  ])
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['copy-files-to-space-add'],
    mutationFn: () =>
      addData({
        spaceId: spaceId || '',
        folderId: folderId || '',
        uids: selectedFiles,
      }),
    onSuccess: () => {
      setShowModal(false)
    },
  })

  const onFileCheck = (checkedKeys: string[]) => {
    const uids = checkedKeys
      .map(c => {
        const node: CustomDataNode | null = findById(treeData, c)
        return node?.uid
      })
      .filter(i => typeof i === 'string') as string[]
    setSelectedFiles(uids)
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
        uid: (d.stiType === 'UserFile') ? (d as IFile).uid : '',
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
      <ModalHeaderTop
        headerText="Add Files To Space"
        hide={() => setShowModal(false)}
      />
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
          <Button
            type="button"
            onClick={() => setShowModal(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            data-variant="primary"
            type="submit"
            onClick={() => mutateAsync()}
            disabled={isPending}
          >
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
