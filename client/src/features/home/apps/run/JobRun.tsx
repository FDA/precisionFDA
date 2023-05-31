import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useHistory, useParams } from 'react-router'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import { ButtonSolidBlue } from '../../../../components/Button'
import { FieldGroup } from '../../../../components/form/FieldGroup'
import { CubeIcon } from '../../../../components/icons/CubeIcon'
import { QuestionIcon } from '../../../../components/icons/QuestionIcon'
import { InputText } from '../../../../components/InputText'
import { EmptyTable } from '../../../../components/Table/styles'
import { IUser } from '../../../../types/user'
import { getSpaceIdFromScope } from '../../../../utils'
import DefaultLayout from '../../../../layouts/DefaultLayout'
import { useAuthUser } from '../../../auth/useAuthUser'
import { fetchFile } from '../../files/files.api'
import { IFile } from '../../files/files.types'
import {
  fetchAcceptedLicenses,
  fetchLicensesForFiles,
} from '../../licenses/api'
import { License } from '../../licenses/types'
import { useAcceptLicensesModal } from '../../licenses/useAcceptLicensesModal'
import { HomeLoader, NotFound, Title } from '../../show.styles'
import {
  fetchApp,
  fetchLicensesOnApp,
  fetchUserComputeInstances,
  runJob,
  RunJobRequest,
} from '../apps.api'
import {
  AcceptedLicense,
  ComputeInstance,
  IApp,
  InputSpec,
  INPUT_TYPES_CLASSES,
  JobRunData,
  ListedFile, SelectType,
} from '../apps.types'
import { ErrorMessageForField } from './ErrorMessageForField'
import { JobRunInput } from './JobRunInput'
import {
  AppsConfiguration,
  Section,
  SectionBody,
  SectionHeader,
  StyledBackLink,
  StyledForm,
  StyledJobName,
  StyledRow,
  TipsRow,
  Topbox,
  TopboxItem,
  WrapSelect,
} from './styles'
import { fetchAndConvertSelectableContexts, fetchAndConvertSelectableSpaces } from './job-run-helper'

const convertToListedFile = (file: IFile): ListedFile =>
  ({
    id: parseInt(file.id, 10),
    uid: file.uid,
    title: file.name,
  } as ListedFile)

const getDefaultValue = (
  inputSpec: InputSpec,
  defaultFiles?: IFile[],
): string | boolean | ListedFile | undefined => {
  if (inputSpec.class === INPUT_TYPES_CLASSES.FILE) {
    const defaultFile = defaultFiles?.find(
      file => file.uid === inputSpec.default,
    )
    return defaultFile ? convertToListedFile(defaultFile) : undefined
  }
  return inputSpec.default
}

const prepareDefaultValues = (
  app: IApp,
  inputSpecs: InputSpec[],
  user: IUser,
  meta: any,
  computeInstances: ComputeInstance[],
  defaultFiles?: IFile[],
): JobRunData => {
  const defaultInstance = computeInstances.find(instance => instance.value === meta.spec.instance_type)
  const defaultValues: JobRunData = {
    jobName: app ? app.name : '',
    jobLimit: user ? user.job_limit: 0,
    instanceType: defaultInstance,
    scope: {label: "Private", value: "private"} as SelectType,
    inputs: {},
  }
  inputSpecs.forEach(inputSpec => {
    if (inputSpec.default !== undefined) {
      if (inputSpec.class === INPUT_TYPES_CLASSES.FILE) {
        defaultValues.inputs[inputSpec.name] = getDefaultValue(
          inputSpec,
          defaultFiles,
        )
      } else {
        defaultValues.inputs[inputSpec.name] = inputSpec.default
      }
    }
  })
  return defaultValues
}

const getLabel = (inputSpec: InputSpec) => 
  inputSpec.label ? inputSpec.label : inputSpec.name

