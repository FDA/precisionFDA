import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Controller, FieldErrors, useFieldArray, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from 'react-toastify'
import { AppSpec, BatchInput, RunJobFormType, IApp } from '../apps.types'
import { IUser } from '../../../types/user'
import { QuestionIcon } from '../../../components/icons/QuestionIcon'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { InputNumber, InputText } from '../../../components/InputText'
import { ErrorMessageForField } from './ErrorMessageForField'
import {
  AppsConfiguration,
  RightGroup,
  Section,
  SectionBody,
  SectionHeader,
  StyledActionsContainer,
  StyledForm,
  StyledJobName,
  StyledRow,
  TipsRow,
  RemoveButton,
} from './styles'
import {
  buildPath,
  createRequestObject, exportFormData, extractFileUidsFromBatchInputs,
  fetchLicensesOnFiles,
  getFileUIDsFromAppRun,
  getLabel,
  getLicensesToAccept, importFormData,
  mapInputKeyVals, prepareValidations,
  useDefaultInstanceType, useDefaultScopeSelection,
  useSelectableContexts,
  useSelectableSpaces,
  useUserComputeInstances,
} from './utils'
import { fetchLicensesOnApp } from '../apps.api'
import { JobRunInput } from './JobRunInput'
import { EmptyTable } from '../../../components/Table/styles'
import { fetchAcceptedLicenses } from '../../licenses/api'
import { useAcceptLicensesModal } from '../../licenses/useAcceptLicensesModal'
import { TreeOnSelectInfo } from '../../files/files.types'
import { ServerScope } from '../../home/types'
import { getDefaultValueFromServer } from '../form/common'
import { useOrganizeFileModal } from '../../files/actionModals/useOrganizeFileModal'
import { useRunJobMutation } from './useRunJobMutation'
import { Button, TransparentButton } from '../../../components/Button'
import { useExportInputsModal } from './useExportInputsModal'
import { SetOutputFolder } from './SetOutputFolder'
import { SelectContext } from './SelectContext'
import { SelectSpaceScope } from './SelectSpaceScope'
import { SelectInstanceType } from './SelectInstanceType'
import { CrossIcon } from '../../../components/icons/PlusIcon'

