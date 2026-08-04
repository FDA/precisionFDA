import type { JSX } from 'react'
import { Button } from '@/components/ui/button'
import { pluralize } from '@/utils/formatting'
import { useSelectFileModal } from '../files/actionModals/useSelectFileModal'
import type { IFile } from '../files/files.types'
import type { DialogType, ScopeContext } from '../home/types'

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

  const hasSelection = !!value && Array.isArray(value) && value.length > 0

  return (
    <>
      {modalComp}
      <div className="flex flex-wrap items-center justify-start gap-1">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={isError || undefined}
          onClick={evt => {
            evt.preventDefault()
            showModalResetState()
          }}
        >
          {hasSelection ? `${value.length} ${pluralize('File', value.length)} Selected` : 'Select file...'}
        </Button>
        {hasSelection ? (
          <Button type="button" variant="outline" onClick={clear} disabled={disabled}>
            Clear
          </Button>
        ) : null}
      </div>
    </>
  )
}
