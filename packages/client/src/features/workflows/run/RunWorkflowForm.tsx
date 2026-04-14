import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery } from '@tanstack/react-query'
import { type Control, Controller, type UseFormRegister, type UseFormSetError, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import * as Yup from 'yup'
import { Button } from '@/components/Button'
import { FieldGroup } from '@/components/form/FieldGroup'
import { InputNumber, InputText } from '@/components/InputText'
import { CubeIcon } from '@/components/icons/CubeIcon'
import { GearIcon } from '@/components/icons/GearIcon'
import { toastError } from '@/components/NotificationCenter/ToastHelper'
import { BackLink } from '@/components/Page/PageBackLink'
import { FormPageContainer } from '@/components/Page/styles'
import type { IUser } from '@/types/user'
import { getSpaceIdFromScope } from '@/utils'
import type { AcceptedLicense, IApp, InputSpec, SelectType } from '../../apps/apps.types'
import { getDefaultValueFromServer } from '../../apps/form/common'
import { ErrorMessageForField } from '../../apps/run/ErrorMessageForField'
import { JobRunInput } from '../../apps/run/JobRunInput'
import { SelectSpaceScope } from '../../apps/run/SelectSpaceScope'
import { Section, SectionBody, SectionHeader, StyledGrid, Topbox, TopboxItem } from '../../apps/run/styles'
import { extractFileUids, getValue, useDefaultScopeSelection, useSelectableSpaces } from '../../apps/run/utils'
import { useAuthUser } from '../../auth/useAuthUser'
import type { FileUid } from '../../files/files.types'
import { StyledForm } from '../../home/home.styles'
import { HomeLoader, NotFound, Title } from '../../home/show.styles'
import { fetchAcceptedLicenses, fetchLicensesForFiles } from '../../licenses/api'
import type { License } from '../../licenses/types'
import { useAcceptLicensesModal } from '../../licenses/useAcceptLicensesModal'
import {
  fetchLicensesOnWorkflow,
  fetchWorkflow,
  type RunWorkflowInput,
  type RunWorkflowRequest,
  runWorkflow,
} from '../workflows.api'
import type { App, InputOutput, IWorkflow, Stage, WorkflowMeta } from '../workflows.types'
import { StyledAnalysisName, StyledStageHeader, WorkflowConfiguration } from './styles'

export interface RunWorkflowFormType {
  analysisName: string
  jobLimit: number
  scope: SelectType
  inputs: {
    // TODO add support for arrays, PFDA-5136
    [key: string]: string | boolean | FileUid | undefined
  }
}

const getLabel: (input: InputOutput) => string = (input: InputOutput) => (input.label ? input.label : input.name)

const prepareDefaultValues = (workflow: IWorkflow, user?: IUser, stages?: Stage[]): RunWorkflowFormType => {
  const defaultValues: RunWorkflowFormType = {
    analysisName: workflow ? workflow.name : '',
    jobLimit: user ? user.job_limit : 0,
    inputs: {},
  }

  stages
    ?.flatMap(stage => stage.inputs)
    .forEach(input => {
      const fieldName = `${input.parent_slot}#${input.name}`

      const defaultValue = input.default_workflow_value === null ? undefined : input.default_workflow_value
      if (defaultValue !== undefined) {
        defaultValues.inputs[fieldName] = getDefaultValueFromServer(input.class, defaultValue)
      }
    })
  return defaultValues
}

const fetchLicensesOnFiles = (jobData: RunWorkflowFormType): Promise<License[]> => {
  const uids = extractFileUids(jobData.inputs)
  if (uids.length > 0) {
    return fetchLicensesForFiles(uids)
  }
  return Promise.resolve([])
}

/**
 * At least one input needs values.id null for Stage to show
 * @param stage
 */
const hasUnfilledInputs: (stage: Stage) => boolean = (stage: Stage) => {
  return !stage.inputs.find(input => input.values.id !== null)
}

const prepareValidations = (user?: IUser, stages?: Stage[], scope?: string) => {
  const inputs: any = {}
  stages
    ?.filter(stage => hasUnfilledInputs(stage))
    .flatMap(stage => stage.inputs)
    .filter(input => !input.optional)
    .forEach(input => {
      const fieldName = `${input.parent_slot}#${input.name}`
      if (input.class === 'boolean') {
        inputs[fieldName] = Yup.boolean()
          .nullable()
          .required(`${getLabel(input)} is required`)
      } else {
        inputs[fieldName] = Yup.string()
          .nullable()
          .required(`${getLabel(input)} is required`)
      }
    })

  const spaceValidations =
    scope && ['private', 'public'].includes(scope)
      ? Yup.object().nullable()
      : Yup.object().nullable().required('Scope is required')

  const validationObject = {
    analysisName: Yup.string().required('Analysis name required'),
    jobLimit: Yup.number()
      .required('Execution cost limit required')
      .positive()
      .typeError('You must specify a number')
      .max(user?.job_limit ?? 99, `Maximum job limit for current user is ${user?.job_limit ?? 99}`),
    inputs: Yup.object().shape(inputs),
    scope: spaceValidations,
  }

  return Yup.object().shape(validationObject)
}

const getLicensesToAccept = (licensesToAccept: License[], acceptedLicenses: AcceptedLicense[]): License[] => {
  const acceptedIds = acceptedLicenses
    .filter(item => item.state === 'active' || item.state === null)
    .map(item => item.license.toString())
  return licensesToAccept.filter(license => !acceptedIds.includes(license.id.toString()))
}

const WorkflowStage = ({
  app,
  stage,
  errors,
  isSubmitting,
  control,
  register,
  setError,
}: {
  app: App
  stage: Stage
  errors: any
  isSubmitting: boolean
  control: Control<any>
  register: UseFormRegister<any>
  setError: UseFormSetError<RunWorkflowFormType>
}) => {
  return (
    <>
      {' '}
      {hasUnfilledInputs(stage) && (
        <>
          <StyledStageHeader key={stage.app_uid}>
            <GearIcon height={14} />
            &nbsp;{stage.name}
          </StyledStageHeader>
          {stage.inputs.map(input => {
            const inputSpec: InputOutput = app.spec.input_spec.find(input_spec => input_spec.name === input.name)
            return (
              <Controller
                key={inputSpec.name}
                control={control}
                name={`inputs[${input.parent_slot}#${input.name}]`}
                render={({ field }) => (
                  <FieldGroup label={getLabel(inputSpec)} required={!inputSpec.optional}>
                    <JobRunInput
                      field={field}
                      inputSpec={inputSpec}
                      errors={errors}
                      disabled={isSubmitting}
                      setError={setError}
                      register={register}
                      scope={app.scope}
                    />
                  </FieldGroup>
                )}
              />
            )
          })}
        </>
      )}
    </>
  )
}

const createRequestObject = (workflowId: string, vals: RunWorkflowFormType, stages?: Stage[]): RunWorkflowRequest => {
  const classes = new Map<string, string>(
    stages?.flatMap(stage => stage.inputs).map(input => [`${input.parent_slot}#${input.name}`, input.class]),
  )
  const inputs: RunWorkflowInput[] = []

  Object.keys(vals.inputs).forEach(key => {
    const value = vals.inputs[key]
    const stageName = key.substring(0, key.indexOf('#'))
    const inputName = key.substring(key.indexOf('#') + 1)
    const stage = stages?.find(s => s.slotId === stageName)
    const inputOutput = stage?.inputs.find(input => input.name === inputName)
    if (inputOutput !== undefined) {
      const inputSpec: InputSpec = {
        default: null,
        choices: null,
        class: inputOutput.class,
        help: '',
        name: inputOutput.name,
      }
      const input: RunWorkflowInput = {
        input_name: key.replace('#', '.'),
        input_value: getValue(inputName, value, [inputSpec]),
        class: classes.get(key) ?? '',
      }

      inputs.push(input)
    }
  })

  return {
    workflow_id: workflowId,
    name: vals.analysisName,
    job_limit: vals.jobLimit,
    space_id: vals.scope.value,
    inputs,
  } as RunWorkflowRequest
}

const RunWorkflowForm = ({ workflow, meta, user }: { workflow: IWorkflow; meta: WorkflowMeta; user: IUser }) => {
  const { stages }: { stages: Stage[] } = meta.spec.input_spec
  const { apps }: { apps: App[] } = meta
  const navigate = useNavigate()
  const defaultValues = prepareDefaultValues(workflow, user, stages)
  const validationSchema = prepareValidations(user, stages, workflow.scope)

  const { data: selectableSpaces } = useSelectableSpaces(workflow.scope)
  const { modalComp: licensesModal, setLicensesAndShow } = useAcceptLicensesModal()

  const {
    control,
    register,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    setValue,
    trigger,
  } = useForm<RunWorkflowFormType>({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
    defaultValues,
  })

  useDefaultScopeSelection(getValues(), selectableSpaces, workflow.scope, setValue)

  const runWorkflowMutation = useMutation({
    mutationFn: (payload: RunWorkflowRequest) => runWorkflow(payload),
    onSuccess: res => {
      if (res?.id) {
        const scope = getValues().scope.value
        if (scope.includes('space-')) {
          const spaceId = scope.replace('space-', '')
          navigate(`/spaces/${spaceId}/executions`)
        } else {
          navigate(`/home/workflows/${workflow.uid}/jobs`)
        }
      } else if (res?.error) {
        toastError(res.error.message)
      } else {
        toastError('Something went wrong')
      }
    },
    onError: () => {
      toastError('Error: Running workflow')
    },
  })

  const onSubmit: () => Promise<void> = async () => {
    const valid = await trigger()

    if (valid) {
      try {
        const r = await Promise.all([fetchLicensesOnWorkflow(workflow.uid), fetchLicensesOnFiles(getValues())])

        const acceptedLicenses = await fetchAcceptedLicenses()
        const licensesToAccept = getLicensesToAccept(r.flat(), acceptedLicenses)
        if (licensesToAccept.length > 0) {
          setLicensesAndShow(licensesToAccept, acceptedLicenses)
        } else {
          const req = createRequestObject(workflow.uid, getValues(), stages)
          await runWorkflowMutation.mutateAsync(req)
        }
      } catch {
        toastError('Failed to run workflow')
      }
    }
  }

  return (
    <>
      {licensesModal}

      <StyledForm id="submitWorkflowForm" autoComplete="off">
        <WorkflowConfiguration>
          <Section>
            <SectionHeader>CONFIGURE</SectionHeader>
            <SectionBody>
              <StyledGrid>
                <StyledAnalysisName>
                  <FieldGroup label="Analysis Name" required>
                    <InputText {...register('analysisName')} disabled={isSubmitting} />
                    <ErrorMessageForField errors={errors} fieldName="jobName" />
                  </FieldGroup>
                </StyledAnalysisName>
                <FieldGroup label="Execution Cost Limit ($)" required>
                  <InputNumber {...register('jobLimit')} disabled={isSubmitting} />
                  <ErrorMessageForField errors={errors} fieldName="jobLimit" />
                </FieldGroup>
                {workflow.scope?.startsWith('space-') && (
                  <SelectSpaceScope
                    control={control}
                    isSubmitting={isSubmitting}
                    selectableSpaces={selectableSpaces}
                    errors={errors}
                  />
                )}
              </StyledGrid>
            </SectionBody>
          </Section>
          <Section>
            <SectionHeader>INPUTS</SectionHeader>
            <SectionBody>
              {stages?.map(stage => (
                <WorkflowStage
                  key={stage.stageIndex}
                  stage={stage}
                  errors={errors}
                  app={apps.find(app => app.dxid === stage.app_dxid)}
                  control={control}
                  register={register}
                  setError={setError}
                  isSubmitting={isSubmitting}
                />
              ))}
            </SectionBody>
          </Section>
        </WorkflowConfiguration>
        <Button
          data-variant="primary"
          disabled={isSubmitting}
          type="submit"
          form="submitJobForm"
          onClick={handleSubmit(onSubmit)}
        >
          {isSubmitting ? 'Running' : 'Run Workflow'}
        </Button>
      </StyledForm>
    </>
  )
}

const WorkflowRunPage = () => {
  const { workflowUid } = useParams<{ workflowUid: string }>()
  const { data: workflowData, isLoading: loadingWorkflowIsLoading } = useQuery({
    queryKey: ['workflow', workflowUid],
    enabled: !!workflowUid,
    queryFn: () => fetchWorkflow(workflowUid!),
  })

  const user = useAuthUser()

  if (loadingWorkflowIsLoading || !user) {
    return <HomeLoader />
  }

  const workflow = workflowData?.workflow
  const meta = workflowData?.meta

  if (!workflow || !meta)
    return (
      <NotFound>
        <h1>Workflow not found</h1>
        <div>Sorry, this workflow does not exist or is not accessible by you.</div>
      </NotFound>
    )

  const workflowTitle = workflow.title ? workflow.title : workflow.name
  const spaceId = getSpaceIdFromScope(workflow.scope)
  const baseLink = spaceId ? `spaces/${spaceId}` : 'home'

  return (
    <FormPageContainer>
      <Topbox>
        <BackLink linkTo={`/${baseLink}/workflows/${workflow.uid}`}>Back to Workflow</BackLink>
        <TopboxItem>
          <Title>
            <CubeIcon height={20} />
            <span>Run Workflow:</span>
            <span>{workflowTitle}</span>
          </Title>
        </TopboxItem>
      </Topbox>
      <RunWorkflowForm workflow={workflow} meta={meta} user={user} />
    </FormPageContainer>
  )
}

export default WorkflowRunPage
