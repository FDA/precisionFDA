import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import { Controller, FieldErrors, useFieldArray, useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Button, TransparentButton } from '../../../components/Button'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { CrossIcon } from '../../../components/icons/PlusIcon'
import { QuestionIcon } from '../../../components/icons/QuestionIcon'
import { InputNumber, InputText } from '../../../components/InputText'
import { EmptyTable } from '../../../components/Table/styles'
import { IUser } from '../../../types/user'
import { useOrganizeFileModal } from '../../files/actionModals/useOrganizeFileModal'
import { TreeOnSelectInfo } from '../../files/files.types'
import { ServerScope } from '../../home/types'
import { fetchAcceptedLicenses } from '../../licenses/api'
import { useAcceptLicensesModal } from '../../licenses/useAcceptLicensesModal'
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
  createRequestObject,
  exportFormData,
  extractFileUidsFromBatchInputs,
  fetchLicensesOnFiles,
  getFileUIDsFromAppRun,
  getLabel,
  getLicensesToAccept,
  importFormData,
  mapInputKeyVals,
  prepareValidations,
  useDefaultInstanceType,
  useDefaultScopeSelection,
  useSelectableContexts,
  useSelectableSpaces,
  useUserComputeInstances,
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
  const values = JSON.parse(decoded)

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

export const RunJobForm = ({ app, userJobLimit, spec }: { app: IApp; spec: AppSpec; userJobLimit: IUser['job_limit'] }) => {
  const { data: computeInstances, isLoading: computeInstancesLoading } = useUserComputeInstances()
  const { data: selectableContexts } = useSelectableContexts(app.scope, app.entity_type)
  const { data: selectableSpaces } = useSelectableSpaces(app.scope)
  const { hash, pathname } = useLocation()
  const navigate = useNavigate()

  const { modalComp: licensesModal, setLicensesAndShow } = useAcceptLicensesModal()

  const defaultValues = getDefaults(hash, { app, userJobLimit, spec })

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

  const { modalComp: organizeFileModal, setShowModal: setOrganizeFileModal } = useOrganizeFileModal({
    headerText: 'Select output folder',
    submitCaption: 'Select folder',
    scope: app.scope === 'public' ? 'private' : app.scope, // show private folders for public apps
    onHandleSubmit: (folderId, info: TreeOnSelectInfo) => {
      setValue('output_folder_path', info.node.path)
      setOrganizeFileModal(false)
    },
  })

  useDefaultInstanceType(getValues(), computeInstances, spec.instance_type, setValue)
  useDefaultScopeSelection(getValues(), selectableSpaces, app.scope, setValue)

  const inputs = useFieldArray({
    control,
    name: 'inputs',
  })
  const isBatchRun = inputs.fields.length > 1
  const runButtonText = isBatchRun ? 'Run Batch App' : 'Run App'

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
        try {
          await Promise.all(mutations).then(data => {
            if (data[0]?.id) {
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
        } catch (error) {
          console.error(error)
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
          <Link to="/docs/apps#apps-run" target="_blank">
            Learn more about running an app
          </Link>
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
        <Button
          data-variant="primary"
          disabled={isSubmitting || Object.keys(errors).length > 0}
          type="button"
          form="submitJobForm"
          onClick={handleSubmit(onSubmit)}
        >
          {isSubmitting ? 'Running' : runButtonText}
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
                onChange={event => importFormData(event, vals => reset(vals))}
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
      {organizeFileModal}
    </StyledForm>
  )
}
