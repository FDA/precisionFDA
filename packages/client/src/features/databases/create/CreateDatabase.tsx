import { AxiosError } from 'axios'
import React, { useEffect } from 'react'
import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router'
import styled from 'styled-components'
import * as Yup from 'yup'
import { FieldLabelRow, InputError } from '../../../components/form/styles'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { StyledBackLink } from '../../home/home.styles'
import { NotFound } from '../../home/show.styles'
import { CreateDatabasePayload, createDatabaseRequest, getDatabaseAllowedInstances } from '../databases.api'
import { DatabaseEngineType, versionsOptions } from './options'
import { Select } from '../../../components/Select'
import { Button } from '../../../components/Button'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { getBackPathNext } from '../../../utils/getBackPath'
import { HomeScope } from '../../home/types'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'
import { BackendError } from '../../../api/types'

const StyledForm = styled.form`
  margin: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media (min-width: 640px) {
    max-width: 500px;
  }
`

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const replaceNbspSubstring = (str: string, substringLength: number) =>
  str.replace(' '.repeat(substringLength), '\xa0'.repeat(substringLength))

interface CreateDatabaseForm {
  name: string
  description: string
  engine: DatabaseEngineType | null
  dxInstanceClass: { label: string; value: string } | null
  engineVersion: { label: string; value: string } | null
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name required'),
  engine: Yup.string().required('Engine required').nullable().required('Required'),
  dxInstanceClass: Yup.object()
    .shape({
      value: Yup.string().required('Required'),
    })
    .nullable()
    .required('Required'),
  engineVersion: Yup.object()
    .shape({
      value: Yup.string().required('Required'),
    })
    .nullable()
    .required('Required'),
})

export const CreateDatabase = ({ spaceId, homeScope }: { spaceId?: number; homeScope?: HomeScope }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const allowedInstances = useQuery({
    queryKey: ['dbclusters', 'allowedInstances'],
    queryFn: () => getDatabaseAllowedInstances(),
  })

  const backPath = getBackPathNext({
    location,
    resourceLocation: 'databases',
    homeScope,
    spaceId,
  })

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<CreateDatabaseForm>({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: '',
      description: '',
      engine: null,
      dxInstanceClass: null,
      engineVersion: null,
    },
  })

  const queryClient = useQueryClient()
  const createDatabaseMutation = useMutation({
    mutationKey: ['create-database'],
    mutationFn: (payload: CreateDatabasePayload) => createDatabaseRequest(payload),
    onSuccess: res => {
      if (res?.uid) {
        navigate(`${backPath.replace(/\?scope=(me|spaces)/, '')}/${res?.uid}`)
        queryClient.invalidateQueries({
          queryKey: ['dbclusters'],
        })
        if (spaceId) {
          queryClient.invalidateQueries({
            queryKey: ['space', spaceId.toString()],
          })
        } else {
          queryClient.invalidateQueries({
            queryKey: ['counters'],
          })
        }
        toastSuccess('Database created')
      }
    },
    onError: (e: AxiosError<BackendError>) => {
      if (e.response?.data?.error?.message) {
        toastError(`Error: ${e.response.data.error.message}`)
      } else {
        toastError('Something went wrong when creating the database!')
      }
    },
  })

  useEffect(() => {
    setValue('dxInstanceClass', null)
    setValue('engineVersion', null)
  }, [watch().engine])

  const onSubmit = () => {
    const vals = getValues()
    createDatabaseMutation.mutateAsync({
      scope: spaceId ? `space-${spaceId}` : 'private',
      name: vals.name,
      description: vals.description,
      engine: vals.engine,
      dxInstanceClass: vals.dxInstanceClass ? vals.dxInstanceClass.value : '',
      engineVersion: vals.engineVersion ? vals.engineVersion.value : '',
    })
  }

  const isSubmitting = createDatabaseMutation.isPending

  if (allowedInstances.data?.length === 0) {
    return (
      <>
        <StyledBackLink linkTo={backPath}>Back to Databases</StyledBackLink>
        <NotFound>No database resources allowed - contact your Site Administrator to adjust database resources access</NotFound>
      </>
    )
  }
  const dbInstanceOptions =
    allowedInstances.data?.map(option => ({
      ...option,
      label: replaceNbspSubstring(option.label, 4),
    })) ?? []
  return (
    <>
      <StyledBackLink linkTo={backPath}>Back to Databases</StyledBackLink>
      <StyledForm onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <FieldGroup label="Name" required>
          <InputText {...register('name', { required: 'Name is required.' })} disabled={isSubmitting} />
          <ErrorMessage errors={errors} name="name" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
        <FieldGroup label="Description">
          <InputText {...register('description')} disabled={isSubmitting} />
          <ErrorMessage errors={errors} name="description" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
        <FieldGroup label="Database type" required>
          <FieldLabelRow htmlFor="field-aurora-mysql">
            <input
              {...register('engine')}
              type="radio"
              name="engine"
              value="aurora-mysql"
              id="field-aurora-mysql"
              disabled={isSubmitting}
            />
            MySQL
          </FieldLabelRow>
          <FieldLabelRow htmlFor="field-aurora-postgresql">
            <input
              {...register('engine')}
              type="radio"
              name="engine"
              value="aurora-postgresql"
              id="field-aurora-postgresql"
              disabled={isSubmitting}
            />
            PostgreSQL
          </FieldLabelRow>
          <ErrorMessage errors={errors} name="engine" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
        <FieldGroup label="Instance" required>
          <Controller
            name="dxInstanceClass"
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                id="db_instance_type"
                options={watch().engine ? dbInstanceOptions : []}
                placeholder="Choose..."
                onChange={onChange}
                defaultValue={null}
                isClearable
                isSearchable
                onBlur={onBlur}
                value={value}
                isDisabled={isSubmitting}
              />
            )}
          />
          <ErrorMessage errors={errors} name="dxInstanceClass" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
        <FieldGroup label="Version" required>
          <Controller
            name="engineVersion"
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                id="db_engine_version"
                options={versionsOptions(watch().engine, watch().dxInstanceClass?.value ?? '')}
                placeholder="Choose..."
                onChange={onChange}
                defaultValue={null}
                isClearable
                isSearchable
                onBlur={onBlur}
                value={value}
                isDisabled={isSubmitting}
              />
            )}
          />
          <ErrorMessage errors={errors} name="engineVersion" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
        <Row>
          <Button data-variant="primary" disabled={Object.keys(errors).length > 0 || isSubmitting} type="submit">
            Submit
          </Button>
          {isSubmitting && <Loader />}
        </Row>
      </StyledForm>
    </>
  )
}
