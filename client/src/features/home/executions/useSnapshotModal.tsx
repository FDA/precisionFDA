import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import * as Yup from 'yup'
import { Button, ButtonSolidBlue } from '../../../components/Button'
import { Checkbox } from '../../../components/Checkbox'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { InputError } from '../../../components/form/styles'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { colors } from '../../../styles/theme'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { CheckboxLabel } from '../../spaces/form/styles'
import { workstationSnapshotRequest } from './executions.api'
import { IExecution } from './executions.types'

const StyledForm = styled.form`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const StyledHintText = styled.div`
  font-size: 14px;
  color: ${colors.blacktextOnWhite};
`

interface CreateSnapshotForm {
  name: string
  terminate: boolean
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name required')
    .matches(/^[a-zA-Z0-9-_ ]+$/, 'Name can only contain alphanumeric, dash, underscore and spaces'),
  terminate: Yup.boolean().required('Terminate required'),
})

const padZero = (n: number): string => {
  const prefix = (n < 10) ? '0' : ''
  return `${prefix}${n}`
}

const getDefaultSnapshotName = (execution: IExecution): string => {
  const now = new Date()
  const dateString = `${now.getFullYear()}-${padZero(now.getMonth()+1)}-${padZero(now.getDate())}-${padZero(now.getHours())}${padZero(now.getMinutes())}`
  return `${execution.name} ${dateString}`
}

const SnapshotForm = ({
  execution,
  onSubmit,
}: {
  execution: IExecution
  onSubmit: any
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CreateSnapshotForm>({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: getDefaultSnapshotName(execution),
      terminate: false,
    },
  })

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)} id="create-snapshot-form">
      <FieldGroup label="Name" required>
        <InputText {...register('name')} disabled={isSubmitting} />
        <ErrorMessage
          errors={errors}
          name="name"
          render={({ message }) => <InputError>{message}</InputError>}
        />
      </FieldGroup>

      <FieldGroup>
        <CheckboxLabel>
          <Checkbox
            {...register('terminate')}
            disabled={isSubmitting}
            onChange={(event: any) =>
              setValue('terminate', event.target.checked)
            }
          />
          Terminate
        </CheckboxLabel>
        <StyledHintText>
          When enabled the workstation will terminate after creating the snapshot
        </StyledHintText>
      </FieldGroup>
    </StyledForm>
  )
}

export function useSnapshotModal<T extends { ids: string[]; name: string }>({
  selected,
}: {
  selected: IExecution
}) {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useModal()
  const memoSelected = useMemo(() => selected, [isShown])
  const mutation = useMutation({
    mutationKey: ['snapshot-job'],
    mutationFn: (vals: CreateSnapshotForm) =>
      workstationSnapshotRequest(selected.dxid, vals),
    onError: (e: AxiosError) => {
      const payload = e.response?.data as any
      const message = payload?.error?.message ?? e.message
      toast.error(`Error creating snapshot: ${message}`)
    },
    onSuccess: (res: any) => {
      if (res?.meta?.messages[0]) {
        toast.error(`Error creating snapshot: ${res?.meta?.messages[0].message}`)
        return
      }
      queryClient.invalidateQueries(['jobs'])
      queryClient.invalidateQueries(['execution', selected.uid])
      setShowModal(false)
      toast.success('Creating snapshot. The snapshot file will appear in My Home shortly after its completion.')
    },
  })

  const handleSubmit = (vals: CreateSnapshotForm) => {
    mutation.mutateAsync(vals)
  }

  const modalComp = (
    <ModalNext
      data-testid="modal-create-snapshot"
      isShown={Boolean(isShown)}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        headerText="Create Snapshot"
        hide={() => setShowModal(false)}
      />
      <ModalScroll>
        <SnapshotForm execution={memoSelected} onSubmit={handleSubmit} />
      </ModalScroll>
      <Footer>
        <ButtonRow>
          {mutation.isLoading && <Loader />}
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <ButtonSolidBlue
            type="submit"
            form="create-snapshot-form"
            disabled={mutation.isLoading}
          >
            Create Snapshot
          </ButtonSolidBlue>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
