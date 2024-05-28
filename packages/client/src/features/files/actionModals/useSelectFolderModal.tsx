import React, { useState } from 'react'
import { useImmer } from 'use-immer'
import { Button } from '../../../components/Button'
import { getSpaceIdFromScope } from '../../../utils'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import {
  ButtonBadge,
  StyledSubtitle,
} from '../../actionModals/styles'
import { ServerScope } from '../../home/types'
import { fetchFolderChildren } from '../files.api'
import { FileTree } from '../FileTree'

interface SelectorProps {
  scopes: string[]
  setShowModal: (show: boolean) => void
  handleSelect: (folders: Selected[]) => void
}

type Selected = {
  title: string,
  id: number,
  scope: ServerScope,
}

const FolderSelector = ({
  scopes,
  setShowModal,
  handleSelect,
}: SelectorProps) => {
  const [selectedFolders, setSelectedFolders] = useState<Selected[]>([])

  const spaceId = getSpaceIdFromScope(scopes[0] as ServerScope)

  function findById(tree: any[], nodeId: number): any {
    for (const node of tree) {
      if (node.key === nodeId) return node
      if (node.children) {
        const desiredNode = findById(node.children, nodeId)
        if (desiredNode) return desiredNode
      }
    }
    return false
  }

  const addFolder = (folders: Selected[]) => {
    setSelectedFolders(folders)
  }

  const handleSubmit = () => {
    handleSelect(selectedFolders)
    setShowModal(false)
  }


  const [treeData, setTreeData] = useImmer<any>([
    { key: 'ROOT', title: '/', children: [] },
  ])

  const onSelect = (_:never, details: any) => {
    const folders = details.selectedNodes.filter(n => n.key !== 'ROOT').map((node: any) => {
      return {
        title: node.title,
        id: node.key,
        scope: scopes[0],
      }
    })
    addFolder(folders)
  }

  const loadData = async (node:any) => {
    const { nodes } = await fetchFolderChildren(
      'public',
      spaceId,
      node.key.toString(),
    )

    const children = nodes
      .filter((e: any) => e.type === 'Folder')
      .map((d: any) => ({
        key: d.id,
        title: d.name,
        children: [],
        parent: node,
      }))
    setTreeData((draft: any) => {
      const folder = findById(draft, node.key)
      if (folder) {
        folder.children = children
      }
    })
  }

  return (
    <>
      <ModalScroll>
        {/* TODO: need to revisit types for FileTree and fix them. PFDA-5238 */}
        <FileTree
          onExpand={d => {}}
          loadData={loadData}
          treeData={treeData}
          onSelect={onSelect}
          multiple={true}
        />
      </ModalScroll>
      <Footer>
        <ButtonRow>
          <Button
            onClick={() => {
              setShowModal(false)
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={selectedFolders?.length === 0}
          >
            Select &nbsp;<ButtonBadge>{selectedFolders?.length}</ButtonBadge>
          </Button>
        </ButtonRow>
      </Footer>
    </>
  )
}

/**
 * Dialog for selecting folder(s). It allows user select multiple folders.
 *
 * @returns list of selected folders
 */
export const useSelectFolderModal = (
  title: string,
  handleSelect: (folders: Selected[]) => void,
  subtitle?: string,
  scopes?: string[],
) => {
  const { isShown, setShowModal } = useModal()

  const showModalResetState = () => {
    setShowModal(true)
  }

  const modalComp = isShown && (
    <ModalNext
      id="select-folder-modal"
      disableClose={false}
      headerText={title}
      hide={() => setShowModal(false)}
      isShown={isShown}
    >
      <ModalHeaderTop
        disableClose={false}
        headerText={title}
        hide={() => setShowModal(false)}
      />

      {subtitle && <StyledSubtitle>{subtitle}</StyledSubtitle>}
      <FolderSelector
        scopes={scopes || []}
        setShowModal={setShowModal}
        handleSelect={handleSelect}
      />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    showModalResetState,
    isShown,
  }
}