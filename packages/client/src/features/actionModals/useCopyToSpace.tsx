import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type React from 'react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/Button'
import { InputText } from '@/components/InputText'
import { Loader } from '@/components/Loader'
import { toastError } from '@/components/NotificationCenter/ToastHelper'
import { APP_REVISION_CREATION_NOT_REQUESTED, APP_SERIES_CREATION_NOT_REQUESTED } from '@/constants'
import { CONFIRM_APP_REVISION, CONFIRM_APP_SERIES } from '@/constants/consts'
import { displayPayloadMessage, type Payload } from '@/utils/api'
import { useConfirmModal } from '../files/actionModals/useConfirmModal'
import type { APIResource, ApiErrorResponse, ApiResponse } from '../home/types'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { SpaceSelectionList } from '../spaces/SpaceSelectionList'
import { ModalSearchBar } from './styles'

export interface CopyToSpaceProperties {
  createAppRevision?: boolean
  createAppSeries?: boolean
  [key: string]: unknown
}

const SpacesList = ({
  selected,
  spaceId,
  onSelect,
}: {
  selected?: string
  spaceId?: string
  onSelect: (scope: string) => void
}): React.ReactElement => {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const excludeScopes = spaceId ? [`space-${spaceId}`] : []

  return (
    <>
      <ModalSearchBar>
        <InputText
          placeholder={'Search space...'}
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
        />
        <Button type="button" onClick={(): void => setSearchQuery('')}>
          Clear
        </Button>
      </ModalSearchBar>
      <SpaceSelectionList
        excludeScopes={excludeScopes}
        filterString={searchQuery}
        selectedScope={selected}
        onSelect={space => onSelect(space.scope)}
      />
    </>
  )
}

const CopyToSpaceForm = ({
  resource,
  selected,
  spaceId,
  updateFunction,
  setShowModal,
  onSuccess,
}: {
  resource: APIResource
  selected: string[]
  spaceId?: number
  setShowModal: (show: boolean) => void
  updateFunction: (space: string, ids: string[], properties?: CopyToSpaceProperties) => Promise<ApiResponse>
  onSuccess: (res: ApiResponse) => void
}): React.ReactElement => {
  const [selectedTarget, setSelectedTarget] = useState<string>()

  const mutation = useMutation({
    mutationKey: ['copy-to-space', resource],
    mutationFn: ({ space, properties }: { space: string; properties?: CopyToSpaceProperties }) =>
      updateFunction(space, selected, properties),
    onSuccess: res => {
      if (onSuccess) onSuccess(res)
      setShowModal(false)
      displayPayloadMessage(res as Payload)
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      const code = err.response?.data?.error?.code
      if (code === APP_SERIES_CREATION_NOT_REQUESTED) {
        setShowAppSeriesConfirmModal(true)
      } else if (code === APP_REVISION_CREATION_NOT_REQUESTED) {
        setShowAppRevisionConfirmModal(true)
      } else {
        const message = err.response?.data?.error?.message || err.message || 'Unknown error'
        toastError(message)
      }
    },
  })

  const { modalComp: appRevisionConfirmModal, setShowModal: setShowAppRevisionConfirmModal } = useConfirmModal(
    'Confirm',
    CONFIRM_APP_REVISION,
    async () => {
      setShowAppRevisionConfirmModal(false)
      await mutation.mutateAsync({
        space: selectedTarget!,
        properties: { createAppRevision: true },
      })
    },
  )

  const { modalComp: appSeriesConfirmModal, setShowModal: setShowAppSeriesConfirmModal } = useConfirmModal(
    'Confirm',
    CONFIRM_APP_SERIES,
    async () => {
      setShowAppSeriesConfirmModal(false)
      await mutation.mutateAsync({
        space: selectedTarget!,
        properties: { createAppSeries: true },
      })
    },
  )

  const handleSelect = (f: string): void => {
    if (f === selectedTarget) {
      setSelectedTarget(undefined)
    } else {
      setSelectedTarget(f)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (selectedTarget) {
      mutation.mutateAsync({ space: selectedTarget })
    }
  }
  return (
    <>
      <ModalScroll>
        <form className="p-4" id="copy-to-space-form" onSubmit={handleSubmit}>
          <SpacesList selected={selectedTarget} spaceId={spaceId?.toString()} onSelect={handleSelect} />
        </form>
      </ModalScroll>
      <Footer>
        <ButtonRow>
          {mutation.isPending && <Loader height={14} />}
          <Button onClick={() => setShowModal(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            data-variant="primary"
            type="submit"
            form="copy-to-space-form"
            disabled={!selectedTarget || mutation.isPending}
          >
            Copy
          </Button>
        </ButtonRow>
      </Footer>
      {appSeriesConfirmModal}
      {appRevisionConfirmModal}
    </>
  )
}

export function useCopyToSpaceModal<T extends { id: string | number }>({
  resource,
  selected,
  spaceId,
  updateFunction,
  onSuccess,
}: {
  resource: APIResource
  selected: T[]
  spaceId?: number
  updateFunction: (space: string, ids: string[], properties?: CopyToSpaceProperties) => Promise<ApiResponse>
  onSuccess: (res: ApiResponse) => void
}): {
  modalComp: React.ReactElement
  setShowModal: (show: boolean) => void
  isShown: boolean
} {
  const { isShown, setShowModal } = useModal()
  const momoSelected = useMemo(() => selected, [selected])

  const modalComp = (
    <ModalNext
      id={`modal-${resource}-copytospace`}
      data-testid={`modal-${resource}-copytospace`}
      isShown={isShown}
      hide={(): void => setShowModal(false)}
    >
      <ModalHeaderTop
        disableClose={false}
        headerText={`Copy to space: ${momoSelected.length} item${momoSelected.length > 1 ? 's' : ''}`}
        hide={(): void => setShowModal(false)}
      />
      <CopyToSpaceForm
        updateFunction={updateFunction}
        resource={resource}
        selected={selected.map(s => s.id.toString())}
        spaceId={spaceId}
        setShowModal={setShowModal}
        onSuccess={onSuccess}
      />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
