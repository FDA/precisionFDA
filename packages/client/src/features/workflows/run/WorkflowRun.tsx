import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import { Control, Controller, useForm, UseFormRegister } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  fetchLicensesOnWorkflow,
  fetchWorkflow,
  runWorkflow,
  RunWorkflowInput,
  RunWorkflowRequest,
} from '../workflows.api'
import { InputOutput, IWorkflow, Stage } from '../workflows.types'
import { InputNumber, InputText } from '../../../components/InputText'
import { HomeLoader, NotFound, Title } from '../../home/show.styles'
import { CubeIcon } from '../../../components/icons/CubeIcon'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { JobRunInput } from '../../apps/run/JobRunInput'
import { AcceptedLicense, InputSpec, SelectType } from '../../apps/apps.types'
import {
  Section,
  SectionBody,
  SectionHeader,
  StyledLine,
  Topbox,
  TopboxItem,
  WrapSingleField,
} from '../../apps/run/styles'
import { StyledForm } from '../../home/home.styles'
import { StyledAnalysisName, StyledStageHeader, WorkflowConfiguration } from './styles'
import { GearIcon } from '../../../components/icons/GearIcon'
import { fetchAcceptedLicenses, fetchLicensesForFiles } from '../../licenses/api'
import { License } from '../../licenses/types'
import { useAcceptLicensesModal } from '../../licenses/useAcceptLicensesModal'
import { useAuthUser } from '../../auth/useAuthUser'
import { getSpaceIdFromScope } from '../../../utils'
import { IUser } from '../../../types/user'
import { fetchAndConvertSelectableSpaces } from '../../apps/run/job-run-helper'
import { IAccessibleFile } from '../../databases/databases.api'
import { FileUid } from '../../files/files.types'
import { FormPageContainer } from '../../../components/Page/styles'
import { BackLink } from '../../../components/Page/PageBackLink'
import { extractFileUids, getValue } from '../../apps/run/utils'
import { getDefaultValueFromServer } from '../../apps/form/common'
import { Select } from '../../../components/Select'
import { Button } from '../../../components/Button'
import { ErrorMessageForField } from '../../apps/run/ErrorMessageForField'

export interface WorkflowRunData {
  analysisName: string;
  jobLimit: number;
  spaceScope?: SelectType | null;
  inputs: { // TODO add support for arrays, PFDA-5136
    [key: string]: string | boolean | FileUid | undefined,
  };
}

const getLabel = (input: InputOutput) =>
  input.label ? input.label : input.name

const prepareDefaultValues = (workflow: IWorkflow, user?: IUser, stages?: Stage[]): WorkflowRunData => {
  const defaultValues: WorkflowRunData = {
    analysisName: workflow ? workflow.name : '',
    jobLimit: user ? user.job_limit: 0,
    inputs: {},
  }

  stages?.flatMap(stage => stage.inputs).forEach(input => {
    const fieldName = `${input.parent_slot}#${input.name}`

    const defaultValue = (input.default_workflow_value === null) ? undefined : input.default_workflow_value
    if (defaultValue !== undefined) {
        defaultValues.inputs[fieldName] = getDefaultValueFromServer(input.class, defaultValue)
    }
  })
  return defaultValues
}

