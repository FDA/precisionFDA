import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toastError, toastSuccess } from '../../components/NotificationCenter/ToastHelper'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import type { APIResource } from '../home/types'
import { useModal } from '../modal/useModal'

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

  useEffect(() => {
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
      <form className="flex flex-col gap-4 py-2" id="edit-tag-form" onSubmit={handleSubmit(onSubmit)}>
        <p className="text-muted-foreground text-xs">Tags are public to the community</p>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="edit-tags-input">
            Tags (comma-separated)
          </label>
          <Input id="edit-tags-input" {...register('tags')} disabled={mutation.isPending} />
        </div>
      </form>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={hideModal} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" form="edit-tag-form" disabled={mutation.isPending}>
          Edit Tags
        </Button>
      </DialogFooter>
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
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent id="edit-tags-modal" data-testid={`modal-${resource}-edit-tags`} className="gap-4">
        <DialogHeader>
          <DialogTitle>{`Edit tags for ${mSelected?.name}`}</DialogTitle>
        </DialogHeader>
        <EditTagsForm
          resource={resource}
          onSuccess={onSuccess}
          uid={mSelected?.uid}
          hideModal={hideModal}
          tags={mSelected?.tags}
        />
      </DialogContent>
    </Dialog>
  )

  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
