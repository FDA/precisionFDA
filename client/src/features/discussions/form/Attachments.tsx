import React from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { Button } from '../../../components/Button'
import Dropdown from '../../../components/Dropdown'
import { ActionsDropdownContent } from '../../home/ActionDropdownContent'
import { useSelectAppModal } from '../../home/apps/actionsModals/useSelectAppModal'
import { IApp } from '../../home/apps/apps.types'
import { useSelectAssetModal } from '../../home/assets/actionModals/useSelectAssetModal'
import { IAsset } from '../../home/assets/assets.types'
import { useSelectComparisonModal } from '../../home/comparisons/actionModals/useSelectComparisonModal'
import { IComparison } from '../../home/comparisons/comparisons.types'
import { IAccessibleFile } from '../../home/databases/databases.api'
import { IJob } from '../../home/executions/executions.types'
import { useSelectFileModal } from '../../home/files/actionModals/useSelectFileModal'
import { Attachment, AttachmentType, NoteForm } from '../discussions.types'
import { typeAttachmentKey } from '../helpers'
import { useSelectJobModal } from '../../home/executions/actionModals/useSelectJobModal'

export function Attachments({
  setValue,
  scope,
}: {
  setValue: UseFormSetValue<NoteForm>
  scope: string
}) {
  const onChangeHandler = (
    type: AttachmentType,
    v?: IAccessibleFile[] | IAsset[] | IApp[] | IJob[] | IComparison[],
  ) => {
    if (visualViewport) {
      const newFileAttachments: Attachment[] = []
      v.forEach(f => {
        newFileAttachments.push({
          id: f.id,
          uid: f.uid,
          type,
          name: f.title,
        })
      })
      const k = typeAttachmentKey[type]
      setValue(`attachments.${k}`, newFileAttachments)
    }
  }

  const { modalComp: filesModalComp, setShowModal: setFilesShowModal } =
    useSelectFileModal(
      'Select Files',
      'checkbox',
      v => onChangeHandler('UserFile', v),
      '',
      [scope, 'public'],
    )

  const { modalComp: appsModalComp, setShowModal: setAppsShowModal } =
    useSelectAppModal(
      'Select Apps',
      'checkbox',
      v => onChangeHandler('App', v),
      '',
      [scope, 'public'],
    )

  const { modalComp: assetsModalComp, setShowModal: setAssetsShowModal } =
    useSelectAssetModal(
      'Select Assets',
      'checkbox',
      v => onChangeHandler('Asset', v),
      '',
      [scope, 'public'],
    )

  const {
    modalComp: comparisonsModalComp,
    setShowModal: setComparisonsShowModal,
  } = useSelectComparisonModal(
    'Select Comparisons',
    'checkbox',
    v => onChangeHandler('Comparison', v),
    '',
    [scope, 'public'],
  )

  const { modalComp: jobModalComp, setShowModal: setJobShowModal } =
    useSelectJobModal(
      'Select Jobs',
      'checkbox',
      v => onChangeHandler('Job', v),
      '',
      [scope, 'public'],
    )

  return (
    <>
      {filesModalComp}
      {appsModalComp}
      {assetsModalComp}
      {comparisonsModalComp}
      {jobModalComp}
      <Dropdown
        trigger="click"
        content={
          <ActionsDropdownContent
            actions={{
              Files: {
                func: () => setFilesShowModal(true),
                isDisabled: false,
              },
              Apps: {
                func: () => setAppsShowModal(true),
                isDisabled: false,
              },
              Assets: {
                func: () => setAssetsShowModal(true),
                isDisabled: false,
              },
              Comparisons: {
                func: () => setComparisonsShowModal(true),
                isDisabled: false,
              },
              Jobs: {
                func: () => setJobShowModal(true),
                isDisabled: false,
              },
            }}
          />
        }
      >
        {dropdownProps => (
          <Button
            type="button"
            {...dropdownProps}
            data-testid="admin-users-resource-button"
            active={dropdownProps.isActive}
          >
            Select Attachment
          </Button>
        )}
      </Dropdown>
    </>
  )
}