export const RunJobForm = ({ app, userJobLimit, spec }: { app: IApp; spec: AppSpec; userJobLimit: IUser['job_limit'] }) => {
  const { data: computeInstances, isLoading: computeInstancesLoading } = useUserComputeInstances()
  const { data: selectableContexts } = useSelectableContexts(app.scope, app.entity_type)
  const { data: selectableSpaces } = useSelectableSpaces(app.scope)
  const { hash, pathname } = useLocation()
  const navigate = useNavigate()

  const { modalComp: licensesModal, setLicensesAndShow } = useAcceptLicensesModal()

  let defaultValues = {
    jobName: app.name,
    jobLimit: userJobLimit,
    output_folder_path: '',
    scope: { label: 'Private', value: 'private' },
    inputs: [
      {
        id: 1,
        fields: Object.fromEntries(spec.input_spec.map(item => [item.name, getDefaultValueFromServer(item.class, item.default)])),
      } as BatchInput,
    ],
  } satisfies RunJobFormType

  if (hash.startsWith('#')) {
    const base64Encoded = hash.split('#')[1]
    const decoded = atob(base64Encoded)
    const inputs = JSON.parse(decoded)
    defaultValues = { ...defaultValues, inputs }
    navigate(pathname, { replace: true })
  }

  const validationSchema = prepareValidations(spec.input_spec, userJobLimit, app.scope)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    trigger,
    setValue,
    watch,
    reset,
  } = useForm<RunJobFormType>({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
    defaultValues,
  })

  const { modalComp: organizeFileModal, setShowModal: setOrganizeFileModal } = useOrganizeFileModal({
    headerText: 'Select output folder',
    submitCaption: 'Select folder',
    scope: app.scope === 'public' ? 'private' : app.scope, // show private folders for public apps
    onHandleSubmit: (folderId, info: TreeOnSelectInfo) => {
      const outputFolderPath = buildPath(info.node)
      setValue('output_folder_path', outputFolderPath)
      setOrganizeFileModal(false)
    },
  })
  
  useDefaultInstanceType(computeInstances, spec.instance_type, setValue)
  useDefaultScopeSelection(selectableSpaces, app.scope, setValue)

  const inputs = useFieldArray({
    control,
    name: 'inputs',
  })
  const isBatchRun = inputs.fields.length > 1
  const runButtonText = isBatchRun ? 'Run Batch App' : 'Run App'

  const addInput = () => {
    if (computeInstances) {
      const lastId = getValues().inputs[getValues().inputs.length - 1].id ?? 0
      inputs.append({
        instanceType: computeInstances[0],
        id: lastId + 1,
        fields: Object.fromEntries(spec.input_spec.map(item => [item.name, getDefaultValueFromServer(item.class, item.default)])),
      }, { shouldFocus: false })
    }
  }

  const removeInput = (index: number) => {
    inputs.remove(index)
  }

  const runJobMutation = useRunJobMutation(getValues().scope?.value as ServerScope)
  const exportModal = useExportInputsModal({ showCopyButton: true })

  const onSubmit = async () => {
    const vals = getValues()
    const valid = await trigger()

    if (valid) {
      const r = await Promise.all([
        fetchLicensesOnApp(app.uid),
        fetchLicensesOnFiles(extractFileUidsFromBatchInputs(vals.inputs)),
      ])

      const acceptedLicenses = await fetchAcceptedLicenses()
      const licensesToAccept = getLicensesToAccept(r.flat(), acceptedLicenses)
      if (licensesToAccept.length > 0) {
        setLicensesAndShow(licensesToAccept, acceptedLicenses)
      } else {
        const mutations = vals.inputs.map((batchInput, index) => {
          const req = createRequestObject(
            isBatchRun ? `${vals.jobName} (${index + 1} of ${vals.inputs.length})` : vals.jobName,
            vals.jobLimit,
            vals.output_folder_path,
            batchInput.instanceType.value,
            vals.scope.value as ServerScope,
            batchInput.fields,
            app,
            spec.input_spec,
          )
          return runJobMutation.mutateAsync(req)
        })
        await Promise.all(mutations).then(data => {
          if (data[0].id) {
            if (vals.scope.value === 'private') {
              if (isBatchRun) {
                navigate(`/home/apps/${app.uid}/jobs`)
              } else {
                navigate(`/home/executions/${data[0].id}`)
              }
            } else {
              const spaceId = vals.scope.value.replace('space-', '')
              if (isBatchRun) {
                navigate(`/spaces/${spaceId}/apps/${app.uid}/jobs`)
              } else {
                navigate(`/spaces/${spaceId}/executions/${data[0].id}`)
              }
            }
          } else if (res?.error) {
            toast.error(res.error.message)
          } else {
            toast.error('Something went wrong!')
          }
        })
      }
    }
  }

  const handleImportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    document.getElementById('fileInput')?.click()
  }

  const handleExportInputClick = () => {
    const vals = getValues()
    const fmtVals = mapInputKeyVals(vals.inputs, spec.input_spec)
    const fileUids = getFileUIDsFromAppRun(vals.inputs, spec.input_spec)

    exportModal.openModal(fmtVals, fileUids)
  }

  return (
    <StyledForm id="submitJobForm" autoComplete="off">
      {exportModal?.modalComp}
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
                  <InputText {...register('jobName')} disabled={isSubmitting} />
                  <ErrorMessageForField errors={errors as FieldErrors<Record<string, unknown>>} fieldName="jobName" />
                </FieldGroup>
              </StyledJobName>
              <FieldGroup label="Execution Cost Limit ($)" required>
                <InputNumber min="0" step="10" {...register('jobLimit')} disabled={isSubmitting} />
                <ErrorMessageForField errors={errors as FieldErrors<Record<string, unknown>>} fieldName="jobLimit" />
              </FieldGroup>
            </StyledRow>
            <StyledRow>
              {app.entity_type === 'https' && (
                <SelectContext
                  control={control}
                  isSubmitting={isSubmitting}
                  selectableContexts={selectableContexts}
                  errors={errors}
                />
              )}
              {app.scope.startsWith('space-') && (
                <SelectSpaceScope
                  control={control}
                  isSubmitting={isSubmitting}
                  selectableSpaces={selectableSpaces}
                  errors={errors}
                />
              )}
              {!isBatchRun && (
                <SelectInstanceType
                  control={control}
                  selectedInstance={watch().inputs[0].instanceType}
                  name={'inputs.0.instanceType' as keyof RunJobFormType}
                  jobLimit={userJobLimit}
                  isSubmitting={isSubmitting}
                  computeInstances={computeInstances}
                  isComputeInstancesLoading={computeInstancesLoading}
                  errors={errors}
                  inputId="select_instance_type"
                />
              )}
            </StyledRow>
          </SectionBody>
        </Section>
      </AppsConfiguration>
      <AppsConfiguration>
        {inputs.fields.map((batchInput, batchIndex) => (
          <Section key={batchInput.id} data-testid={`batch_group_${batchIndex}`}>
            <SectionHeader>
              {isBatchRun ? (
                <>
                  <div>
                    BATCH INPUT {batchIndex + 1} of {inputs.fields.length}
                  </div>
                  <RemoveButton disabled={isSubmitting} type="button" onClick={() => removeInput(batchIndex)}>
                    <CrossIcon height={14} />
                  </RemoveButton>
                </>
              ) : (
                <>
                  <div>INPUTS</div>
                  <TransparentButton type="button" onClick={() => handleExportInputClick()}>
                    Export Values
                  </TransparentButton>
                </>
              )}
            </SectionHeader>
            <SectionBody>
              {isBatchRun && (
                <SelectInstanceType
                  control={control}
                  selectedInstance={watch().inputs[batchIndex].instanceType}
                  name={`inputs.${batchIndex}.instanceType` as keyof RunJobFormType}
                  jobLimit={userJobLimit}
                  isSubmitting={isSubmitting}
                  computeInstances={computeInstances}
                  isComputeInstancesLoading={computeInstancesLoading}
                  errors={errors}
                  inputId={`select_instance_type_${batchIndex}`}
                />
              )}
              {spec.input_spec.length > 0 ? (
                spec.input_spec.map(inputSpec => {
                  return (
                    <Controller
                      key={`${inputSpec.name}-${batchInput.id}`}
                      control={control}
                      name={`inputs.${batchIndex}.fields.${inputSpec.name}`}
                      render={({ field }) => (
                        <FieldGroup
                          label={getLabel(inputSpec)}
                          required={!inputSpec.optional}
                          key={inputSpec.name + inputSpec}
                        >
                          <JobRunInput
                            key={inputSpec.name + inputSpec}
                            field={field}
                            inputSpec={inputSpec}
                            errors={errors as FieldErrors<Record<string, unknown>>}
                            disabled={isSubmitting}
                            register={register}
                            scope={app.entity_type === 'https' ? watch().scope?.value : app.scope}
                          />
                        </FieldGroup>
                      )}
                    />
                  )
                })
              ) : (
                <EmptyTable>App has no inputs.</EmptyTable>
              )}
            </SectionBody>
          </Section>
        ))}
        <SetOutputFolder control={control} isSubmitting={isSubmitting} spec={spec} setShowModal={setOrganizeFileModal} />
      </AppsConfiguration>
      <StyledActionsContainer>
        <RightGroup>
          {computeInstances && (
            <Button variant="primary" disabled={isSubmitting} type="button" onClick={addInput}>
              Add batch
            </Button>
          )}
          {isBatchRun && (
            <>
              <Button variant="success" disabled={isSubmitting}  type="button" onClick={event => exportFormData(event, getValues())}>
                Export Inputs
              </Button>

              <input type="file" style={{ display: 'none' }} id="fileInput" onChange={event => importFormData(event, (vals) => reset(vals))} />
              <Button variant="success" disabled={isSubmitting}  type="button" onClick={handleImportClick}>
                Import Inputs
              </Button>
            </>
          )}
        </RightGroup>
        <Button variant="primary" disabled={isSubmitting} type="button" form="submitJobForm" onClick={handleSubmit(onSubmit)}>
          {isSubmitting ? 'Running' : runButtonText}
        </Button>
      </StyledActionsContainer>
      {licensesModal}
      {organizeFileModal}
    </StyledForm>
  )
}
