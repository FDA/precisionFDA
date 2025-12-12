import { useMutation } from '@tanstack/react-query'
import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { FieldGroup } from '../../components/form/styles'
import { InputText } from '../../components/InputText'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { APIResource } from '../home/types'
import { Button } from '../../components/Button'
import axios from 'axios'
import { toastError } from '../../components/NotificationCenter/ToastHelper'

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
`

const StyledSubtext = styled.div`
  font-size: 12px;
  color: var(--c-text-500);
`

async function editTagsRequest({ uid, tags }: { uid: string; tags: string }) {
  const response = await axios.post('/api/set_tags', {
    taggable_uid: uid,
    tags,
  })
  return response.data
}

type FormInputs = {
  tags: string
}

const EditTagsForm = ({
  resource,
  onSuccess,
  uid,
  hideModal,
  tags,
}: {
  resource: APIResource
  uid: string
  tags: string[]
  onSuccess?: (res: unknown) => void
  hideModal: () => void
}) => {
  const { register, handleSubmit, setFocus } = useForm<FormInputs>({
    defaultValues: {
      tags: tags.join(', '),
    },
  })

  React.useEffect(() => {
    setFocus('tags')
  }, [setFocus])

  const mutation = useMutation({
    mutationKey: ['edit-resource-tags', resource],
    mutationFn: (t: string) => editTagsRequest({ uid, tags: t }),
    onSuccess: res => {
      if (onSuccess) onSuccess(res)
      hideModal()
      toastSuccess(`Successfully edited ${resource} tags`)
    },
    onError: () => {
      toastError(`Error: editing ${resource} tags`)
    },
  })

  const onSubmit = ({ tags: t }: FormInputs) => {
    mutation.mutate(t)
  }

  return (
    <>
      <StyledForm id="edit-tag-form" onSubmit={handleSubmit(onSubmit)}>
        <StyledSubtext>Tags are public to the community</StyledSubtext>
        <FieldGroup>
          <label>Tags (comma-separated)</label>
          <InputText {...register('tags')} disabled={mutation.isPending} />
        </FieldGroup>
      </StyledForm>
      <Footer>
        <ButtonRow>
          <Button type="button" onClick={hideModal} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button data-variant="primary" type="submit" form="edit-tag-form" disabled={mutation.isPending}>
            Edit Tags
          </Button>
        </ButtonRow>
      </Footer>
    </>
  )
}

export function useEditTagsModal<T extends { uid: string; name: string; tags: string[] }>({
  resource,
  selected,
  onSuccess,
}: {
  resource: APIResource
  selected: T
  onSuccess?: (res: unknown) => void
}) {
  const { isShown, setShowModal } = useModal()
  const mSelected = useMemo(() => selected, [selected])
  const hideModal = () => setShowModal(false)

  const modalComp = (
    <ModalNext id="edit-tags-modal" data-testid={`modal-${resource}-edit-tags`} isShown={isShown} hide={hideModal}>
      <ModalHeaderTop disableClose={false} headerText={`Edit tags for ${mSelected?.name}`} hide={hideModal} />
      <EditTagsForm resource={resource} onSuccess={onSuccess} uid={mSelected?.uid} hideModal={hideModal} tags={mSelected?.tags} />
    </ModalNext>
  )

  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
