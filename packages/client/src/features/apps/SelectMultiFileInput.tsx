import type { JSX } from 'react'
import styled, { css } from 'styled-components'
import { Button } from '../../components/Button'
import { theme } from '../../styles/theme'
import { pluralize } from '../../utils/formatting'
import { useSelectFileModal } from '../files/actionModals/useSelectFileModal'
import type { IFile } from '../files/files.types'
import type { DialogType, ScopeContext } from '../home/types'
import { ButtonRow } from '../modal/modal.styles'

const StyledButtonRow = styled(ButtonRow)`
  justify-content: flex-start;
  gap: 4px;
`

const FileButton = styled(Button)<{ $isError?: boolean }>`
  ${({ $isError }) =>
    $isError &&
    css`
    border-color: ${theme.colors.darkRed};
    color: ${theme.colors.darkRed};
    &:hover {
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
  onChange: (file?: IFile[] | null) => void
  dialogTitle: string
  dialogSubtitle?: string
  scopeContext?: ScopeContext
  disabled?: boolean
  isError?: boolean
}

export const SelectMultiFileInput = ({
  value,
  onChange,
  dialogType = 'radio',
  dialogTitle,
  scopeContext,
  disabled,
  isError,
}: Props): JSX.Element => {
  const handleSelect = (sF: IFile[]): void => {
    onChange(sF)
  }

  const clear = (): void => {
    onChange(null)
  }

  const { modalComp, showModalResetState } = useSelectFileModal(
    dialogTitle,
    dialogType,
    handleSelect,
    scopeContext,
    undefined,
    value,
    true,
  )

  return (
    <>
      {modalComp}
      <StyledButtonRow>
        <FileButton
          $isError={isError}
          type="button"
          onClick={(evt: React.MouseEvent<HTMLButtonElement>) => {
            evt.preventDefault()
            showModalResetState()
          }}
          disabled={disabled}
        >
          {value && Array.isArray(value) && value.length > 0
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
