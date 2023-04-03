import React from 'react'
import { useHistory, useParams } from 'react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import { ErrorMessage } from '@hookform/error-message'
import { Control, Controller, useForm, UseFormRegister } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import Select from 'react-select'
import DefaultLayout from '../../../../views/layouts/DefaultLayout'
import { fetchLicensesOnWorkflow, fetchWorkflow, runWorkflow, RunWorkflowInput, RunWorkflowRequest } from '../workflows.api'
import { InputOutput, IWorkflow, Stage } from '../workflows.types'
import { InputText } from '../../../../components/InputText'
import { InputError } from '../../../../components/form/styles'
import { HomeLoader, NotFound, Title } from '../../show.styles'
import { CubeIcon } from '../../../../components/icons/CubeIcon'
import { ButtonSolidBlue } from '../../../../components/Button'
import { FieldGroup } from '../../../../components/form/FieldGroup'
import { JobRunInput } from '../../apps/run/JobRunInput'
import { AcceptedLicense, InputSpec, INPUT_TYPES_CLASSES, ListedFile, SelectType } from '../../apps/apps.types'
import { Section, SectionHeader, SectionBody, StyledLine, TopboxItem, StyledForm, Topbox, StyledBackLink, WrapSelect } from '../../apps/run/styles'
import { StyledStageHeader, WorkflowConfiguration, StyledAnalysisName } from './styles'
import { GearIcon } from '../../../../components/icons/GearIcon'
import { fetchAcceptedLicenses, fetchLicensesForFiles } from '../../licenses/api'
import { License } from '../../licenses/types'
import { useAcceptLicensesModal } from '../../licenses/useAcceptLicensesModal'
import { IFile } from '../../files/files.types'
import { fetchFile } from '../../files/files.api'
import { useAuthUser } from '../../../auth/useAuthUser'
import { getSpaceIdFromScope } from '../../../../utils'
import { IUser } from '../../../../types/user'
import { fetchAndConvertSelectableSpaces } from '../../apps/run/job-run-helper'

interface WorkflowRunData {
  analysisName: string;
  jobLimit: number;
  spaceScope?: SelectType | null;
  inputs: {
    [key: string]: string | boolean | ListedFile | undefined,
  };
}

const ErrorMessageForField = ({ errors, fieldName }:
  { errors: any, fieldName: string }) => {
  return (<ErrorMessage
    errors={errors}
    name={fieldName}
    render={({ message }) => <InputError>{message}</InputError>} />)
}

const getLabel = (input: InputOutput) =>
  input.label ? input.label : input.name

const convertToListedFile = (file: IFile): ListedFile => {
  return {
    id: parseInt(file.id, 10),
    uid: file.uid,
    title: file.name,
  } as ListedFile
}

const getDefaultValue = (input: InputOutput, defaultFiles?: IFile[]): string | boolean | ListedFile | undefined => {
  const defaultValue = (input.default_workflow_value === null) ? undefined : input.default_workflow_value
  if (input.class === INPUT_TYPES_CLASSES.FILE) {
    const defaultFile = defaultFiles?.find(file => file.uid === defaultValue)
    return (defaultFile) ? convertToListedFile(defaultFile) : undefined
  }
    return defaultValue
}

const prepareDefaultValues = (workflow: IWorkflow, user?: IUser, stages?: Stage[], defaultFiles?: IFile[]): WorkflowRunData => {
  const defaultValues: WorkflowRunData = {
    analysisName: workflow ? workflow.name : '',
    jobLimit: user ? user.job_limit: 0,
    inputs: {},
  }

  stages?.flatMap(stage => stage.inputs).forEach(input => {
    const fieldName = `${input.parent_slot}#${input.name}`
    const defaultValue = (input.default_workflow_value === null) ? undefined : input.default_workflow_value
    if (defaultValue !== undefined) {
      if (input.class === INPUT_TYPES_CLASSES.FILE) {
        defaultValues.inputs[fieldName] = getDefaultValue(input, defaultFiles)
      } else {
        defaultValues.inputs[fieldName] = defaultValue
      }
    }
  })
  return defaultValues
}

