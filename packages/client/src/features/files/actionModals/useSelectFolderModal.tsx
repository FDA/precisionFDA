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
import { CustomDataNode, SelectionDetails } from '../files.types'
import { findById } from '../file.utils'

interface SelectorProps {
  scopes: string[]
  setShowModal: (show: boolean) => void
  handleSelect: (folders: CustomDataNode[]) => void
}

const FolderSelector = ({
  scopes,
  setShowModal,
  handleSelect,
}: SelectorProps) => {
  const [selectedFolders, setSelectedFolders] = useState<CustomDataNode[]>([])

  const spaceId = getSpaceIdFromScope(scopes[0] as ServerScope)

  const addFolder = (folders: CustomDataNode[]) => {
    setSelectedFolders(folders)
  }

  const handleSubmit = () => {
    handleSelect(selectedFolders)
    setShowModal(false)
  }

  const [treeData, setTreeData] = useImmer<CustomDataNode[]>([
    { key: 'ROOT', title: '/', children: []} as unknown as CustomDataNode,
  ])

  const onSelect = (_: never, details: SelectionDetails) => {
    const folders = details.selectedNodes
      .filter(n => n.key !== 'ROOT')
      .map(node => {
        return {
          title: node.title,
          id: node.key,
          scope: scopes[0],
        } as unknown as CustomDataNode
      })
    addFolder(folders)
  }

  const loadData = async (node: CustomDataNode) => {
    const { nodes } = await fetchFolderChildren(
      'public',
      spaceId,
      node.key.toString(),
    )

    const children = nodes
      .filter((e) => e.type === 'Folder')
      .map((d) => ({
        key: d.id,
        title: d.name,
        children: [],
        parent: d.path[d.path.length-1],
      } as CustomDataNode))
    setTreeData((draft: CustomDataNode[]) => {
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
          multiple
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
            data-variant="primary"
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
  handleSelect: (folders: CustomDataNode[]) => void,
  subtitle?: string,
  scopes?: string[],
) => {
  const { isShown, setShowModal } = useModal()

  const showModalResetState = () => {
    setShowModal(true)
  }

  const modalComp = (
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