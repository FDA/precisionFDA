import React from 'react'
import styled, { css } from 'styled-components'
import { Button } from '../../../components/Button'
import { ButtonGroup } from '../../../components/Button/ButtonGroup'
import { pluralize } from '../../../utils/formatting'
import {
  useSelectFileModal,
} from '../files/actionModals/useSelectFileModal'

import { theme } from '../../../styles/theme'
import { IAccessibleFile } from '../databases/databases.api'
import { DialogType } from '../types'

const FileButton = styled(Button)<{ isError?: boolean }>`
  margin-right: 4px;
  ${({ isError }) => isError && css`
    border-color: ${theme.colors.darkRed};
    color: ${theme.colors.darkRed};
    &:hover {
      border-color: ${theme.colors.darkRed};
      color: ${theme.colors.darkRed};
      background-color: ${theme.colors.stateFailedBackground};
    }
  `}
`

interface Props {
  dialogType?: DialogType
  value?: string[]
  onChange: (file?: IAccessibleFile[] | null) => void
  dialogTitle: string
  dialogSubtitle?: string
  scope?: string
  disabled?: boolean
  isError?: boolean
}

export const SelectMultiFileInput = ({
  value,
  onChange,
  dialogType = 'radio',
  dialogTitle,
  dialogSubtitle,
  scope,
  disabled,
  isError,
}: Props) => {

  const handleSelect = (sF: IAccessibleFile[]) => {
    onChange(sF)
  }

  const clear = () => {
    onChange(null)
  }

  const { modalComp, showModalResetState } = useSelectFileModal(
    dialogTitle,
    dialogType,
    handleSelect,
    dialogSubtitle,
    scope ? [scope] : [],
    value,
  )

  return (
    <>
      {modalComp}
      <ButtonGroup>
        <FileButton
          isError={isError}
          type="button"
          onClick={evt => {
            evt.preventDefault()
            showModalResetState()
          }}
          disabled={disabled}
        >
          {!!value && Array.isArray(value) && value.length > 0
            ? `${value.length} ${pluralize('File', value.length)} Selected`
            : 'Select file...'}
        </FileButton>
        {!!value && (
          <Button type="button" onClick={clear} disabled={disabled}>
            Clear
          </Button>
        )}
      </ButtonGroup>
    </>
  )
}
