import { useEffect, useMemo } from 'react'
import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm } from 'react-hook-form'
import { useLocation } from 'react-router'
import * as Yup from 'yup'
import { useCreateDatabaseMutation } from '@/api/mutations/database'
import { Button } from '@/components/Button'
import { FieldGroup } from '@/components/form/FieldGroup'
import { RadioButtonGroup } from '@/components/form/RadioButtonGroup'
import { InputError } from '@/components/form/styles'
import { InputText } from '@/components/InputText'
import { Loader } from '@/components/Loader'
import { Select } from '@/components/Select'
import { useAuthUser } from '@/features/auth/useAuthUser'
import { DatabaseInstancePricingMap, isDatabaseResource, RESOURCE_LABELS } from '@/types/user'
import { StyledBackLink } from '../../home/home.styles'
import { NotFound } from '../../home/show.styles'
import styles from './CreateDatabase.module.css'
import { DatabaseEngineType, versionsOptions } from './options'

const engineOptions: { value: DatabaseEngineType; label: string }[] = [
  { value: 'aurora-mysql', label: 'MySQL' },
  { value: 'aurora-postgresql', label: 'PostgreSQL' },
]

interface CreateDatabaseForm {
  name: string
  description: string
  engine: DatabaseEngineType
  dxInstanceClass: { label: string; value: string } | null
  engineVersion: { label: string; value: string } | null
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Database name is required'),
  engine: Yup.string().required('Database engine is required'),
  dxInstanceClass: Yup.object({
    value: Yup.string().required('Database instance is required'),
  })
    .nullable()
    .required('Database instance is required'),
  engineVersion: Yup.object({
    value: Yup.string().required('Engine version is required'),
  })
    .nullable()
    .required('Engine version is required'),
})

export const CreateDatabase = ({ spaceId }: { spaceId?: number }) => {
  const location = useLocation()
  const user = useAuthUser()

  const dbInstanceOptions = useMemo(() => {
    if (!user) return []
    return user.resources.filter(isDatabaseResource).map(r => ({
      value: r,
      // Adding non-breaking space and em dash to ensure label doesn't break into multiple lines and price is always at the end of the label
      label: `${RESOURCE_LABELS[r]}\xa0 \u2014 \xa0$${DatabaseInstancePricingMap[r]}\xa0/\xa0hour`,
    }))
  }, [user])

  const backPath = location.pathname.replace(/\/create$/, '')

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
      engine: 'aurora-mysql',
      dxInstanceClass: null,
      engineVersion: null,
    },
  })

  const engine = watch('engine')
  const dxInstanceClass = watch('dxInstanceClass')

  const createDatabaseMutation = useCreateDatabaseMutation({ backPath, spaceId })

  useEffect(() => {
    setValue('dxInstanceClass', null)
    setValue('engineVersion', null)
  }, [engine])

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

  if (dbInstanceOptions.length === 0) {
    return (
      <>
        <StyledBackLink linkTo={backPath}>Back to Databases</StyledBackLink>
        <NotFound>
          No database resources allowed - contact your Site Administrator to adjust database resources access
        </NotFound>
      </>
    )
  }
  return (
    <>
      <StyledBackLink linkTo={backPath}>Back to Databases</StyledBackLink>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <div className="text-2xl font-bold">Create Database</div>
        <FieldGroup label="Name" required>
          <InputText {...register('name', { required: 'Name is required.' })} disabled={isSubmitting} />
          <ErrorMessage errors={errors} name="name" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
        <FieldGroup label="Description">
          <InputText {...register('description')} disabled={isSubmitting} />
          <ErrorMessage
            errors={errors}
            name="description"
            render={({ message }) => <InputError>{message}</InputError>}
          />
        </FieldGroup>
        <FieldGroup label="Database type" required>
          <Controller
            name="engine"
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <RadioButtonGroup
                options={engineOptions}
                value={value ?? undefined}
                onChange={onChange}
                onBlur={onBlur}
                disabled={isSubmitting}
                ariaLabel="Database engine type select"
                name="engine"
              />
            )}
          />
          <ErrorMessage errors={errors} name="engine" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
        <FieldGroup label="Instance" required>
          <Controller
            name="dxInstanceClass"
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                id="db_instance_type"
                options={engine ? dbInstanceOptions : []}
                placeholder="Choose instance..."
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
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                id="db_engine_version"
                options={versionsOptions(engine, dxInstanceClass?.value ?? '')}
                placeholder="Choose version..."
                onChange={onChange}
                noOptionsMessage={() => 'Select instance first'}
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
        <div className={styles.row}>
          <Button data-variant="primary" disabled={Object.keys(errors).length > 0 || isSubmitting} type="submit">
            Submit
          </Button>
          {isSubmitting && <Loader />}
        </div>
      </form>
    </>
  )
}
