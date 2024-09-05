import React from 'react'
import styled, { css } from 'styled-components'
import { Button } from '../../components/Button'
import { pluralize } from '../../utils/formatting'
import {
  useSelectFileModal,
} from '../files/actionModals/useSelectFileModal'

import { theme } from '../../styles/theme'
import { IAccessibleFile } from '../databases/databases.api'
import { DialogType } from '../home/types'
import { ButtonRow } from '../modal/styles'

const StyledButtonRow = styled(ButtonRow)`
  justify-content: flex-start;
  gap: 4px;
`

const FileButton = styled(Button)<{ $isError?: boolean }>`
  ${({ $isError }) => $isError && css`
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
  scopes?: string[]
  disabled?: boolean
  isError?: boolean
}

export const SelectMultiFileInput = ({
  value,
  onChange,
  dialogType = 'radio',
  dialogTitle,
  dialogSubtitle,
  scopes,
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
    scopes,
    value,
  )

  return (
    <>
      {modalComp}
      <StyledButtonRow>
        <FileButton
          $isError={isError}
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
      </StyledButtonRow>
    </>
  )
}
