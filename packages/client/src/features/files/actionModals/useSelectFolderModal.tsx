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
import { TreeOnSelectInfo } from '../files.types'
import { findById } from '../file.utils'

type EnhancedDataNode = DataNode & {
  path: string
}

const OrganizeFiles = ({
  scope,
  onSelect,
}: {
  scope?: ServerScope
  onSelect: (selectedKeys: Key[], info: TreeOnSelectInfo) => void
}) => {
  const [treeData, setTreeData] = useImmer<DataNode[]>([{ key: 'ROOT', title: '/', children: []} as unknown as DataNode])

  return (
    <FileTree
      // @ts-expect-error not use
      onExpand={() => {}}
      loadData={async (node?: EnhancedDataNode) => {
        const nodes = await fetchFolderChildren({ scopes: scope ? [scope] : [], folderId: node?.key.toString(), types: ['Folder']})

        const parentPath = node?.path ?? ''

        const children = nodes.map(d => ({
          key: d.id.toString(),
          title: d.name,
          children: [],
          path: parentPath ? `${parentPath}/${d.name}` : `/${d.name}`,
        }))

        setTreeData(draft => {
          const folder = findById(draft, node?.key.toString() as React.Key)
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

export const useSelectFolderModal = ({
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
  const [selectedTargetInfo, setSelectedTargetInfo] = useState<TreeOnSelectInfo>()
  const [submitEnabled, setSubmitEnabled] = useState(false)

  const handleSelect = (selectedKey: string, selectedInfo: TreeOnSelectInfo) => {
    setSelectedTarget(selectedKey)
    setSelectedTargetInfo(selectedInfo)
    setSubmitEnabled(true)
  }

  const handleSubmit = () => {
    if (onHandleSubmit && selectedTarget && selectedTargetInfo) {
      onHandleSubmit(parseInt(selectedTarget, 10), selectedTargetInfo)
      setSubmitEnabled(false)
    }
  }

  const modalComp = (
    <ModalNext id="modal-select-folder" data-testid="modal-select-folder" hide={() => setShowModal(false)} isShown={isShown}>
      <ModalHeaderTop disableClose={false} headerText={headerText} hide={() => setShowModal(false)} />
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
          <Button type="button" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button data-variant="primary" type="submit" onClick={handleSubmit} disabled={!submitEnabled}>
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
