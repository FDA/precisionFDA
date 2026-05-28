import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type React from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/utils/cn'
import { Button } from '../../../components/Button'
import { FieldGroup, Hint, InputError } from '../../../components/form/form.styles'
import { InputText } from '../../../components/InputText'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'
import type { ApiRailsError } from '../../home/types'
import { ModalHeaderTop, ModalNext, useModalFloatingPortalHost } from '../../modal/ModalNext'
import { ButtonRow } from '../../modal/modal.styles'
import { useModal } from '../../modal/useModal'
import { addMembersToSpaceRequest } from './members.api'
import { StyledFields, StyledFooter } from './members.styles'
import type { MemberRole } from './members.types'

interface FormValues {
  invitees_role: { label: string; value: MemberRole }
  invitees: string
}

const MEMBER_ROLE_OPTIONS: { value: MemberRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'contributor', label: 'Contributor' },
  { value: 'viewer', label: 'Viewer' },
]

const validationSchema = Yup.object().shape({
  invitees: Yup.string().required('Username(s) required'),
  invitees_role: Yup.object()
    .shape({
      value: Yup.string().required('Role required'),
    })
    .required('Required'),
})

interface AddMembersFormProps {
  spaceId: string
  onClose: () => void
}

const AddMembersForm: React.FC<AddMembersFormProps> = ({ spaceId, onClose }) => {
  const floatingPortalHost = useModalFloatingPortalHost()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      invitees: '',
      invitees_role: { value: 'viewer', label: 'Viewer' },
    },
    resolver: yupResolver(validationSchema),
  })
  const mutation = useMutation({
    mutationKey: ['add-members-to-space'],
    mutationFn: ({ invitees, invitees_role }: FormValues) =>
      addMembersToSpaceRequest({
        spaceId,
        invitees: invitees.toLowerCase(),
        invitees_role: invitees_role.value,
      }),
    onSuccess: () => {
      reset()
      queryClient.invalidateQueries({
        queryKey: ['space-members'],
      })
      queryClient.invalidateQueries({
        queryKey: ['space', spaceId.toString()],
      })
      onClose()
      toastSuccess('Success: Adding members')
    },
    onError: (e: AxiosError<ApiRailsError>) => {
      toastError(`Error: Adding members. ${e.response?.data.errors}`)
    },
  })

  const onSubmit = ({ invitees_role, invitees }: FormValues) => {
    mutation.mutateAsync({ invitees, invitees_role })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StyledFields>
        <FieldGroup>
          <label htmlFor="modal-add-members-invitees">Username List</label>
          <InputText
            {...register('invitees')}
            id="modal-add-members-invitees"
            placeholder=""
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            disabled={mutation.isPending}
          />
          <Hint>
            Enter usernames or emails seperated by commas. For example: first_user, second_user, third_user@email.com
          </Hint>
          <ErrorMessage errors={errors} name="invitees" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
        <FieldGroup>
          <label htmlFor="modal-add-members-role">Role</label>
          <Controller
            name="invitees_role"
            control={control}
            render={({ field }) => {
              const disabled = mutation.isPending
              return (
                <Select
                  id="modal-add-members-role"
                  name={String(field.name)}
                  modal={false}
                  items={MEMBER_ROLE_OPTIONS}
                  value={field.value?.value ?? null}
                  onOpenChange={open => {
                    if (!open) field.onBlur()
                  }}
                  onValueChange={v => {
                    const chosen = MEMBER_ROLE_OPTIONS.find(o => o.value === v)
                    field.onChange(chosen ?? null)
                  }}
                  disabled={disabled}
                >
                  <SelectTrigger
                    className={cn('w-full min-w-0 justify-between')}
                    ref={field.ref}
                    aria-invalid={errors.invitees_role ? true : undefined}
                  >
                    <SelectValue placeholder="Choose…" />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="start" container={floatingPortalHost ?? undefined}>
                    {MEMBER_ROLE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            }}
          />
          <Hint>Select the new members role</Hint>
          <ErrorMessage
            errors={errors}
            name="invitees_role"
            render={({ message }) => <InputError>{message}</InputError>}
          />
        </FieldGroup>
      </StyledFields>
      <StyledFooter>
        <ButtonRow>
          <Button
            type="button"
            onClick={() => {
              reset()
              onClose()
            }}
            disabled={mutation.isPending}
            aria-label="Close modal"
          >
            Cancel
          </Button>
          <Button
            data-variant="primary"
            type="submit"
            disabled={Object.keys(errors).length > 0 || mutation.isPending}
            aria-label="Submit add members"
          >
            Add Members
          </Button>
        </ButtonRow>
      </StyledFooter>
    </form>
  )
}

export const useAddMembersModal = ({ spaceId }: { spaceId: string }) => {
  const { isShown, setShowModal } = useModal()
  const modalComp = isShown && (
    <ModalNext
      id="modal-add-members"
      data-testid="modal-add-members"
      isShown={isShown}
      hide={() => setShowModal(false)}
      variant="medium"
    >
      <ModalHeaderTop
        disableClose={false}
        headerText="Add members to space"
        hide={() => setShowModal(false)}
      />
      <AddMembersForm spaceId={spaceId} onClose={() => setShowModal(false)} />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
