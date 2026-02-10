import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { Button } from '../../../components/Button'
import { FieldGroup, InputError } from '../../../components/form/styles'
import { InputText } from '../../../components/InputText'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'
import { Select } from '../../../components/Select'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { Footer } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { fetchSpaceMemberships } from '../../spaces/members/members.api'
import { StyledFields } from '../../spaces/members/members.styles'
import { MemberSideV2, SpaceMembershipV2 } from '../../spaces/members/members.types'
import { ISpaceV2 } from '../../spaces/spaces.types'
import { recoverSpaceLeadRequest } from './api'
import { BackendError } from '@/api/types'

const validationSchema = Yup.object().shape({
  currentLead: Yup.object()
    .shape({
      value: Yup.number().required(),
      label: Yup.string().required(),
    })
    .required('Current Lead is required'),
  newLeadDxuser: Yup.string()
    .required('New Lead is required')
    .test('not-already-lead', 'The user is already a lead in the space', function (value) {
      const { leadOptions } = this.options.context || {}
      return !leadOptions?.some((m: { label: string; value: number }) => m.label.includes(value))
    }),
})

interface RecoverLeadFormValues {
  currentLead: { label: string; value: number }
  newLeadDxuser: string
}

const RecoverSpaceLeadForm = ({ space, onClose }: { space: ISpaceV2; onClose: () => void }): React.JSX.Element => {
  const [leadOptions, setLeadOptions] = useState<{ label: string; value: number }[]>([])
  const queryClient = useQueryClient()
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    register,
  } = useForm<RecoverLeadFormValues>({ resolver: yupResolver(validationSchema), context: { leadOptions } })
  const { data: spaceMemberships = [], isLoading } = useQuery({
    queryKey: ['space-memberships', space.id],
    queryFn: () => fetchSpaceMemberships(space.id),
  })

  const getMembershipSide = (side: MemberSideV2) => {
    if (space.type === 'review') {
      return side === 'HOST' ? 'REVIEWER' : 'SPONSOR'
    }
    return side
  }
  useEffect(() => {
    const leadUsers = spaceMemberships.filter((member: SpaceMembershipV2) => member.role === 'LEAD')
    setLeadOptions(
      leadUsers.map((member: SpaceMembershipV2) => ({
        value: member.id,
        label: `${member.username} (${getMembershipSide(member.side)})`,
      })),
    )
  }, [spaceMemberships])

  const mutation = useMutation({
    mutationFn: ({ currentLeadMembershipId, newLeadDxuser }: { currentLeadMembershipId: number; newLeadDxuser: string }) =>
      recoverSpaceLeadRequest(space.id, currentLeadMembershipId, newLeadDxuser),
    onSuccess: () => {
      toastSuccess('Recovered space lead successfully')
      reset()
      onClose()
      queryClient.invalidateQueries({
        queryKey: ['spaces'],
      })
    },
    onError: (error: AxiosError<BackendError>) => {
      if (error.response?.data?.error?.message) {
        toastError(`Recover space lead failed. ${error.response?.data?.error?.message}`)
      } else {
        toastError('Recover space lead failed. Unknown error')
      }
    },
  })

  const onSubmit = (data: RecoverLeadFormValues) => {
    mutation.mutateAsync({ currentLeadMembershipId: data.currentLead.value, newLeadDxuser: data.newLeadDxuser })
  }
  const onCancel = () => {
    reset()
    onClose()
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  const isSubmitting = mutation.isPending
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StyledFields>
        <FieldGroup>
          <label>Space name</label>
          <InputText value={space.name} disabled />
        </FieldGroup>
        <FieldGroup>
          <label>Space type</label>
          <InputText value={space.type} disabled />
        </FieldGroup>
        <FieldGroup>
          <label>Current Lead user</label>
          <Controller
            name="currentLead"
            control={control}
            render={({ field }) => (
              <Select
                options={leadOptions}
                {...field}
                isLoading={isSubmitting}
                isDisabled={isSubmitting}
                inputId="select_current_lead"
              />
            )}
          />
          <ErrorMessage errors={errors} name="currentLead" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
        <FieldGroup>
          <label>New Lead user</label>
          <InputText {...register('newLeadDxuser')} placeholder="" disabled={isSubmitting} />
          <ErrorMessage errors={errors} name="newLeadDxuser" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
      </StyledFields>
      <Footer>
        <div className="flex align-center gap-2">
          <Button type="button" onClick={onCancel} disabled={isSubmitting} aria-label="Close modal">
            Cancel
          </Button>
          <Button
            data-variant="primary"
            type="submit"
            disabled={Object.keys(errors).length > 0 || isSubmitting}
            aria-label="Recover space lead"
          >
            Recover Lead
          </Button>
        </div>
      </Footer>
    </form>
  )
}

export const useRecoverSpaceLeadModal = ({ space }: { space: ISpaceV2 }) => {
  const { isShown, setShowModal } = useModal()

  const onClose = () => setShowModal(false)

  const modalComp = isShown && (
    <ModalNext
      id="modal-recover-space-lead"
      data-testid="modal-recover-space-lead"
      isShown={isShown}
      hide={() => setShowModal(false)}
      variant="medium"
    >
      <ModalHeaderTop disableClose={false} headerText="Recover Space Lead" hide={() => setShowModal(false)} />
      <RecoverSpaceLeadForm space={space} onClose={onClose} />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
