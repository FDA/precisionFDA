import { yupResolver } from '@hookform/resolvers/yup'
import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { InputNumber, InputText } from '../../../components/InputText'
import { EmptyTable } from '../../../components/Table/styles'
import { FieldGroup } from '../../../components/form/FieldGroup'
import { QuestionIcon } from '../../../components/icons/QuestionIcon'
import { IUser } from '../../../types/user'
import { useOrganizeFileModal } from '../../files/actionModals/useOrganizeFileModal'
import { FileTreeNode, TreeOnSelectInfo } from '../../files/files.types'
import { fetchAcceptedLicenses } from '../../licenses/api'
import { useAcceptLicensesModal } from '../../licenses/useAcceptLicensesModal'
import { ServerScope } from '../../home/types'
import { fetchLicensesOnApp, fetchUserComputeInstances } from '../apps.api'
import { AppSpec, IApp, JobRunForm, PricingMap } from '../apps.types'
import { getDefaultValueFromServer } from '../form/common'
import { ErrorMessageForField } from './ErrorMessageForField'
import { JobRunInput } from './JobRunInput'
import {
  fetchAndConvertSelectableContexts,
  fetchAndConvertSelectableSpaces,
} from './job-run-helper'
import {
  AppsConfiguration,
  InputTextRightMargin,
  Section,
  SectionBody,
  SectionHeader,
  StyledForm,
  StyledJobName,
  StyledLabel,
  StyledRow,
  StyledScopeName,
  TipsRow,
} from './styles'
import { useRunJobMutation } from './useRunJobMutation'
import {
  createRequestObject,
  fetchLicensesOnFiles,
  getFileUIDsFromAppRun,
  getLabel,
  getLicensesToAccept,
  mapInputKeyVals,
  prepareValidations,
} from './utils'
import { Select } from '../../../components/Select'
import { Button, TransparentButton } from '../../../components/Button'
import { useExportInputsModal } from './useExportInputsModal'
import { Small } from '../../../components/Page/styles'

const buildPath = (node: FileTreeNode): string => {
  if (!node || node.title === '/') {
    return ''
  }

  if (!node.parent) {
    return node.title
  }

  const parentPath = buildPath(node.parent)
  return `${parentPath}/${node.title}`
}

