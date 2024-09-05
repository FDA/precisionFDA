/* eslint-disable react/jsx-props-no-spreading */
import { AxiosError } from 'axios'
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useState } from 'react'
import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { debounce } from 'lodash'
import { Controller, FieldValues, useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import * as Yup from 'yup'
import { BackendError } from '../../../api/errors'
import { FieldLabelRow, Hint, InputError } from '../../../components/form/styles'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { StyledBackLink } from '../../home/home.styles'
import { NotFound } from '../../home/show.styles'
import {
  createDatabaseRequest,
  fetchAccessibleFiles,
  getDatabaseAllowedInstances,
  IAccessibleFile,
} from '../databases.api'
import { DatabaseEngineType, versionsOptions } from './options'
import { Select } from '../../../components/Select'
import { Button } from '../../../components/Button'
import { FieldGroup } from '../../../components/form/FieldGroup'

const useAccessibleFiles = (inputValue: string) => useQuery({
  queryKey: ['accessible-files', inputValue],
  queryFn: () => fetchAccessibleFiles({ search_string: inputValue, limit: 100, offset: 0 }).then(v => v?.objects),
})

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
  adminPassword: string
  confirmPassword: string
  engine: DatabaseEngineType | null
  dxInstanceClass: { label: string; value: string } | null
  engineVersion: { label: string; value: string } | null
  ddl_file_uid: { label: string; value: string } | null
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name required'),
  adminPassword: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: Yup.string()
    .required('Confirm Password is required')
    .oneOf([Yup.ref('adminPassword')], 'Passwords must match'),
  engine: Yup.string().required('Engine required').nullable().required('Required'),
  dxInstanceClass: Yup.object()
    .shape({
      value: Yup.string().required('Required'),
    })
    .nullable().required('Required'),
  engineVersion: Yup.object()
    .shape({
      value: Yup.string().required('Required'),
    })
    .nullable().required('Required'),
})

