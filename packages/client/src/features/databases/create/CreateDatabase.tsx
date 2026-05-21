import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useMemo } from 'react'
import type { Resolver } from 'react-hook-form'
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
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select as UiSelect } from '@/components/ui/select'
import { useAuthUser } from '@/features/auth/useAuthUser'
import { DatabaseInstancePricingMap, isDatabaseResource, RESOURCE_LABELS } from '@/types/user'
import { cn } from '@/utils/cn'
import { StyledBackLink } from '../../home/home.styles'
import { NotFound } from '../../home/show.styles'
import styles from './CreateDatabase.module.css'
import { type DatabaseEngineType, versionsOptions } from './options'

const engineOptions: { value: DatabaseEngineType; label: string }[] = [
  { value: 'aurora-mysql', label: 'MySQL' },
  { value: 'aurora-postgresql', label: 'PostgreSQL' },
]

interface CreateDatabaseForm {
  name: string
  description: string
  engine: DatabaseEngineType
  dxInstanceClass: string | null
  engineVersion: string | null
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Database name is required'),
  description: Yup.string().defined(),
  engine: Yup.string().required('Database engine is required'),
  dxInstanceClass: Yup.string()
    .nullable()
    .required('Database instance is required'),
  engineVersion: Yup.string()
    .nullable()
    .required('Engine version is required'),
})

const reconcileSelection = (currentValue: string | null, options: { value: string }[]) => {
  if (currentValue && options.some(option => option.value === currentValue)) {
    return currentValue
  }

  return options.length === 1 ? options[0].value : null
}

export const CreateDatabase = ({ spaceId }: { spaceId?: number }) => {
  const location = useLocation()
  const user = useAuthUser()

  const dbInstanceOptions = useMemo(() => {
    if (!user) return []
    return user.resources.filter(isDatabaseResource).map(r => ({
      value: r,
      // Keep price suffix aligned and prevent awkward wraps in dropdown labels.
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
    resolver: yupResolver(validationSchema) as Resolver<CreateDatabaseForm>,
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
  const engineVersion = watch('engineVersion')
  const versionOptions = useMemo(() => versionsOptions(engine, dxInstanceClass ?? undefined), [engine, dxInstanceClass])

  const createDatabaseMutation = useCreateDatabaseMutation({ backPath, spaceId })

  useEffect(() => {
    const nextInstanceClass = reconcileSelection(dxInstanceClass, dbInstanceOptions)
    const nextEngineVersion = reconcileSelection(engineVersion, versionsOptions(engine, nextInstanceClass ?? undefined))

    if (nextInstanceClass !== dxInstanceClass) {
      setValue('dxInstanceClass', nextInstanceClass)
    }

    if (nextEngineVersion !== engineVersion) {
      setValue('engineVersion', nextEngineVersion)
    }
  }, [dbInstanceOptions, dxInstanceClass, engine, engineVersion, setValue])

  const onSubmit = () => {
    const vals = getValues()
    createDatabaseMutation.mutateAsync({
      scope: spaceId ? `space-${spaceId}` : 'private',
      name: vals.name,
      description: vals.description,
      engine: vals.engine,
      dxInstanceClass: vals.dxInstanceClass ?? '',
      engineVersion: vals.engineVersion ?? '',
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
            render={({ field }) => {
              const instanceOptions = engine ? dbInstanceOptions : []
              const disabled = isSubmitting
              return (
                <UiSelect
                  id="db_instance_type"
                  name={String(field.name)}
                  items={instanceOptions}
                  value={field.value}
                  onOpenChange={open => {
                    if (!open) field.onBlur()
                  }}
                  onValueChange={v => {
                    field.onChange(v || null)
                  }}
                  disabled={disabled}
                >
                  <SelectTrigger
                    className={cn('w-full max-w-full justify-between')}
                    ref={field.ref}
                    aria-invalid={errors.dxInstanceClass ? true : undefined}
                  >
                    <SelectValue placeholder="Choose instance…" />
                  </SelectTrigger>
                  <SelectContent>
                    {instanceOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </UiSelect>
              )
            }}
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
            render={({ field }) => {
              const disabled = isSubmitting || versionOptions.length === 0
              return (
                <UiSelect
                  id="db_engine_version"
                  name={String(field.name)}
                  items={versionOptions}
                  value={field.value}
                  onOpenChange={open => {
                    if (!open) field.onBlur()
                  }}
                  onValueChange={v => {
                    field.onChange(v || null)
                  }}
                  disabled={disabled}
                >
                  <SelectTrigger
                    className={cn('w-full max-w-full justify-between')}
                    ref={field.ref}
                    aria-invalid={errors.engineVersion ? true : undefined}
                  >
                    <SelectValue
                      placeholder={versionOptions.length === 0 ? 'Select instance first' : 'Choose version…'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {versionOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </UiSelect>
              )
            }}
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
