import { Key } from 'rc-tree/lib/interface'
import React, { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { useImmer } from 'use-immer'
import { Button, ButtonSolidBlue } from '../../../../components/Button'
import { displayPayloadMessage } from '../../../../utils/api'
import { Modal } from '../../../modal'
import { useModal } from '../../../modal/useModal'
import { ResourceScope } from '../../types'
import { fetchFolderChildren, moveFilesRequest } from '../files.api'
import { IFile } from '../files.types'
import { FileTree } from '../FileTree'

function findById(tree: any[], nodeId: string): any {
  // eslint-disable-next-line no-restricted-syntax
  for (const node of tree) {
    if (node.key === nodeId) return node
    if (node.children) {
      const desiredNode = findById(node.children, nodeId)
      if (desiredNode) return desiredNode
    }
  }
  return false
}

const OrganizeFiles = ({
  scope,
  spaceId,
  onSelect,
}: {
  scope?: ResourceScope
  spaceId?: string,
  onSelect: (folerId: Key[]) => void
}) => {
  const [treeData, setTreeData] = useImmer<any>([
    { key: 'ROOT', title: '/', children: []},
  ])

  return (
    <FileTree
      onExpand={d => {}}
      loadData={async node => {
        const { nodes } = await fetchFolderChildren(scope === 'me' ? 'private' : 'public', spaceId, node.key.toString())
        const children = nodes
          .filter((e: any) => e.type === 'Folder')
          .map((d: any) => ({
            key: d.id.toString(),
            title: d.name,
            children: [],
          }))

        setTreeData((draft: any) => {
          const folder = findById(draft, node.key.toString())
          if (folder) {
            folder.children = children
          }
        })
      }}
      treeData={treeData}
      onSelect={onSelect}
    />
  )
}

const StyledForm = styled.form`
  padding: 1rem;
`

export const useOrganizeFileModal = ({
  selected,
  scope,
  spaceId,
  onSuccess,
}: {
  selected: IFile[]
  scope?: ResourceScope
  spaceId?: string
  onSuccess?: () => void
}) => {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useModal()
  const selectedIds = selected.map(f => f.id)
  const mutation = useMutation({
    mutationFn: (target: string) =>
      moveFilesRequest(selectedIds, target, scope, spaceId),
    onSuccess: (res) => {
      queryClient.invalidateQueries('files')
      setShowModal(false)
      if(onSuccess) onSuccess()
      displayPayloadMessage(res)
    },
    onError: () => {
      toast.error('Error: Moving files')
    },
  })
  const momoSelected = useMemo(() => selected, [isShown])
  const [selectedTarget, setSelectedTarget] = useState<string>()

  const handleSelect = (f: string) => {
    setSelectedTarget(f)
  }

  const handleSubmit = () => {
    if (selectedTarget) {
      mutation.mutateAsync(selectedTarget)
    }
  }

  const modalComp = (
    <Modal
      data-testid="modal-files-organize"
      headerText={`Move ${momoSelected.length} items(s)`}
      isShown={isShown}
      hide={() => setShowModal(false)}
      footer={
        <>
          <Button type="button" onClick={() => setShowModal(false)} disabled={mutation.isLoading}>
            Cancel
          </Button>
          <ButtonSolidBlue type="submit" onClick={handleSubmit} disabled={mutation.isLoading || !selectedTarget}>
            Move
          </ButtonSolidBlue>
        </>
      }
    >
      <StyledForm as="div">
        <OrganizeFiles
          spaceId={spaceId}
          scope={scope}
          onSelect={s => {
            handleSelect(s[0]?.toString())
          }}
        />
      </StyledForm>
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
