import React from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { Button } from '../../../components/Button'
import Dropdown from '../../../components/Dropdown'
import { useSelectAppModal } from '../../apps/actionsModals/useSelectAppModal'
import { IApp } from '../../apps/apps.types'
import { useSelectAssetModal } from '../../assets/actionModals/useSelectAssetModal'
import { IAsset } from '../../assets/assets.types'
import { useSelectComparisonModal } from '../../comparisons/actionModals/useSelectComparisonModal'
import { IComparison } from '../../comparisons/comparisons.types'
import { IAccessibleFile } from '../../databases/databases.api'
import { useSelectJobModal } from '../../executions/actionModals/useSelectJobModal'
import { IJob } from '../../executions/executions.types'
import { useSelectFileModal } from '../../files/actionModals/useSelectFileModal'
import { useSelectFolderModal } from '../../files/actionModals/useSelectFolderModal'
import { IFolder, TreeOnSelectInfo } from '../../files/files.types'
import { ActionsDropdownContent } from '../../home/ActionDropdownContent'
import { Attachment, AttachmentType, FormAttachments, NoteForm } from '../discussions.types'
import { typeAttachmentKey } from '../helpers'
import { NoteScope } from '../api'

export function Attachments({
  setValue,
  scope,
  attachments,
}: {
  setValue: UseFormSetValue<NoteForm>
  scope: NoteScope
  attachments: FormAttachments
}) {
  const onChangeHandler = (
    type: AttachmentType,
    selected: IAccessibleFile[] | IFolder[] | IAsset[] | IApp[] | IJob[] | IComparison[],
  ) => {
    if (visualViewport) {
      const k = typeAttachmentKey[type]
      const newAttachments: Attachment[] = attachments[k] || []
      selected.forEach(attachment => {
        const isNew = newAttachments.every(newAtt => newAtt.id !== attachment.id)
        if (isNew) {
          newAttachments.push({
            id: attachment.id,
            type,
            name: attachment.title,
            scope: attachment.scope,
            link: '',
          })
        }
      })
      setValue(`attachments.${k}`, newAttachments)
    }
  }

  const { modalComp: filesModalComp, setShowModal: setFilesShowModal } = useSelectFileModal(
    'Select Files',
    'checkbox',
    v => onChangeHandler('UserFile', v),
    '',
    [scope, 'public'],
  )

  const { modalComp: foldersModalComp, setShowModal: setFoldersShowModal } = useSelectFolderModal({
    headerText: 'Select Folders',
    submitCaption: 'Select folder',
    scope,
    onHandleSubmit: (folderId, info: TreeOnSelectInfo) => {
      if (info.node.title !== '/') {
        onChangeHandler('Folder', [{ id: folderId, title: info.node.title } as unknown as IFolder])
        setFoldersShowModal(false)
      }
    },
  })

  const { modalComp: appsModalComp, setShowModal: setAppsShowModal } = useSelectAppModal(
    'Select Apps',
    'checkbox',
    v => onChangeHandler('App', v),
    '',
    [scope, 'public'],
  )

  const { modalComp: assetsModalComp, setShowModal: setAssetsShowModal } = useSelectAssetModal(
    'Select Assets',
    'checkbox',
    v => onChangeHandler('Asset', v),
    '',
    [scope, 'public'],
  )

  const { modalComp: comparisonsModalComp, setShowModal: setComparisonsShowModal } = useSelectComparisonModal(
    'Select Comparisons',
    'checkbox',
    v => onChangeHandler('Comparison', v),
    '',
    [scope, 'public'],
  )

  const { modalComp: jobModalComp, setShowModal: setJobShowModal } = useSelectJobModal(
    'Select Jobs',
    'checkbox',
    v => onChangeHandler('Job', v),
    '',
    [scope, 'public'],
  )

  return (
    <>
      {filesModalComp}
      {foldersModalComp}
      {appsModalComp}
      {assetsModalComp}
      {comparisonsModalComp}
      {jobModalComp}
      <Dropdown
        trigger="click"
        content={
          <ActionsDropdownContent
            actions={[
              {
                name: 'Files',
                type: 'modal',
                func: () => setFilesShowModal(true),
                isDisabled: false,
              },
              {
                name: 'Folders',
                type: 'modal',
                func: () => setFoldersShowModal(true),
                isDisabled: scope === 'public',
              },
              {
                name: 'Assets',
                type: 'modal',
                func: () => setAssetsShowModal(true),
                isDisabled: false,
              },
              {
                name: 'Apps',
                type: 'modal',
                func: () => setAppsShowModal(true),
                isDisabled: false,
              },
              {
                name: 'Jobs',
                type: 'modal',
                func: () => setJobShowModal(true),
                isDisabled: false,
              },
              {
                name: 'Comparisons',
                type: 'modal',
                func: () => setComparisonsShowModal(true),
                isDisabled: false,
              },
            ]}
          />
        }
      >
        {dropdownProps => (
          // @ts-expect-error ref not copatible with styled-components
          <Button type="button" {...dropdownProps} data-testid="admin-users-resource-button" active={`${dropdownProps.$isActive}`}>
            Select Attachment
          </Button>
        )}
      </Dropdown>
    </>
  )
}