const prepareValidations = (
  inputSpecs: InputSpec[],
  user: IUser,
  scope?: string,
) => {
  const inputs: any = {}
  inputSpecs
    .filter(inputSpec => !inputSpec.optional)
    .forEach(inputSpec => {
      if (inputSpec.class === INPUT_TYPES_CLASSES.BOOLEAN) {
        inputs[inputSpec.name] = Yup.boolean().required(
          `${getLabel(inputSpec)} is required`,
        )
      } else if (inputSpec.class === INPUT_TYPES_CLASSES.FILE) {
        inputs[inputSpec.name] = Yup.object().required(
          `${getLabel(inputSpec)} is required`,
        )
      } else {
        inputs[inputSpec.name] = Yup.string().required(
          `${getLabel(inputSpec)} is required`,
        )
      }
    })

  const spaceValidations =
    scope && ['private', 'public'].includes(scope)
      ? Yup.object().nullable()
      : Yup.object().nullable().required('Scope is required')

  const validationObject = {
    jobName: Yup.string().required('Job name required'),
    jobLimit: Yup.number()
      .required('Execution cost limit required')
      .positive('Limit must be positive')
      .typeError('You must specify a number')
      .max(
        user ? user.job_limit : 0,
        `Maximum job limit for current user is $${user?.job_limit}`,
      ),
    instanceType: Yup.object().nullable().required('Instance type is required'),
    inputs: Yup.object().shape(inputs),
    scope: spaceValidations,
  }

  return Yup.object().shape(validationObject)
}

const getValue = (
  inputKey: string,
  value: string | boolean | number | ListedFile | undefined,
  inputSpecs: InputSpec[],
): string | number | boolean | undefined => {
  const inputClass = inputSpecs.find(
    inputSpec => inputSpec.name === inputKey,
  )?.class
  if (inputClass === INPUT_TYPES_CLASSES.FLOAT) {
    return parseFloat(value as string)
  }
  if (inputClass === INPUT_TYPES_CLASSES.INT) {
    return parseInt(value as string, 10)
  }
  if (inputClass === INPUT_TYPES_CLASSES.FILE) {
    return (value as ListedFile)?.uid
  }
  return value as string
}

const createRequestObject = (
  vals: JobRunData,
  app: IApp,
  inputSpecs: InputSpec[],
): RunJobRequest => {
  const inputs: { [key: string]: string | number | boolean | undefined } = {}

  Object.keys(vals.inputs).forEach(key => {
    const value = vals.inputs[key]
    if (value) {
      inputs[key] = getValue(key, value, inputSpecs)
    }
  })

  return {
    id: app.uid,
    name: vals.jobName,
    job_limit: vals.jobLimit,
    instance_type: vals.instanceType?.value,
    scope: vals.scope?.value,
    inputs,
  } as RunJobRequest
}

const getLicensesToAccept = (
  licensesToAccept: License[],
  acceptedLicenses: AcceptedLicense[],
): License[] => {
  const acceptedIds = acceptedLicenses
    .filter(item => item.state === 'active' || item.state === null)
    .map(item => item.license.toString())
  const remainingLicenses = licensesToAccept.filter(
    license => !acceptedIds.includes(license.id.toString()),
  )
  return remainingLicenses
}

const fetchLicensesOnFiles = (jobData: JobRunData): Promise<License[]> => {
  const ids: number[] = []
  const { inputs } = jobData

  Object.keys(inputs).forEach(key => {
    if (typeof inputs[key] === 'object') {
      ids.push((inputs[key] as ListedFile).id)
    }
  })

  if (ids.length > 0) {
    return fetchLicensesForFiles(ids)
  }
  return Promise.resolve([])
}

