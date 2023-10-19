import React, { useState } from 'react'
import { ButtonGroup } from '../../../components/Button/ButtonGroup'
import { Button } from '../../../components/Button'
import { DialogType, useSelectFileModal } from '../files/actionModals/useSelectFileModal'
import { IAccessibleFile } from '../databases/databases.api'

export const SelectFileInput = ({ value, onChange, dialogType = 'radio', dialogTitle, dialogSubtitle, scope, disabled }:
  { value?: IAccessibleFile, onChange: (file: IAccessibleFile | undefined) => void, dialogType?: DialogType, dialogTitle: string,
    dialogSubtitle?: string, scope?: string, disabled?: boolean }) => {
  const [selectedFile, setSelectedFile] = useState(value)

  const handleSelect = (selectedFiles: IAccessibleFile[]) => {
    const selected = selectedFiles[0] // we care only about the first one
    onChange(selected)
    setSelectedFile(selected)
  }

  const clear = () => {
    onChange(undefined)
    setSelectedFile(undefined)
  }

  const { modalComp, showModalResetState } = useSelectFileModal(
    dialogTitle,
    dialogType,
    handleSelect,
    dialogSubtitle,
    scope)
  return (<>
    {modalComp}
    <ButtonGroup>
      <Button type="button" onClick={(evt) => {
        evt.preventDefault()
        showModalResetState()
      }} disabled={disabled}>
        {selectedFile?.title ?? 'Select file...'}
      </Button>
      {selectedFile &&
        <Button type="button" onClick={clear} disabled={disabled}>
          Clear
        </Button>}
    </ButtonGroup>
  </>)
}