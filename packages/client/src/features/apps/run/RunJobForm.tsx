import { yupResolver } from '@hookform/resolvers/yup'
import { Share, XIcon } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import { Controller, type FieldErrors, FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/Button'
import { FieldGroup } from '@/components/form/FieldGroup'
import { InputNumber, InputText } from '@/components/InputText'
import { toastError } from '@/components/NotificationCenter/ToastHelper'
import { Button as UiButton } from '@/components/ui/button'
import { FieldSet } from '@/components/ui/field'
import type { IUser } from '@/types/user'
import { useSelectFolderModal } from '../../files/actionModals/useSelectFolderModal'
import type { TreeOnSelectInfo } from '../../files/files.types'
import { Empty } from '../../home/home.styles'
import type { ServerScope } from '../../home/types'
import { fetchAcceptedLicenses } from '../../licenses/api'
import { useAcceptLicensesModal } from '../../licenses/useAcceptLicensesModal'
import { SavingModal } from '../../modal/SavingModal'
import { fetchLicensesOnApp } from '../apps.api'
import type { AppSpec, BatchInput, IApp, RunJobFormType } from '../apps.types'
import { getDefaultValueFromServer } from '../form/common'
import { useComputeInstances } from '../useComputeInstances'
import { ErrorMessageForField } from './ErrorMessageForField'
import { JobRunInput } from './JobRunInput'
import { SelectContext } from './SelectContext'
import { SelectInstanceType } from './SelectInstanceType'
import { SelectSpaceScope } from './SelectSpaceScope'
import { SetOutputFolder } from './SetOutputFolder'
import { RightGroup, StyledActionsContainer, StyledGrid, StyledJobName } from './styles'
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
  validateFile,
} from './utils'

/**
 * If params are specified in the URL, decode them and set them as default values.
 * Otherwise, use defaults on spec.
 *
 * @param hash
 * @param opts
 */
const getDefaults = (
  hash: string,
  opts: { app: IApp; spec: AppSpec; userJobLimit: IUser['job_limit'] },
): RunJobFormType => {
  const base64Encoded = hash.split('#')[1]
  const decoded = base64Encoded ? atob(base64Encoded) : '{}'
  const values = JSON.parse(decodeURIComponent(decoded))

  return {
    jobName: values.jobName ?? opts.app.name,
    jobLimit: values.jobLimit ?? opts.userJobLimit,
    outputFolderPath: values.outputFolderPath ?? '',
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

      const importedData: RunJobFormType = JSON.parse(content)
      if (importedData.inputs && Array.isArray(importedData.inputs)) {
        // Add ids to each input item
        importedData.inputs = importedData.inputs.map((item: BatchInput, index: number) => ({
          ...item,
          id: index + 1,
        }))
      }
      const validationCache: Record<string, boolean> = {}

      const allFileUids = Array.from(
        new Set(importedData.inputs.flatMap(item => collectFileUidsFromBatchInput(item))),
      ) as string[]
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
      toastError('Invalid file format')
      clearTimeout(delayDialogTimeout)
      setShowValidationWait(false)
    }
  }
}