const JobRun = ({
  app,
  inputSpecs,
  user,
  meta,
  computeInstances,
  defaultFiles,
}: {
  app: IApp
  inputSpecs: InputSpec[]
  user: IUser
  meta: any
  computeInstances: ComputeInstance[]
  defaultFiles?: IFile[]
}) => {
  const history = useHistory()
  const defaultValues = prepareDefaultValues(app, inputSpecs, user, meta, computeInstances, defaultFiles)
  const validationSchema = prepareValidations(inputSpecs, user, app.scope)

  const { data: selectableContexts } = useQuery(
      ['selectable-contexts', app.scope],
      () => fetchAndConvertSelectableContexts(app.entity_type),
      {
        onError: () => {
          toast.error('Error loading contexts')
        },
      },
  )

  const { data: selectableSpaces } = useQuery(
    ['selectable-spaces', app.scope],
    () => fetchAndConvertSelectableSpaces(app.scope),
    {
      onError: () => {
        toast.error('Error loading spaces')
      },
    },
  )

  const { modalComp: licensesModal, setLicensesAndShow } =
    useAcceptLicensesModal()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    trigger,
  } = useForm<JobRunData>({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
    defaultValues,
  })

  const runJobMutation = useMutation({
    mutationFn: (payload: RunJobRequest) => runJob(payload),
    onSuccess: res => {
      if (res?.id) {
        const scope = getValues().scope?.value
        if (scope === 'private') {
          history.push(`/home/jobs/${res?.id}`)
        } else {
          const spaceId = scope.replace("space-", "")
          history.push(`/spaces/${spaceId}/executions/${res?.id}`)
        }
      } else if (res?.error) {
        toast.error(res.error.message)
      } else {
        toast.error('Something went wrong!')
      }
    },
    onError: () => {
      toast.error('Error: Running job.')
    },
  })

  const onSubmit = async () => {
    const valid = await trigger()
    if (valid) {
      try {
        const r = await Promise.all([
          fetchLicensesOnApp(app.uid),
          fetchLicensesOnFiles(getValues()),
        ])

        const acceptedLicenses = await fetchAcceptedLicenses()
        const licensesToAccept = getLicensesToAccept(r.flat(), acceptedLicenses)
        if (licensesToAccept.length > 0) {
          setLicensesAndShow(licensesToAccept, acceptedLicenses)
        } else {
          const req = createRequestObject(getValues(), app, inputSpecs)
          await runJobMutation.mutateAsync(req)
        }
      } catch (e) {
        toast.error('Failed to run app')
      }
    }
  }

  const appTitle = app.title ? app.title : app.name
  const spaceId = getSpaceIdFromScope(app.scope)
  const baseLink = spaceId ? `spaces/${spaceId}` : 'home'

  return (
    <DefaultLayout>
      {licensesModal}
      <Topbox>
        <StyledBackLink linkTo={`/${baseLink}/apps/${app.uid}`}>
          Back to App
        </StyledBackLink>
        <TopboxItem>
          <Title>
            <CubeIcon height={20} />
            <span>Run App:</span>
            <span>{appTitle}</span>
          </Title>
        </TopboxItem>
      </Topbox>
      <StyledForm
        id="submitJobForm"
        autoComplete="off"
      >
        <AppsConfiguration>
          <TipsRow>
            <QuestionIcon height={14} />
            Need help? &nbsp;
            <Link to="/docs/apps#apps-run" target="_blank">
              Learn more about running an app
            </Link>
          </TipsRow>
          <Section>
            <SectionHeader>CONFIGURE</SectionHeader>
            <SectionBody>
              <StyledRow>
                <StyledJobName>
                  <FieldGroup label="Job Name" required>
                    <InputText
                      label="jobName"
                      {...register('jobName')}
                      disabled={isSubmitting}
                    />
                    <ErrorMessageForField errors={errors} fieldName="jobName" />
                  </FieldGroup>
                </StyledJobName>
                <FieldGroup label="Execution Cost Limit ($)" required>
                  <InputText
                    label="jobLimit"
                    type="number"
                    min="0"
                    step="10"
                    {...register('jobLimit')}
                    disabled={isSubmitting}
                  />
                  <ErrorMessageForField errors={errors} fieldName="jobLimit" />
                </FieldGroup>
              </StyledRow>
              {app.entity_type === "https" && (
                  <WrapSelect>
                    <FieldGroup label="Context" required>
                      <Controller
                          name="scope"
                          control={control}
                          render={({ field }) => (
                              <Select
                                  options={selectableContexts}
                                  placeholder="Choose..."
                                  onChange={value => {
                                    field.onChange(value)
                                    field.onBlur()
                                  }}
                                  isClearable
                                  isSearchable
                                  onBlur={field.onBlur}
                                  value={field.value}
                                  isDisabled={isSubmitting}
                              />
                          )}
                      />
                      <ErrorMessageForField
                          errors={errors}
                          fieldName="scope"
                      />
                    </FieldGroup>
                  </WrapSelect>
              )
              }
              {app.scope && app.scope.startsWith('space-') && (
                <WrapSelect>
                  <FieldGroup label="Space scope" required>
                    <Controller
                      name="scope"
                      control={control}
                      render={({ field }) => (
                        <Select
                          options={selectableSpaces}
                          placeholder="Choose..."
                          onChange={value => {
                            field.onChange(value)
                            field.onBlur()
                          }}
                          isClearable
                          isSearchable
                          onBlur={field.onBlur}
                          value={field.value}
                          isDisabled={isSubmitting}
                        />
                      )}
                    />
                    <ErrorMessageForField
                      errors={errors}
                      fieldName="scope"
                    />
                  </FieldGroup>
                </WrapSelect>
              )}

              <WrapSelect>
                <FieldGroup label="Instance Type" required>
                  <Controller
                    name="instanceType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={computeInstances}
                        placeholder="Choose..."
                        onChange={value => {
                          field.onChange(value)
                          field.onBlur()
                        }}
                        isClearable
                        isSearchable
                        onBlur={field.onBlur}
                        value={field.value}
                        isDisabled={isSubmitting}
                      />
                    )}
                  />
                  <ErrorMessageForField
                    errors={errors}
                    fieldName="instanceType"
                  />
                </FieldGroup>
              </WrapSelect>
            </SectionBody>
          </Section>
          <Section>
            <SectionHeader>INPUTS</SectionHeader>
            <SectionBody>
              {inputSpecs.length > 0 ? inputSpecs.map(inputSpec => (
                <FieldGroup
                  key={inputSpec.name}
                  label={getLabel(inputSpec)}
                  required={!inputSpec.optional}
                >
                  <JobRunInput
                    fieldName={`inputs[${inputSpec.name}]`}
                    defaultValue={getDefaultValue(inputSpec, defaultFiles)}
                    type={inputSpec.class}
                    helpText={inputSpec.help}
                    choices={inputSpec.choices}
                    errors={errors}
                    disabled={isSubmitting}
                    control={control}
                    register={register}
                    scope={app.scope}
                  />
                </FieldGroup>
              )) : <EmptyTable>App has no inputs.</EmptyTable>}
            </SectionBody>
          </Section>
        </AppsConfiguration>
        <ButtonSolidBlue
          disabled={isSubmitting}
          type="button"
          form="submitJobForm"
          onClick={handleSubmit(onSubmit)}
        >
          {isSubmitting ? 'Running' : 'Run App'}
        </ButtonSolidBlue>
      </StyledForm>
    </DefaultLayout>
  )
}

