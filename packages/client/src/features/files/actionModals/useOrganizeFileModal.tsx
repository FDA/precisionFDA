import { DataNode, Key } from 'rc-tree/lib/interface'
import React, { useState } from 'react'
import styled from 'styled-components'
import { useImmer } from 'use-immer'
import { Button } from '../../../components/Button'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { ServerScope } from '../../home/types'
import { fetchFolderChildren } from '../files.api'
import { FileTree } from '../FileTree'
import { SPACE_PREFIX } from '../../../constants'
import { TreeOnSelectInfo } from '../files.types'
import { findById } from '../file.utils'

type EnhancedDataNode = DataNode &{
  path: string
}

const getSpaceId = (scope?: ServerScope): string | undefined => {
  if (scope?.startsWith(SPACE_PREFIX)) {
    return scope.substring(SPACE_PREFIX.length)
  }
  return undefined
}

const OrganizeFiles = ({
  scope,
  onSelect,
}: {
  scope?: ServerScope
  onSelect: (selectedKeys: Key[], info: TreeOnSelectInfo) => void,
}) => {
  const spaceId = getSpaceId(scope)
  const [treeData, setTreeData] = useImmer<DataNode[]>([
    { key: 'ROOT', title: '/', children: []} as unknown as DataNode,
  ])

  return (
    <FileTree
      onExpand={d => {}}
      loadData={async (node: EnhancedDataNode) => {
        const { nodes } = await fetchFolderChildren(
          scope === 'private' ? 'private' : 'public', // TODO fix this in fetchFolderChildren
          spaceId,
          node.key.toString(),
        )
        const children = nodes
          .filter((e) => e.type === 'Folder')
          .map((d) => ({
            key: d.id.toString(),
            title: d.name,
            children: [],
            parent: d.path[d.path.length-1],
            path: (node.path) ? `${node.path}/${d.name}`: `/${d.name}`,
          }))

        setTreeData((draft: DataNode[]) => {
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
  headerText,
  submitCaption,
  scope,
  onHandleSubmit,
}: {
  headerText: string
  submitCaption: string // submit button caption
  scope?: ServerScope
  onHandleSubmit?: (folderId: number, info: TreeOnSelectInfo) => void
}) => {
  const { isShown, setShowModal } = useModal()
  const [selectedTarget, setSelectedTarget] = useState<string>()
  const [selectedTargetInfo, setSelectedTargetInfo] = useState<any>()
  const [submitEnabled, setSubmitEnabled] = useState(false)

  const handleSelect = (selectedKey: string, selectedInfo: TreeOnSelectInfo) => {
    setSelectedTarget(selectedKey)
    setSelectedTargetInfo(selectedInfo)
    setSubmitEnabled(true)
  }

  const handleSubmit = () => {
    if (onHandleSubmit && selectedTarget) {
      onHandleSubmit(parseInt(selectedTarget, 10), selectedTargetInfo)
      setSubmitEnabled(false)
    }
  }

  const modalComp = (
    <ModalNext
      id="modal-files-organize"
      hide={() => setShowModal(false)}
      isShown={isShown}
      disableClose={false}
      data-testid="modal-files-organize"
    >
      <ModalHeaderTop
        disableClose={false}
        headerText={headerText}
        hide={() => setShowModal(false)}
      />
      <ModalScroll>
        <StyledForm as="div">
          <OrganizeFiles
            scope={scope}
            onSelect={(selectedKeys, info) => {
              handleSelect(selectedKeys[0]?.toString(), info)
            }}
          />
        </StyledForm>
      </ModalScroll>
      <Footer>
        <ButtonRow>
          <Button
            type="button"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
          <Button
            data-variant="primary"
            type="submit"
            onClick={handleSubmit}
            disabled={!submitEnabled}
          >
            {submitCaption}
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