export const CreateDatabase = () => {
  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState('')
  const { data, isLoading } = useAccessibleFiles(inputValue)
  const allowedInstances = useQuery({
    queryKey: ['dbclusters','allowedInstances'],
    queryFn: () => getDatabaseAllowedInstances(),
  })
  const debouncedSqlFileInputSearch = debounce(v => {
    setInputValue(v)
  }, 500)
  
  const accessibleFiles = data || []

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
      adminPassword: '',
      confirmPassword: '',
      ddl_file_uid: null,
      dxInstanceClass: null,
      engineVersion: null,
    },
  })

  
  const queryClient = useQueryClient()
  const createDatabaseMutation = useMutation({
    mutationKey: ['create-database'],
    mutationFn: (payload: any) => createDatabaseRequest(payload),
    onSuccess: (res) => {
      if (res?.db_cluster) {
        navigate(`/home/databases/${res.db_cluster?.uid}`)
        queryClient.invalidateQueries({
          queryKey: ['dbclusters'],
        })
        toast.success('Database created')
      }
    },
    onError: (e: AxiosError<BackendError>) => {
      if (e.response?.data?.error?.message) {
        toast.error(`Error: ${e.response.data.error.message}`)
      }
      toast.error('Error while creating the database!')
    },
  })

  useEffect(() => {
    setValue('dxInstanceClass', null)
    setValue('engineVersion', null)
  }, [watch().engine])

  const onSubmit = (values: FieldValues) => {
    const vals = getValues()
    createDatabaseMutation.mutateAsync({
      name: vals.name,
      description: vals.description,
      engine: vals.engine,
      adminPassword: vals.adminPassword,
      ddl_file_uid: vals.ddl_file_uid ? vals.ddl_file_uid.value : '',
      dxInstanceClass: vals.dxInstanceClass ? vals.dxInstanceClass.value : '',
      engineVersion: vals.engineVersion ? vals.engineVersion.value : '',
    })
  }

  const filesOptions = accessibleFiles?.filter((file: IAccessibleFile) => file.scope !== 'public')
    .map(file => ({
      label: file.title,
      value: file.uid,
    }))

  const isSubmitting = createDatabaseMutation.isPending

  if (allowedInstances.data?.length === 0) {
    return (
      <>
        <StyledBackLink linkTo="/home/databases">
          Back to Databases
        </StyledBackLink>
        <NotFound>
          No database resources allowed - contact your Site Administrator to adjust database resources access
        </NotFound>
      </>
    )
  }
  const dbInstanceOptions = allowedInstances.data?.map((option) => ({
    ...option,
    label: replaceNbspSubstring(option.label, 4),
  })) ?? []
  return (
    <>
      <StyledBackLink linkTo="/home/databases">
        Back to Databases
      </StyledBackLink>
      <StyledForm onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <FieldGroup label="Name" required>
          <InputText
            {...register('name', { required: 'Name is required.' })}
            disabled={isSubmitting}
          />
          <ErrorMessage
            errors={errors}
            name="name"
            render={({ message }) => <InputError>{message}</InputError>}
          />
        </FieldGroup>
        <FieldGroup label="Description">
          <InputText {...register('description')} disabled={isSubmitting} />
          <ErrorMessage
            errors={errors}
            name="description"
            render={({ message }) => <InputError>{message}</InputError>}
          />
        </FieldGroup>
        <FieldGroup label="DB SQL File" required>
          <Controller
            name="ddl_file_uid"
            control={control}
            render={({ field: { value, onChange, onBlur }}) => (
              <Select
                options={filesOptions}
                placeholder="Choose DDL File..."
                onChange={onChange}
                onInputChange={debouncedSqlFileInputSearch}
                isLoading={isLoading}
                defaultValue={{ label: 'Select...', value: '' }}
                isClearable
                isSearchable
                // Disabled client side filtering. for some reason the following line works
                filterOption={(a) => a as any}
                onBlur={onBlur}
                value={value}
                isDisabled={isSubmitting}
              />
            )}
          />
        </FieldGroup>
        <FieldGroup label="DB admin password" required>
          <InputText type="password" {...register('adminPassword')} autoComplete="new-password" disabled={isSubmitting} />
          <Hint>
            This password must be at least 8 characters in length and is not changeable once set
          </Hint>
          <ErrorMessage
            errors={errors}
            name="adminPassword"
            render={({ message }) => <InputError>{message}</InputError>}
          />
        </FieldGroup>
        <FieldGroup label="Retype DB admin password" required>
          <InputText type="password" {...register('confirmPassword')} autoComplete="new-password" disabled={isSubmitting} />
          <ErrorMessage
            errors={errors}
            name="confirmPassword"
            render={({ message }) => <InputError>{message}</InputError>}
          />
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
          <ErrorMessage
            errors={errors}
            name="engine"
            render={({ message }) => <InputError>{message}</InputError>}
          />
        </FieldGroup>
        <FieldGroup label="Instance" required>
          <Controller
            name="dxInstanceClass"
            control={control}
            render={({ field: { value, onChange, onBlur }}) => (
              <Select
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
          <ErrorMessage
            errors={errors}
            name="dxInstanceClass"
            render={({ message }) => <InputError>{message}</InputError>}
          />
        </FieldGroup>
        <FieldGroup label="Version" required>
          <Controller
            name="engineVersion"
            control={control}
            render={({ field: { value, onChange, onBlur }}) => (
              <Select
                options={versionsOptions(
                  watch().engine,
                  watch().dxInstanceClass?.value ?? '',
                )}
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
          <ErrorMessage
            errors={errors}
            name="engineVersion"
            render={({ message }) => <InputError>{message}</InputError>}
          />
        </FieldGroup>
        <Row><Button data-variant="primary" disabled={Object.keys(errors).length > 0 || isSubmitting} type="submit">Submit</Button>{isSubmitting && <Loader />}</Row>
      </StyledForm>
    </>
  )
}
