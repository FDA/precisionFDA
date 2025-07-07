import { yupResolver } from '@hookform/resolvers/yup'
import React, { useState } from 'react'
import { Controller, FieldErrors, useFieldArray, useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Button, TransparentButton } from '../../../components/Button'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { CrossIcon } from '../../../components/icons/PlusIcon'
import { QuestionIcon } from '../../../components/icons/QuestionIcon'
import { InputNumber, InputText } from '../../../components/InputText'
import { IUser } from '../../../types/user'
import { useSelectFolderModal } from '../../files/actionModals/useSelectFolderModal'
import { TreeOnSelectInfo } from '../../files/files.types'
import { Empty } from '../../home/home.styles'
import { ServerScope } from '../../home/types'
import { fetchAcceptedLicenses } from '../../licenses/api'
import { useAcceptLicensesModal } from '../../licenses/useAcceptLicensesModal'
import { SavingModal } from '../../modal/SavingModal'
import { fetchLicensesOnApp } from '../apps.api'
import { AppSpec, BatchInput, IApp, RunJobFormType } from '../apps.types'
import { getDefaultValueFromServer } from '../form/common'
import { ErrorMessageForField } from './ErrorMessageForField'
import { JobRunInput } from './JobRunInput'
import { SelectContext } from './SelectContext'
import { SelectInstanceType } from './SelectInstanceType'
import { SelectSpaceScope } from './SelectSpaceScope'
import { SetOutputFolder } from './SetOutputFolder'
import {
  AppsConfiguration,
  RemoveButton,
  RightGroup,
  Section,
  SectionBody,
  SectionHeader,
  StyledActionsContainer,
  StyledForm,
  StyledGrid,
  StyledJobName,
  TipsRow,
} from './styles'
import { useExportInputsModal } from './useExportInputsModal'
import { useRunJobMutation } from './useRunJobMutation'
import {
  collectFileUidsFromBatchInput,
  createRequestObject,
  exportFormData,
  extractFileUidsFromBatchInputs,
  fetchLicensesOnFiles,
  getFileUIDsFromAppRun,
  getLabel,
  getLicensesToAccept,
  mapInputKeyVals,
  prepareValidations,
  useDefaultInstanceType,
  useDefaultScopeSelection,
  useSelectableContexts,
  useSelectableSpaces,
  useUserComputeInstances,
  validateFile,
} from './utils'

/**
 * If params are specified in the URL, decode them and set them as default values.
 * Otherwise, use defaults on spec.
 *
 * @param hash
 * @param opts
 */
const getDefaults = (hash: string, opts: { app: IApp; spec: AppSpec; userJobLimit: IUser['job_limit'] }): RunJobFormType => {
  const base64Encoded = hash.split('#')[1]
  const decoded = base64Encoded ? atob(base64Encoded) : '{}'
  const values = JSON.parse(decodeURIComponent(decoded))

  return {
    jobName: values.jobName ?? opts.app.name,
    jobLimit: values.jobLimit ?? opts.userJobLimit,
    output_folder_path: values.output_folder_path ?? '',
    scope: values.scope,
    inputs: values.inputs
      ? [values.inputs['0']]
      : [
          {
            id: 1,
            fields: Object.fromEntries(
              opts.spec.input_spec.map(item => [item.name, getDefaultValueFromServer(item.class, item.default)]),
            ),
          } as BatchInput,
        ],
  }
}

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.readAsText(file, 'UTF-8')

    fileReader.onload = e => {
      const result = e.target?.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('File reading failed'))
      }
    }

    fileReader.onerror = () => {
      reject(new Error('File reading failed'))
    }
  })
}

const importFormData = async (
  event: React.ChangeEvent<HTMLInputElement>,
  setVals: (val: RunJobFormType) => void,
  currentVals: RunJobFormType,
  setShowValidationWait: (val: boolean) => void,
  setValidatedFilesCache: (cache: Record<string, boolean>) => void,
  setTotalFilesToValidate: (val: number) => void,
  setTotalFilesValidated: (val: number | ((prevVal: number) => number)) => void,
) => {
  event.preventDefault()

  const delayDialogTimeout = setTimeout(() => {
    setShowValidationWait(true)
  }, 1000)

  if (event.target.files && event.target.files.length > 0) {
    const file = event.target.files[0]

    try {
      // Convert FileReader to promise-based API
      const content = await readFileAsText(file)

      const importedData = JSON.parse(content)
      if (importedData.inputs && Array.isArray(importedData.inputs)) {
        // Add ids to each input item
        importedData.inputs = importedData.inputs.map((item: BatchInput, index: number) => ({
          ...item,
          id: index + 1,
        }))
      }
      const validationCache: Record<string, boolean> = {}

      const allFileUids = Array.from(new Set(importedData.inputs.flatMap(item => collectFileUidsFromBatchInput(item))))
      setTotalFilesToValidate(allFileUids.length)
      for (const fileUid of allFileUids) {
        const valid = await validateFile(fileUid)
        setTotalFilesValidated(prevCount => prevCount + 1)
        validationCache[fileUid] = valid
      }

      setValidatedFilesCache(validationCache)
      clearTimeout(delayDialogTimeout)
      setShowValidationWait(false)

      // Merge current `scope` with imported data
      setVals({
        ...importedData,
        scope: currentVals.scope, // Preserve the existing scope value
      })
    } catch (error) {
      console.log(error)
      toast.error('Invalid file format')
      clearTimeout(delayDialogTimeout)
      setShowValidationWait(false)
    }
  }
}