const fetchDefaultFiles = (
  meta: any,
): Promise<{ files: IFile; meta: any }[]> => {
  const promises: Promise<{ files: IFile; meta: any }>[] = []
  meta?.spec.input_spec.forEach((inputSpec: InputSpec) => {
    if (
      inputSpec.class === INPUT_TYPES_CLASSES.FILE &&
      inputSpec.default !== undefined
    ) {
      const promise = fetchFile(inputSpec.default as string)
      promises.push(promise)
    }
  })
  return Promise.all(promises)
}

export const JobRunForm = () => {
  const { appUid } = useParams<{ appUid: string }>()
  const user = useAuthUser()
  const { data: appData, status: loadingAppStatus } = useQuery(
    ['app', appUid],
    () => fetchApp(appUid),
  )
  const { data: defaultFilesData, status: defaultFilesLoading } = useQuery(
    ['default-files'],
    () => fetchDefaultFiles(appData?.meta),
    {
      enabled: loadingAppStatus === 'success',
      onError: () => {
        toast.error('Error loading default files')
      },
    },
  )

  const { data: computeInstances, status: computeInstancesLoading } = useQuery(
    ['compute-instances'],
    () => fetchUserComputeInstances(),
    {
      onError: () => {
        toast.error('Error loading compute instances')
      },
    },
  )

  if (loadingAppStatus === 'loading' || defaultFilesLoading === 'loading' 
    || user === undefined || computeInstancesLoading === 'loading' ) {
    return <HomeLoader />
  }

  const app = appData?.app
  const inputSpecs: InputSpec[] = appData?.meta?.spec.input_spec
  const defaultFiles: IFile[] | undefined = defaultFilesData?.map(
    data => data.files,
  )

  if (!app)
    return (
      <NotFound>
        <h1>App not found</h1>
        <div>Sorry, this app does not exist or is not accessible by you.</div>
      </NotFound>
    )

  return (
    <JobRun 
      app={app}
      inputSpecs={inputSpecs}
      user={user}
      meta={appData.meta}
      computeInstances={computeInstances}
      defaultFiles={defaultFiles} 
    />
  )
}