export const RunJobForm = ({
  app,
  userJobLimit,
  spec,
}: {
  app: IApp
  spec: AppSpec
  userJobLimit: IUser['job_limit']
}) => {
  const { computeInstances, isLoading: computeInstancesLoading } = useComputeInstances()
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

  const form = useForm<RunJobFormType>({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
    defaultValues,
  })
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
  } = form

  const { modalComp: selectFolderModal, setShowModal: setSelectFolderModal } = useSelectFolderModal({
    headerText: 'Select output folder',
    submitCaption: 'Select folder',
    scope: app.scope === 'public' ? 'private' : app.scope, // show private folders for public apps
    onHandleSubmit: (_folderId, info: TreeOnSelectInfo) => {
      setValue('outputFolderPath', info.node.path)
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
    if (computeInstances.length > 0) {
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
              vals.outputFolderPath,
              batchInput.instanceType.value,
              vals.scope.value as ServerScope,
              batchInput.fields,
              app,
              spec.input_spec,
            )

            const data = await runJobMutation.mutateAsync(req)
            setExecutedBatchCount(prevCount => prevCount + 1)

            if (!data?.id && data?.error) {
              toastError(data.error.message)
            } else if (!data?.id) {
              toastError('Something went wrong!')
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
    <FormProvider {...form}>
      <form id="submitJobForm" autoComplete="off" data-testid="run-app-form" className="min-w-0 max-w-full pb-16">
        {exportModal?.modalComp}
        <div className="min-w-0 max-w-full">
          <div className="flex min-w-0 flex-wrap items-center gap-2 py-3 text-left text-sm text-(--c-text-600)">
            <span>
              Need help?{' '}
              <a
                href="/docs/guides/apps#running-an-app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                Learn more about running an app
              </a>
            </span>
          </div>
          <FieldSet
            className="mb-6 min-w-0 max-w-full gap-0 overflow-x-clip rounded-md border border-border p-0"
            data-testid="run-app-configure-section"
            aria-labelledby="run-app-configure-section-title"
          >
            <div
              id="run-app-configure-section-title"
              className="w-full min-w-0 min-h-[40px] content-center border-b border-border bg-muted-foreground/5 px-3 py-1.5 text-left text-sm font-bold normal-case text-muted-foreground"
            >
              Configure
            </div>
            <div className="w-full min-w-0 px-3 py-2 sm:px-4 sm:py-2.5">
              <StyledGrid>
                <StyledJobName>
                  <FieldGroup label="Job Name" required>
                    <InputText {...register('jobName')} disabled={isSubmitting} data-testid="run-app-job-name" />
                    <ErrorMessageForField errors={errors as FieldErrors<Record<string, unknown>>} fieldName="jobName" />
                  </FieldGroup>
                </StyledJobName>
                <FieldGroup label="Execution Cost Limit ($)" required>
                  <InputNumber
                    min="0"
                    step="10"
                    {...register('jobLimit', { valueAsNumber: true })}
                    disabled={isSubmitting}
                    data-testid="run-app-job-limit"
                  />
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
                    name={'inputs.0.instanceType'}
                    jobLimit={watch().jobLimit}
                    isSubmitting={isSubmitting}
                    computeInstances={computeInstances}
                    isComputeInstancesLoading={computeInstancesLoading}
                    errors={errors}
                    inputId="select_instance_type"
                  />
                )}
              </StyledGrid>
            </div>
          </FieldSet>
        </div>
        <div className="min-w-0 max-w-full">
          {inputs.fields.map((batchInput, batchIndex) => (
            <FieldSet
              key={batchInput.id}
              className="mb-6 min-w-0 max-w-full gap-0 overflow-x-clip rounded-md border border-border p-0"
              data-testid={`batch_group_${batchIndex}`}
              aria-label={isBatchRun ? `Batch input ${batchIndex + 1} of ${inputs.fields.length}` : 'App inputs'}
            >
              <div className="flex min-h-10 flex-wrap items-center justify-between gap-2 border-b border-border bg-muted-foreground/5 px-3 py-2">
                {isBatchRun ? (
                  <>
                    <div className="text-sm font-bold normal-case text-muted-foreground">
                      Batch input {batchIndex + 1} of {inputs.fields.length}
                    </div>
                    <UiButton
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled={isSubmitting}
                      className="text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground dark:hover:bg-muted-foreground/30"
                      onClick={() => removeInput(batchIndex)}
                      aria-label="Remove batch input"
                    >
                      <XIcon className="size-3.5" aria-hidden />
                    </UiButton>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-bold normal-case text-muted-foreground">Inputs</div>
                    <UiButton
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="h-6 min-h-6 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => handleExportInputClick()}
                    >
                      <Share className="size-3 shrink-0" aria-hidden />
                      Export Values
                    </UiButton>
                  </>
                )}
              </div>
              <div className="w-full min-w-0 space-y-2 px-3 py-2 sm:px-4 sm:py-2.5">
                {isBatchRun && (
                  <SelectInstanceType
                    control={control}
                    selectedInstance={watch().inputs[batchIndex].instanceType}
                    name={`inputs.${batchIndex}.instanceType`}
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
              </div>
            </FieldSet>
          ))}
          <SetOutputFolder
            control={control}
            isSubmitting={isSubmitting}
            spec={spec}
            setShowModal={setSelectFolderModal}
          />
        </div>
        <StyledActionsContainer>
          <Button
            data-variant="primary"
            data-testid="run-app-submit-button"
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
            {computeInstances.length > 0 && (
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
      </form>
    </FormProvider>
  )
}