export const RunJobForm = ({ app, userJobLimit, spec }: { app: IApp; spec: AppSpec; userJobLimit: IUser['job_limit'] }) => {
  const { data: computeInstances, isLoading: computeInstancesLoading } = useUserComputeInstances()
  const { data: selectableContexts } = useSelectableContexts(app.scope, app.entity_type)
  const { data: selectableSpaces } = useSelectableSpaces(app.scope)
  const { hash, pathname } = useLocation()
  const navigate = useNavigate()
  const [showValidationWait, setShowValidationWait] = useState(false)
  const [totalFilesToValidate, setTotalFilesToValidate] = useState(0)
  const [totalFilesValidated, setTotalFilesValidated] = useState(0)
  const [validatedFilesCache, setValidatedFilesCache] = useState<Record<string, boolean>>({})

  const { modalComp: licensesModal, setLicensesAndShow } = useAcceptLicensesModal()
  const defaultValues = getDefaults(hash, { app, userJobLimit, spec })
  const [executedBatchCount, setExecutedBatchCount] = useState(0)

  if (hash.startsWith('#')) {
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
    setError,
    watch,
    reset,
  } = useForm<RunJobFormType>({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
    defaultValues,
  })

  const { modalComp: selectFolderModal, setShowModal: setSelectFolderModal } = useSelectFolderModal({
    headerText: 'Select output folder',
    submitCaption: 'Select folder',
    scope: app.scope === 'public' ? 'private' : app.scope, // show private folders for public apps
    onHandleSubmit: (folderId, info: TreeOnSelectInfo) => {
      setValue('output_folder_path', info.node.path)
      setSelectFolderModal(false)
    },
  })

  useDefaultInstanceType(getValues(), computeInstances, spec.instance_type, setValue)
  useDefaultScopeSelection(getValues(), selectableSpaces, app.scope, setValue)

  const inputs = useFieldArray({
    control,
    name: 'inputs',
  })

  const getRunningLabelText = () => {
    return `Running Batch App (${executedBatchCount} of ${inputs.fields.length})`
  }

  const isBatchRun = inputs.fields.length > 1
  const runButtonText = isBatchRun ? 'Run Batch App' : 'Run App'
  const runningButtonText = isBatchRun ? getRunningLabelText() : 'Running App'

  const addInput = () => {
    if (computeInstances) {
      const lastId = getValues().inputs[getValues().inputs.length - 1].id ?? 0
      inputs.append(
        {
          instanceType: computeInstances[0],
          id: lastId + 1,
          fields: Object.fromEntries(
            spec.input_spec.map(item => [item.name, getDefaultValueFromServer(item.class, item.default)]),
          ),
        },
        { shouldFocus: false },
      )
    }
  }

  const removeInput = (index: number) => {
    inputs.remove(index)
  }

  const runJobMutation = useRunJobMutation(getValues().scope?.value as ServerScope)
  const exportModal = useExportInputsModal({ showCopyButton: true, app })

  const onSubmit = async () => {
    const vals = getValues()
    const valid = await trigger()
    setExecutedBatchCount(prevCount => prevCount + 1)

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
        try {
          for (let index = 0; index < vals.inputs.length; index++) {
            const batchInput = vals.inputs[index]

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

            const data = await runJobMutation.mutateAsync(req)
            setExecutedBatchCount(prevCount => prevCount + 1)

            if (!data?.id && data?.error) {
              toast.error(data.error.message)
            } else if (!data?.id) {
              toast.error('Something went wrong!')
            }

            if (!isBatchRun) {
              if (vals.scope.value === 'private') {
                navigate(`/home/executions/${data?.id}`)
              } else {
                const spaceId = vals.scope.value.replace('space-', '')
                navigate(`/spaces/${spaceId}/executions/${data?.id}`)
              }
            }
          }

          // Navigate after all jobs have been executed
          if (isBatchRun) {
            if (vals.scope.value === 'private') {
              navigate(`/home/apps/${app.uid}/jobs`)
            } else {
              const spaceId = vals.scope.value.replace('space-', '')
              navigate(`/spaces/${spaceId}/apps/${app.uid}/jobs`)
            }
          }
        } catch (error) {
          console.error('Error starting job :', error)
          toast.error('Failed to start job.')
        }
      }
    }
  }

  const handleImportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    document.getElementById('fileInput')?.click()
  }

  const handleExportInputClick = () => {
    const vals = getValues()
    vals.inputs = mapInputKeyVals(vals.inputs, spec.input_spec)
    const fileUids = getFileUIDsFromAppRun(vals.inputs, spec.input_spec)

    exportModal.openModal(vals, fileUids)
  }

  return (
    <StyledForm id="submitJobForm" autoComplete="off">
      {exportModal?.modalComp}
      <AppsConfiguration>
        <TipsRow>
          <QuestionIcon height={14} />
          Need help? &nbsp;
          <a href="/docs/guides/apps#running-an-app" target="_blank">
            Learn more about running an app
          </a>
        </TipsRow>
        <Section>
          <SectionHeader>CONFIGURE</SectionHeader>
          <SectionBody>
            <StyledGrid>
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
              {app.entity_type === 'https' && (
                <SelectContext
                  control={control}
                  isSubmitting={isSubmitting}
                  selectableContexts={selectableContexts}
                  errors={errors}
                />
              )}
              {app.scope.startsWith('space-') && (
                <StyledJobName>
                  <SelectSpaceScope
                    control={control}
                    isSubmitting={isSubmitting}
                    selectableSpaces={selectableSpaces}
                    errors={errors}
                  />
                </StyledJobName>
              )}
              {!isBatchRun && (
                <SelectInstanceType
                  control={control}
                  selectedInstance={watch().inputs[0].instanceType}
                  name={'inputs.0.instanceType' as keyof RunJobFormType}
                  jobLimit={watch().jobLimit}
                  isSubmitting={isSubmitting}
                  computeInstances={computeInstances}
                  isComputeInstancesLoading={computeInstancesLoading}
                  errors={errors}
                  inputId="select_instance_type"
                />
              )}
            </StyledGrid>
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
                  jobLimit={watch().jobLimit}
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
                        <FieldGroup label={getLabel(inputSpec)} required={!inputSpec.optional} key={inputSpec.name + inputSpec}>
                          <JobRunInput
                            key={inputSpec.name + inputSpec}
                            field={field}
                            inputSpec={inputSpec}
                            errors={errors as FieldErrors<Record<string, unknown>>}
                            disabled={isSubmitting}
                            register={register}
                            setError={setError}
                            scope={app.entity_type === 'https' ? watch().scope?.value : app.scope}
                            validatedFilesCache={validatedFilesCache}
                          />
                        </FieldGroup>
                      )}
                    />
                  )
                })
              ) : (
                <Empty>App has no inputs.</Empty>
              )}
            </SectionBody>
          </Section>
        ))}
        <SetOutputFolder control={control} isSubmitting={isSubmitting} spec={spec} setShowModal={setSelectFolderModal} />
      </AppsConfiguration>
      <StyledActionsContainer>
        <Button
          data-variant="primary"
          disabled={isSubmitting || Object.keys(errors).length > 0}
          type="button"
          form="submitJobForm"
          onClick={handleSubmit(onSubmit)}
        >
          {isSubmitting ? runningButtonText : runButtonText}
        </Button>
        <RightGroup>
          {isBatchRun && (
            <>
              <Button
                data-variant="success"
                disabled={isSubmitting}
                type="button"
                onClick={event => exportFormData(event, getValues())}
              >
                Export Inputs
              </Button>

              <input
                type="file"
                style={{ display: 'none' }}
                id="fileInput"
                onChange={event =>
                  importFormData(
                    event,
                    vals => reset(vals),
                    getValues(),
                    setShowValidationWait,
                    setValidatedFilesCache,
                    setTotalFilesToValidate,
                    setTotalFilesValidated,
                  )
                }
              />
              <Button data-variant="success" disabled={isSubmitting} type="button" onClick={handleImportClick}>
                Import Inputs
              </Button>
            </>
          )}
          {computeInstances && (
            <Button data-variant="success" disabled={isSubmitting} type="button" onClick={addInput}>
              Add batch
            </Button>
          )}
        </RightGroup>
      </StyledActionsContainer>
      {licensesModal}
      {selectFolderModal}

      <SavingModal
        modalId="run-batch-job-processing"
        headerText="Starting batch run jobs"
        body={
          <div>
            <p>{getRunningLabelText()}.</p>
            <p>Please wait until this message disappears.</p>
          </div>
        }
        isSaving={isSubmitting && isBatchRun}
        key="run-batch-job-processing"
      />
      <SavingModal
        modalId="select-output-folder"
        headerText="Validating file inputs"
        body={
          <div>
            <p>File inputs are being validated.</p>
            <p>
              Processing file {totalFilesValidated}/{totalFilesToValidate}.
            </p>
            <p>Please wait until this message disappears.</p>
          </div>
        }
        isSaving={showValidationWait}
        key="select-output-folder"
      />
    </StyledForm>
  )
}