const filesOutputClasses = ['file', 'array:file']
const hasAppFileOutputs = (outputSpec: AppSpec['output_spec']): boolean => {
  return outputSpec.some(item => filesOutputClasses.includes(item.class))
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
  const { hash, pathname } = useLocation()
  const navigate = useNavigate()

  const { data: computeInstances, isLoading: computeInstancesLoading } =
    useQuery({
      queryKey: ['user-compute-instances'],
      queryFn: () => fetchUserComputeInstances().catch((e) => {
        toast.error('Error loading compute instances')
        throw e
      }),
    })

  const { data: selectableContexts, isLoading: isLoadingSelectableContexts } = useQuery({
    queryKey: ['selectable-contexts', app.scope],
    queryFn: () => fetchAndConvertSelectableContexts(app.entity_type).catch((e) => {
      toast.error('Error loading contexts')
      throw e
    }),
  })

  const { data: selectableSpaces, isLoading: isLoadingSelectableScope } = useQuery({
    queryKey: ['selectable-spaces', app.scope],
    queryFn: () => fetchAndConvertSelectableSpaces(app.scope).catch((e) => {
      toast.error('Error loading spaces')
      throw e
    }),
  })

  let defaultValues = {
    jobName: app.name,
    jobLimit: userJobLimit,
    instanceType: undefined,
    output_folder_path: '',
    scope: { label: 'Private', value: 'private' },
    inputs: Object.fromEntries(
      spec.input_spec.map(item => [
        item.name,
        getDefaultValueFromServer(item.class, item.default),
      ]),
    ),
  } satisfies JobRunForm

  if(hash.startsWith('#')) {
    const base64Encoded = hash.split('#')[1]
    const decoded = atob(base64Encoded)
    const inputs = JSON.parse(decoded)
    defaultValues = { ...defaultValues, inputs }
    navigate(pathname, { replace: true })
  }

  const validationSchema = prepareValidations(
    spec.input_spec,
    userJobLimit,
    app.scope,
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
    setValue,
    watch,
  } = useForm<JobRunForm>({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema),
    defaultValues,
  })

  const {
    modalComp: organizeFileModal,
    setShowModal: setOrganizeFileModal,
  } = useOrganizeFileModal({
    headerText: 'Select output folder',
    submitCaption: 'Select folder',
    scope: app.scope === 'public' ? 'private' : app.scope, // show private folders for public apps
    onHandleSubmit: (folderId, info: TreeOnSelectInfo) => {
      const outputFolderPath = buildPath(info.node)
      setValue('output_folder_path', outputFolderPath)
      setOrganizeFileModal(false)
    },
  })

  const [maxRuntime, setMaxRuntime] = useState<string>('')

  // Update the instanceType field when computeInstances list loads
  useEffect(() => {
    if (computeInstances) {
      setValue(
        'instanceType',
        computeInstances.find(
          instance => instance.value === spec.instance_type,
        ) ?? computeInstances[0],
      )
    }
  }, [computeInstances])
  
  // Update the selectable scope field when list loads
  useEffect(() => {
    if (selectableSpaces) {
      const defaultSelectedScope = selectableSpaces.find(s => s.value === app.scope) ?? { label: 'Private', value: 'private' }
      setValue(
        'scope',
        defaultSelectedScope,
      )
    }
  }, [selectableSpaces])


  // Calculate maxRuntime for user info when instanceType or jobLimit changes
  useEffect(() => {
    const selectedInstance = getValues().instanceType?.value
    if (selectedInstance) {
      const costPerHour = PricingMap[selectedInstance as keyof typeof PricingMap] as number
      let hoursRuntime = getValues().jobLimit / costPerHour
      let remainingMinutes = Math.round((hoursRuntime % 1) * 60)
      if (remainingMinutes === 60) {
        hoursRuntime++
        remainingMinutes = 0
      }
      setMaxRuntime(`Maximum estimated runtime: ${Math.floor(hoursRuntime)}h${remainingMinutes ? ` ${remainingMinutes}m` : ''}`)
    }
  }, [watch().instanceType, watch().jobLimit])

  const runJobMutation = useRunJobMutation(getValues().scope?.value as ServerScope)
  const exportModal = useExportInputsModal({ showCopyButton: app.scope === 'public' })

  const onSubmit = async () => {
    const vals = getValues()
    const valid = await trigger()

    if (valid) {
      try {
        const r = await Promise.all([
          fetchLicensesOnApp(app.uid),
          fetchLicensesOnFiles(vals.inputs),
        ])

        const acceptedLicenses = await fetchAcceptedLicenses()
        const licensesToAccept = getLicensesToAccept(r.flat(), acceptedLicenses)
        if (licensesToAccept.length > 0) {
          setLicensesAndShow(licensesToAccept, acceptedLicenses)
        } else {
          const req = createRequestObject(vals, app, spec.input_spec)
          await runJobMutation.mutateAsync(req)
        }
      } catch (e) {
        if (e?.response?.data?.error?.message) {
          toast.error(e?.response?.data?.error?.message)
        } else {
          toast.error('Failed to run app')
        }
      }
    }
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
                  <InputText
                    {...register('jobName')}
                    disabled={isSubmitting}
                  />
                  <ErrorMessageForField errors={errors} fieldName="jobName" />
                </FieldGroup>
              </StyledJobName>
              <FieldGroup label="Execution Cost Limit ($)" required>
                <InputNumber
                  min="0"
                  step="10"
                  {...register('jobLimit')}
                  disabled={isSubmitting}
                />
                <ErrorMessageForField errors={errors} fieldName="jobLimit" />
              </FieldGroup>
            </StyledRow>
            <StyledRow>
              {app.entity_type === 'https' && (
                <StyledScopeName>
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
                          isSearchable
                          onBlur={field.onBlur}
                          value={field.value}
                          isDisabled={isSubmitting}
                          isLoading={isLoadingSelectableContexts}
                          />
                      )}
                    />
                    <ErrorMessageForField errors={errors} fieldName="scope" />
                  </FieldGroup>
                </StyledScopeName>
              )}
              {app.scope.startsWith('space-') && (
                <StyledScopeName>
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
                          isLoading={isLoadingSelectableScope}
                        />
                      )}
                    />
                    <ErrorMessageForField
                      errors={errors}
                      fieldName="scope"
                    />
                  </FieldGroup>
                </StyledScopeName>
              )}
              <FieldGroup label="Instance Type" required>
                <Controller
                  name="instanceType"
                  control={control}
                  render={({ field }) => (
                   <>
                    <Select
                      defaultValue={field.value}
                      options={computeInstances}
                      placeholder="Choose..."
                      onChange={value => {
                        field.onChange(value)
                        field.onBlur()
                      }}
                      isLoading={computeInstancesLoading}
                      isSearchable
                      onBlur={field.onBlur}
                      value={field.value}
                      isDisabled={isSubmitting}
                    />
                    <Small>{maxRuntime}</Small>
                   </>
                  )}
                />
                <ErrorMessageForField
                  errors={errors}
                  fieldName="instanceType"
                />
              </FieldGroup>
            </StyledRow>
          </SectionBody>
        </Section>
        <Section>
          <SectionHeader><div>INPUTS</div><TransparentButton type='button' onClick={() => handleExportInputClick()}>Export Values</TransparentButton></SectionHeader>
          <SectionBody>
            {spec.input_spec.length > 0 ? (
              spec.input_spec.map(i => (
                <Controller
                  key={i.name}
                  control={control}
                  name={`inputs.${i.name}`}
                  render={({ field }) => (
                    <FieldGroup label={getLabel(i)} required={!i.optional}>
                      <JobRunInput
                        field={field}
                        inputSpec={i}
                        errors={errors}
                        disabled={isSubmitting}
                        register={register}
                        scope={app.entity_type === 'https' ? watch().scope?.value : app.scope }
                      />
                    </FieldGroup>
                  )}
                />
              ))
            ) : (
              <EmptyTable>App has no inputs.</EmptyTable>
            )}
          </SectionBody>
        </Section>
        {hasAppFileOutputs(spec.output_spec) && (
          <Controller
            name="output_folder_path"
            control={control}
            render={({ field }) => (
              <Section>
                <SectionHeader>OUTPUT FOLDER</SectionHeader>
                <SectionBody>
                  <FieldGroup label="Store outputs in">
                    <InputTextRightMargin
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      disabled={isSubmitting}
                      onClick={evt => {
                        setOrganizeFileModal(true)
                      }}
                    >
                      Choose folder
                    </Button>
                  </FieldGroup>
                  <StyledLabel>
                    Note: Non existing folders will be created
                  </StyledLabel>
                </SectionBody>
              </Section>
            )}
          />
        )}
      </AppsConfiguration>
      <Button
        variant="primary"
        disabled={isSubmitting}
        type="button"
        form="submitJobForm"
        onClick={handleSubmit(onSubmit)}
      >
        {isSubmitting ? 'Running' : 'Run App'}
      </Button>
      {licensesModal}
      {organizeFileModal}
    </StyledForm>
  )
}
