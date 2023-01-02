import React, { useState } from 'react'
import { ButtonGroup } from '../../../../components/Button/ButtonGroup'
import { ListedFile } from '../apps.types'
import { Button } from '../../../../components/Button'
import { DialogType, useSelectFileModal } from '../../files/actionModals/useSelectFileModal'

export const SelectFileInput = ({ value, onChange, dialogTitle, dialogSubtitle, scope, disabled }:
  { value?: ListedFile, onChange: (file: ListedFile | undefined) => void, dialogTitle: string, 
    dialogSubtitle?: string, scope?: string, disabled?: boolean }) => {
  const [selectedFile, setSelectedFile] = useState(value)

  const handleSelect = (selectedFiles: ListedFile[]) => {
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
    DialogType.RADIO,
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