const fetchLicensesOnFiles = (jobData: WorkflowRunData): Promise<License[]> => {
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

/**
 * At least one input needs values.id null for Stage to show
 * @param stage
 */
const hasUnfilledInputs = (stage: Stage) => {
  return !stage.inputs.find(input => input.values.id !== null)
}

const prepareValidations = (user?: IUser, stages?: Stage[], scope?: string) => {
  const inputs: any = {}
  stages?.filter(stage => hasUnfilledInputs(stage))
    .flatMap(stage => stage.inputs)
    .filter(input => !input.optional)
    .forEach(input => {
    const fieldName = `${input.parent_slot}#${input.name}`
    if (input.class === INPUT_TYPES_CLASSES.BOOLEAN) {
      inputs[fieldName] = Yup.boolean().nullable().required(`${getLabel(input)} is required`)
    } else if (input.class === INPUT_TYPES_CLASSES.FILE) {
      inputs[fieldName] = Yup.object().nullable().required(`${getLabel(input)} is required`)
    } else {
      inputs[fieldName] = Yup.string().nullable().required(`${getLabel(input)} is required`)
    }
  })

  const spaceValidations =
    scope && ['private', 'public'].includes(scope)
      ? Yup.object().nullable()
      : Yup.object().nullable().required('Scope is required')

  const validationObject = {
    analysisName: Yup.string().required('Analysis name required'),
    jobLimit: Yup.number().required('Execution cost limit required')
      .positive().typeError('You must specify a number')
      .max(user?.job_limit ?? 99, `Maximum job limit for current user is ${user?.job_limit ?? 99}`),
    inputs: Yup.object().shape(inputs),
    spaceScope: spaceValidations,
  }

  return Yup.object().shape(validationObject)
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

const WorkflowStage = ({ app, stage, errors, isSubmitting, control, register, defaultFiles }:
  { app: any, stage: Stage, errors: any, isSubmitting: boolean,
    control: Control<any>, register: UseFormRegister<any>, defaultFiles?: IFile[]}) => {

  return (<> {hasUnfilledInputs(stage) &&
    <>
      <StyledStageHeader key={stage.app_uid}><GearIcon height={14} />&nbsp;{stage.name}</StyledStageHeader>
      {stage.inputs.map(input => {
        const inputSpec: InputSpec = app.spec.input_spec.find(input_spec  => input_spec.name === input.name)
        return <FieldGroup key={input.name} label={getLabel(input)} required={!input.optional}>
          <JobRunInput
            fieldName={`inputs[${input.parent_slot}#${input.name}]`}
            defaultValue={getDefaultValue(input, defaultFiles)}
            type={input.class}
            choices={inputSpec.choices}
            helpText={inputSpec.help}
            errors={errors}
            disabled={isSubmitting}
            control={control}
            register={register} />
        </FieldGroup>
      },
      )}
    </>}
  </>)
}

const createRequestObject = (workflowId: string, vals: WorkflowRunData, stages?: Stage[]): RunWorkflowRequest => {
  const classes = new Map<string, string>(stages?.flatMap(stage => stage.inputs)
    .map(input => [`${input.parent_slot}#${input.name}`, input.class]))
  const inputs: RunWorkflowInput[] = []

  Object.keys(vals.inputs).forEach(key => {
    const value = vals.inputs[key]
    if (value) {
      const input: RunWorkflowInput = {
        input_name: key.replace('#', '.'),
        input_value: (typeof value === 'object') ? (value as ListedFile).uid : value,
        class: classes.get(key) ?? '',
      }
      inputs.push(input)
    }
  })

  return {
    workflow_id: workflowId,
    name: vals.analysisName,
    job_limit: vals.jobLimit,
    space_id: vals.spaceScope?.value,
    inputs,
  } as RunWorkflowRequest
}

const WorkflowRun = (
  { workflow, meta, defaultFiles, user }:
    { workflow: IWorkflow, meta: any, defaultFiles?: IFile[], user: IUser },
) => {
  const { stages }: { stages: Stage[] } = meta.spec.input_spec
  const { apps }: { apps: [] } = meta
  const history = useHistory()
  const defaultValues = prepareDefaultValues(workflow, user, stages, defaultFiles)
  const validationSchema = prepareValidations(user, stages, workflow.scope)

  const { data: selectableSpaces } = useQuery(
    ['selectable-spaces', workflow.scope],
    () => fetchAndConvertSelectableSpaces(workflow.scope),
    {
      onError: () => {
        toast.error('Error loading spaces')
      },
    },
  )

  const { modalComp: licensesModal, setLicensesAndShow } = useAcceptLicensesModal()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    trigger,
  } = useForm<WorkflowRunData>({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
    defaultValues,
  })

  const runWorkflowMutation = useMutation({
    mutationFn: (payload: RunWorkflowRequest) => runWorkflow(payload),
    onSuccess: (res) => {
      if (res?.id) {
        const spaceId = getValues().spaceScope?.value
        if (spaceId) {
          history.push(`/spaces/${spaceId}/executions`)
        } else {
          history.push(`/home/workflows/${workflow.uid}/jobs`)
        }
      } else if (res?.error) {
          toast.error(res.error.message)
        } else {
          toast.error('Something went wrong!')
        }
    },
    onError: () => {
      toast.error('Error: Running workflow.')
    },
  })

  const onSubmit = async () => {
    const valid = await trigger()
    if (valid) {
      try {
        const r = await Promise.all([
          fetchLicensesOnWorkflow(workflow.uid),
          fetchLicensesOnFiles(getValues()),
        ])

        const acceptedLicenses = await fetchAcceptedLicenses()
        const licensesToAccept = getLicensesToAccept(r.flat(), acceptedLicenses)
        if (licensesToAccept.length > 0) {
          setLicensesAndShow(licensesToAccept, acceptedLicenses)
        } else {
          const req = createRequestObject(workflow.uid, getValues(), stages)
          await runWorkflowMutation.mutateAsync(req)
        }
      } catch (e) {
        toast.error('Failed to run workflow')
      }
    }
  }

  const workflowTitle = workflow.title ? workflow.title : workflow.name
  const spaceId = getSpaceIdFromScope(workflow.scope)
  const baseLink = spaceId ? `spaces/${spaceId}` : 'home'

  return (
    <DefaultLayout>
      {licensesModal}
      <Topbox>
        <StyledBackLink linkTo={`/${baseLink}/workflows/${workflow.uid}`}>
          Back to Workflow
        </StyledBackLink>
        <TopboxItem>
          <Title>
            <CubeIcon height={20} />
            <span>Run Workflow:</span>
            <span>{workflowTitle}</span>
          </Title>
        </TopboxItem>
      </Topbox>
      <StyledForm id="submitWorkflowForm" autoComplete="off">
        <WorkflowConfiguration>
          <Section>
            <SectionHeader>
              CONFIGURE
            </SectionHeader>
            <SectionBody>
              <StyledLine>
                <StyledAnalysisName>
                  <FieldGroup label="Analysis Name" required >
                    <InputText label="analysisName"
                      {...register('analysisName')}
                      disabled={isSubmitting}
                    />
                    <ErrorMessageForField errors={errors} fieldName="jobName" />
                  </FieldGroup>
                </StyledAnalysisName>
                <FieldGroup label="Cost Execution Limit" required >
                  <InputText label="jobLimit" type="number"
                    {...register('jobLimit')}
                    disabled={isSubmitting}
                  />
                  <ErrorMessageForField errors={errors} fieldName="jobLimit" />
                </FieldGroup>
              </StyledLine>
              {workflow.scope && workflow.scope.startsWith('space-') && (
                <WrapSelect>
                  <FieldGroup label="Space scope" required>
                    <Controller
                      name="spaceScope"
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
                      fieldName="spaceScope"
                    />
                  </FieldGroup>
                </WrapSelect>
              )}
            </SectionBody>
          </Section>
          <Section>
            <SectionHeader>
              INPUTS
            </SectionHeader>
            <SectionBody>
              {stages?.map(stage => <WorkflowStage key={stage.stageIndex} stage={stage} errors={errors}
                app={apps.find(app => app.dxid === stage.app_dxid)} control={control} register={register} isSubmitting={isSubmitting}
                defaultFiles={defaultFiles} />)}
            </SectionBody>
          </Section>
        </WorkflowConfiguration>
        <ButtonSolidBlue
          disabled={isSubmitting}
          type="submit" form="submitJobForm" onClick={handleSubmit(onSubmit)}>
          {isSubmitting ? 'Running' : 'Run Workflow'}
        </ButtonSolidBlue>
      </StyledForm>
    </DefaultLayout>
  )
}

const fetchDefaultFiles = (meta: any): Promise<{ files: IFile, meta: any }[]> => {
  const promises: Promise<{ files: IFile, meta: any }>[] = []
  meta.spec.input_spec.stages.forEach((stage: Stage) => {
    if (hasUnfilledInputs(stage)) {
      stage.inputs.forEach(input => {
        if (input.class === INPUT_TYPES_CLASSES.FILE && input.default_workflow_value) {
          const promise = fetchFile(input.default_workflow_value as string)
          promises.push(promise)
        }
      })
    }
  })
  return Promise.all(promises)
}

export const WorkflowRunForm = () => {
  const { workflowUid } = useParams<{ workflowUid: string }>()
  const { data: workflowData, status: loadingWorkflowStatus } = useQuery(['workflow', workflowUid], () =>
    fetchWorkflow(workflowUid),
  )

  const { data: defaultFilesData, status: defaultFilesLoading } = useQuery(['default-files'], () =>
    fetchDefaultFiles(workflowData?.meta),
    {
      enabled: loadingWorkflowStatus === 'success', onError: () => {
        toast.error('Error loading default files')
      },
    },
  )

  const user = useAuthUser()

  if (loadingWorkflowStatus === 'loading' || defaultFilesLoading === 'loading' || !user) {
    return <HomeLoader />
  }

  const workflow = workflowData?.workflow
  const meta = workflowData?.meta
  const defaultFiles: IFile[] | undefined = defaultFilesData?.map(data => data.files)

  if (!workflow)
  return (
    <NotFound>
      <h1>Workflow not found</h1>
      <div>Sorry, this workflow does not exist or is not accessible by you.</div>
    </NotFound>
  )

  return (
    <WorkflowRun workflow={workflow} meta={meta} defaultFiles={defaultFiles} user={user} />
  )
}
