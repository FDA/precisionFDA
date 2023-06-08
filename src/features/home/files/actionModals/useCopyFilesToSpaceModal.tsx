import { DataNode } from 'rc-tree/lib/interface'
import React, { useState } from 'react'
import { useImmer } from 'use-immer'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useQueryParam } from 'use-query-params'
import { Button, ButtonSolidBlue } from '../../../../components/Button'
import { useModal } from '../../../modal/useModal'
import { fetchFolderChildren } from '../files.api'
import { FileTree } from '../FileTree'
import { addData } from '../../../spaces/spaces.api'
import { ModalHeaderTop, ModalNext } from '../../../modal/ModalNext'
import { ButtonRow, Content, Footer } from '../../../modal/styles'

interface CustomDataNode extends DataNode {
  uid?: string
}

function findById<T extends DataNode>(tree: T[], nodeId: string): T {
  // eslint-disable-next-line no-restricted-syntax
  for (const node of tree) {
    if (node.key === nodeId) return node
    if (node.children) {
      const desiredNode = findById(node.children, nodeId)
      if (desiredNode) return desiredNode as T
    }
  }
  // @ts-ignore
  return false
}

export const useCopyFilesToSpaceModal = ({ spaceId }: { spaceId?: string }) => {
  const queryClient = useQueryClient()
  const [folderId] = useQueryParam<string | undefined>('folder_id')
  const { isShown, setShowModal } = useModal()
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [treeData, setTreeData] = useImmer<CustomDataNode[]>([
    { key: 'ROOT', title: '/', checkable: false, children: []},
  ])
  const { mutateAsync, isLoading } = useMutation({
    mutationKey: ['copy-files-to-space-add'],
    mutationFn: () =>
      addData({
        spaceId: spaceId || '',
        folderId: folderId || '',
        uids: selectedFiles,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['files'])
      setShowModal(false)
    },
  })

  const onFileCheck = (checkedKeys: string[]) => {
    const uids = checkedKeys
      .map(c => findById(treeData, c).uid)
      .filter(i => typeof i === 'string') as string[]
    setSelectedFiles(uids)
  }

  const loadData = async (node: any) => {
    const { nodes } = await fetchFolderChildren(
      undefined,
      undefined,
      node.key.toString(),
    )
    const children = nodes.map(
      (d): CustomDataNode => ({
        key: d.id.toString(),
        title: d.name,
        isLeaf: d.type !== 'Folder',
        uid: d.uid,
        checkable: d.type !== 'Folder',
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
      data-testid="modal-files-add-to-space"
      headerText="Add Files To Space"
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        headerText="Add Files To Space"
        hide={() => setShowModal(false)}
      />
      <Content overflowContent={false}>
        <FileTree
          onExpand={() => {}}
          loadData={loadData}
          checkable
          selectable={false}
          treeData={treeData}
          onCheck={onFileCheck as any}
        />
      </Content>
      <Footer>
        <ButtonRow>
          <Button
            type="button"
            onClick={() => setShowModal(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <ButtonSolidBlue
            type="submit"
            onClick={() => mutateAsync()}
            disabled={isLoading}
          >
            Add
          </ButtonSolidBlue>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
  }
}
