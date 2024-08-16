import { useMutation } from '@tanstack/react-query'
import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { FieldGroup } from '../../components/form/styles'
import { InputText } from '../../components/InputText'
import { checkStatus, getApiRequestOpts } from '../../utils/api'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { APIResource } from '../home/types'
import { RequestResponse } from './useFeatureMutation'
import { Button } from '../../components/Button'

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
`

const StyledSubtext = styled.div`
  font-size: 12px;
  color: #6f6d6d;
`

async function editTagsRequest({
  uid,
  tags,
}: {
  uid: string
  tags: string
}): Promise<RequestResponse> {
  const res = await fetch('/api/set_tags', {
    ...getApiRequestOpts('POST'),
    body: JSON.stringify({ taggable_uid: uid, tags }),
  }).then(checkStatus)
  return res.json()
}

type FormInputs = {
  tags: string
}

const EditTagsForm = ({
  resource,
  onSuccess,
  uid,
  setShowModal,
  tags,
}: {
  resource: APIResource
  uid: string
  tags: string[]
  onSuccess?: (res: any) => void
  setShowModal?: (show: boolean) => void
}) => {
  const { register, handleSubmit } = useForm<FormInputs>({
    defaultValues: {
      tags: tags.join(', '),
    },
  })

  const mutation = useMutation({
    mutationKey: ['edit-resource-tags', resource],
    mutationFn: (tags: string) => editTagsRequest({ uid, tags }),
    onSuccess: res => {
      if (onSuccess) onSuccess(res)
      if (setShowModal) setShowModal(false)
      toast.success(`Success: ${resource} editing tags`)
    },
    onError: () => {
      toast.error(`Error: editing ${resource} tags`)
    },
  })

  const onSubmit = async (d: FormInputs) => {
    await mutation.mutateAsync(d.tags)
  }

  return (
    <>
      <StyledForm
        id="edit-tag-form"
        onSubmit={e => {
          e.stopPropagation()
          handleSubmit(onSubmit)(e)
        }}
      >
        <StyledSubtext>Tags are public to the community</StyledSubtext>
        <FieldGroup>
          <label>Tags (comma-separated)</label>
          <InputText {...register('tags')} disabled={mutation.isPending} />
        </FieldGroup>
      </StyledForm>
      <Footer>
        <ButtonRow>
          <Button
            type="button"
            onClick={() => setShowModal && setShowModal(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            data-variant="primary"
            type="submit"
            form="edit-tag-form"
            disabled={mutation.isPending}
          >
            Edit Tags
          </Button>
        </ButtonRow>
      </Footer>
    </>
  )
}

export function useEditTagsModal<
  T extends { uid: string; name: string; tags: string[] },
>({
  resource,
  selected,
  onSuccess,
}: {
  resource: APIResource
  selected: T
  onSuccess?: (res: any) => void
}) {
  const { isShown, setShowModal } = useModal()
  const mSelected = useMemo(() => selected, [isShown])

  const modalComp = (
    <ModalNext
      id='edit-tags-modal'
      data-testid={`modal-${resource}-edit-tags`}
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        disableClose={false}
        headerText={`Edit tags for ${mSelected?.name}`}
        hide={() => setShowModal(false)}
      />
      {selected && (
        <EditTagsForm
          resource={resource}
          onSuccess={onSuccess}
          uid={selected.uid}
          setShowModal={setShowModal}
          tags={selected.tags}
        />
      )}
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