const fetchLicensesOnFiles = (jobData: WorkflowRunData): Promise<License[]> => {
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
    if (input.class === 'boolean') {
      inputs[fieldName] = Yup.boolean().nullable().required(`${getLabel(input)} is required`)
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
  return licensesToAccept.filter(
    license => !acceptedIds.includes(license.id.toString()),
  )
}

const WorkflowStage = ({ app, stage, errors, isSubmitting, control, register }:
  { app: any, stage: Stage, errors: any, isSubmitting: boolean,
    control: Control<any>, register: UseFormRegister<any>}) => {

  return (<> {hasUnfilledInputs(stage) &&
    <>
      <StyledStageHeader key={stage.app_uid}><GearIcon height={14} />&nbsp;{stage.name}</StyledStageHeader>
      {stage.inputs.map(input => {
        const inputSpec: InputSpec = app.spec.input_spec.find(input_spec => input_spec.name === input.name)
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
                  register={register}
                  scope={app.scope}
                  />
              </FieldGroup>
            )}
          />
        )
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
    const stageName = key.substring(0, key.indexOf('#'))
    const inputName = key.substring(key.indexOf('#') + 1)
    const stage = stages?.find(s => s.slotId === stageName)
    const inputOutput = stage?.inputs.find(input => input.name === inputName)
    if (inputOutput !== undefined) {
      const inputSpec: InputSpec = { default: null, choices: null, class: inputOutput.class, help: '', name: inputOutput.name }
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
    space_id: vals.spaceScope?.value,
    inputs,
  } as RunWorkflowRequest
}

const WorkflowRun = (
  { workflow, meta, user }:
    { workflow: IWorkflow, meta: any, user: IUser },
) => {
  const { stages }: { stages: Stage[] } = meta.spec.input_spec
  const { apps }: { apps: [] } = meta
  const navigate = useNavigate()
  const defaultValues = prepareDefaultValues(workflow, user, stages)
  const validationSchema = prepareValidations(user, stages, workflow.scope)

  const { data: selectableSpaces } = useQuery({
    queryKey: ['selectable-spaces', workflow.scope],
    queryFn: () => fetchAndConvertSelectableSpaces(workflow.scope).catch(() => toast.error('Error loading spaces')),
  })

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
        const spaceScope = getValues().spaceScope?.value
        if (spaceScope) {
          const spaceId = spaceScope.replace('space-', '')
          navigate(`/spaces/${spaceId}/executions`)
        } else {
          navigate(`/home/workflows/${workflow.uid}/jobs`)
        }
      } else if (res?.error) {
          toast.error(res.error.message)
        } else {
          toast.error('Something went wrong')
        }
    },
    onError: () => {
      toast.error('Error: Running workflow')
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

  return (
    <>
      {licensesModal}

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
                    <InputText
                      {...register('analysisName')}
                      disabled={isSubmitting}
                    />
                    <ErrorMessageForField errors={errors} fieldName="jobName" />
                  </FieldGroup>
                </StyledAnalysisName>
                <FieldGroup label="Cost Execution Limit" required >
                  <InputNumber
                    {...register('jobLimit')}
                    disabled={isSubmitting}
                  />
                  <ErrorMessageForField errors={errors} fieldName="jobLimit" />
                </FieldGroup>
              </StyledLine>
              {workflow.scope && workflow.scope.startsWith('space-') && (
                <WrapSingleField>
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
                          inputId="select_context"
                        />
                      )}
                    />
                    <ErrorMessageForField
                      errors={errors}
                      fieldName="spaceScope"
                    />
                  </FieldGroup>
                </WrapSingleField>
              )}
            </SectionBody>
          </Section>
          <Section>
            <SectionHeader>
              INPUTS
            </SectionHeader>
            <SectionBody>
              {stages?.map(stage => <WorkflowStage key={stage.stageIndex} stage={stage} errors={errors}
                app={apps.find(app => app.dxid === stage.app_dxid)} control={control} register={register} isSubmitting={isSubmitting} />)}
            </SectionBody>
          </Section>
        </WorkflowConfiguration>
        <Button
          data-variant="primary"
          disabled={isSubmitting}
          type="submit" form="submitJobForm" onClick={handleSubmit(onSubmit)}>
          {isSubmitting ? 'Running' : 'Run Workflow'}
        </Button>
      </StyledForm>
    </>
  )
}

const WorkflowRunPage = () => {
  const { workflowUid } = useParams<{ workflowUid: string }>()
  const { data: workflowData, isLoading: loadingWorkflowIsLoading, isSuccess: loadingWorkflowIsSuccess } = useQuery({
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

  const workflowTitle = workflow.title ? workflow.title : workflow.name
  const spaceId = getSpaceIdFromScope(workflow.scope)
  const baseLink = spaceId ? `spaces/${spaceId}` : 'home'

  if (!workflow)
  return (
    <NotFound>
      <h1>Workflow not found</h1>
      <div>Sorry, this workflow does not exist or is not accessible by you.</div>
    </NotFound>
  )

  return (
  <FormPageContainer>
    <Topbox>
      <BackLink linkTo={`/${baseLink}/workflows/${workflow.uid}`}>
        Back to Workflow
      </BackLink>
      <TopboxItem>
        <Title>
          <CubeIcon height={20} />
          <span>Run Workflow:</span>
          <span>{workflowTitle}</span>
        </Title>
      </TopboxItem>
    </Topbox>
    <WorkflowRun workflow={workflow} meta={meta} user={user} />
  </FormPageContainer>
  )
}

export default WorkflowRunPage
