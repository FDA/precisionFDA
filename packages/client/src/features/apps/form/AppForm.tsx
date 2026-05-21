import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, type Resolver, useForm } from 'react-hook-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type ComputeResourceKey, RESOURCE_LABELS } from '@/types/user'
import { cn } from '@/utils/cn'
import { Button } from '../../../components/Button'
import { FieldGroup, InputError } from '../../../components/form/styles'
import { InputText } from '../../../components/InputText'
import { ArrowLeftIcon } from '../../../components/icons/ArrowLeftIcon'
import { Loader } from '../../../components/Loader'
import MonacoEditor from '../../../components/MonacoEditor/MonacoEditor'
import { PageTitle } from '../../../components/Page/styles'
import { ButtonRow } from '../../../components/Public/styles'
import { PfTabContent } from '../../../components/Tabs/PfTab'
import { APP_REVISION_CREATION_NOT_REQUESTED, APP_SERIES_CREATION_NOT_REQUESTED } from '../../../constants'
import { CONFIRM_APP_REVISION, CONFIRM_APP_SERIES } from '../../../constants/consts'
import { getSpaceIdFromScope } from '../../../utils'
import { useConfirmModal } from '../../files/actionModals/useConfirmModal'
import { StyledBackLink } from '../../home/home.styles'
import type { CreateAppPayload } from '../apps.api'
import type { CreateAppForm, FileType, IApp, InputSpec } from '../apps.types'
import { useInstanceTypeAvailability } from '../instanceTypeAvailability'
import { getBaseLink } from '../run/utils'
import { useComputeInstances } from '../useComputeInstances'
import { useUploadAppConfigFile } from '../useUploadAppConfigFile'
import { getChoicesValueFromForm, getDefaultValueFromForm, handleSnakeNameChange, validationSchema } from './common'
import { Inputs } from './Inputs'
import { Outputs } from './Outputs'
import { ReadMeInput } from './ReadMeInput'
import {
  FormFields,
  FormSectionTop,
  Help,
  Row,
  StyledForm,
  StyledPfTab,
  SubmitRow,
  TabDesc,
  TabRow,
  TabTitle,
  TopFieldGroup,
  TopFieldGroupTarget,
  TopFieldGroupUbuntu,
} from './styles'
import { VmEnvTab } from './VmEnvTab'

type SelectedSection = 'io' | 'vm' | 'script' | 'readme'

type InstanceTypeFallback = {
  requested: string
}

const InstanceTypeFallbackNotice = ({
  fallback,
  onClick,
}: {
  fallback: InstanceTypeFallback
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className="max-w-125 cursor-pointer rounded-md border border-(--highlight-200) bg-(--highlight-50) px-2 py-1 text-left text-xs leading-relaxed text-(--highlight-700) transition-colors hover:bg-(--highlight-100) focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
  >
    <span className="font-semibold">{fallback.requested}</span> is not available for your account. Select an instance
    type.
  </button>
)

const ubuntuReleasesOptions = [
  { value: '16.04', label: '16.04', disabled: true },
  { value: '20.04', label: '20.04' },
  { value: '24.04', label: '24.04' },
]

const initialFormValues: CreateAppForm = {
  name: '',
  title: '',
  createAppRevision: false,
  createAppSeries: false,
  input_spec: [],
  output_spec: [],
  code: '',
  readme: '',
  is_new: true,
  forked_from: null,
  instance_type: 'baseline-8',
  internet_access: false,
  ordered_assets: [],
  packages: [],
  release: '20.04',
  scope: 'private',
}

type AppFormProps = {
  isEdit?: boolean
  isFork?: boolean
  onSubmit: (vals: CreateAppPayload) => Promise<void>
  defaultVals?: CreateAppForm
  isSubmitting: boolean
  app?: IApp
  targetScopeName?: string
}

export const AppForm = (props: AppFormProps) => {
  const { computeInstances, isLoading } = useComputeInstances()
  if (isLoading) return <Loader className="pageloader" />
  return <AppFormInner {...props} computeInstances={computeInstances} />
}

const AppFormInner = ({
  isEdit = false,
  isFork = false,
  onSubmit,
  defaultVals,
  isSubmitting,
  app,
  targetScopeName,
  computeInstances,
}: AppFormProps & { computeInstances: ReturnType<typeof useComputeInstances>['computeInstances'] }) => {
  const spaceId = getSpaceIdFromScope(app?.scope)
  const [selectedSection, setSelectedSection] = useState<SelectedSection>('io')
  const [selectedFileType, setSelectedFileType] = useState<FileType>('cwl')
  const modal = useUploadAppConfigFile({ filetype: selectedFileType })
  const { allowedComputeResourceIds, isLoading: isInstanceAvailabilityLoading } = useInstanceTypeAvailability()
  const validationContext = useMemo(() => ({ allowedComputeResourceIds }), [allowedComputeResourceIds])

  const baseDefaults = defaultVals ?? initialFormValues
  const requestedInstanceType = baseDefaults.instance_type
  const requestedInstanceTypeIsAllowed = computeInstances.some(i => i.value === requestedInstanceType)
  const fallbackInstanceType = !requestedInstanceTypeIsAllowed && computeInstances.length > 0 ? computeInstances[0] : null

  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    setFocus,
    getValues,
    formState: { errors },
  } = useForm<CreateAppForm>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<CreateAppForm>,
    mode: 'onBlur',
    defaultValues: defaultVals ? { ...initialFormValues, ...defaultVals } : initialFormValues,
    context: validationContext,
  })
  const selectedInstanceType = watch('instance_type')
  const instanceTypeFallback =
    fallbackInstanceType != null && selectedInstanceType === requestedInstanceType
      ? {
          requested: RESOURCE_LABELS[requestedInstanceType as ComputeResourceKey] ?? requestedInstanceType,
        }
      : null

  useEffect(() => {
    if (isInstanceAvailabilityLoading) return
    void trigger('instance_type')
  }, [allowedComputeResourceIds, isInstanceAvailabilityLoading, trigger])

  const handleOpenAppConfigUpload = (ftype: FileType) => {
    setSelectedFileType(ftype)
    modal.setShowModal(true)
  }

  const getPageTitle = () => {
    if (isEdit) return 'Edit App'
    if (isFork) return 'Fork App'
    return 'Create App'
  }

  const getSubmitButtonText = () => {
    if (isEdit) return `Save Revision ${(app?.revision || 0) + 1}`
    if (isFork) return 'Save Fork'
    return 'Create App'
  }

  const { modalComp: appSeriesConfirmModal, setShowModal: setShowAppSeriesConfirmModal } = useConfirmModal(
    'Confirm',
    CONFIRM_APP_SERIES,
    async () => {
      setShowAppSeriesConfirmModal(false)
      await performSubmit(true, false)
    },
  )
  const { modalComp: appRevisionConfirmModal, setShowModal: setShowAppRevisionConfirmModal } = useConfirmModal(
    'Confirm',
    CONFIRM_APP_REVISION,
    async () => {
      setShowAppRevisionConfirmModal(false)
      await performSubmit(false, true)
    },
  )

  const performSubmit = useCallback(
    async (createAppSeries: boolean, createAppRevision: boolean) => {
      const vals = getValues()
      const formatted: CreateAppPayload = {
        ...vals,
        is_new: false,
        ordered_assets: vals.ordered_assets?.map(asset => asset.uid),
        input_spec: vals.input_spec.map(i => ({
          ...i,
          default: getDefaultValueFromForm(i.class, i.default) as InputSpec['default'],
          choices: i?.choices && (getChoicesValueFromForm(i.class, i.choices) as InputSpec['choices']),
        })),
      }

      formatted.createAppSeries = createAppSeries
      formatted.createAppRevision = createAppRevision
      try {
        await onSubmit(formatted)
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: { code?: string } } } }
        const code = error.response?.data?.error?.code
        if (code === APP_SERIES_CREATION_NOT_REQUESTED) {
          setShowAppSeriesConfirmModal(true)
        } else if (code === APP_REVISION_CREATION_NOT_REQUESTED) {
          setShowAppRevisionConfirmModal(true)
        }
      }
    },
    [getValues, onSubmit, setShowAppSeriesConfirmModal, setShowAppRevisionConfirmModal],
  )

  const focusInstanceTypeSelect = () => {
    setSelectedSection('vm')
    requestAnimationFrame(() => {
      setFocus('instance_type')
    })
  }

  const backLink = isEdit || isFork ? `/${getBaseLink(spaceId)}/apps/${app?.uid}` : `/${getBaseLink(spaceId)}/apps`
  const backLabel = isEdit || isFork ? 'Back to App' : 'Back to Apps'

  return (
    <>
      <StyledBackLink linkTo={backLink}>{backLabel}</StyledBackLink>

      <StyledForm onSubmit={handleSubmit(() => performSubmit(false, false))} autoComplete="off">
        <Row>
          <PageTitle>{getPageTitle()}</PageTitle>
          <SubmitRow>
            {isSubmitting && <Loader />}
            {isEdit && (
              <>
                <span>Revision {app?.revision}</span>
                <ArrowLeftIcon right height={14} />
              </>
            )}
            <Button disabled={Object.keys(errors).length > 0 || isSubmitting} data-variant="primary" type="submit">
              <div>{getSubmitButtonText()}</div>
            </Button>
          </SubmitRow>
        </Row>
        <ButtonRow className="flex-wrap items-start">
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => handleOpenAppConfigUpload('cwl')}>
              Import from .cwl file
            </Button>
            <Button type="button" onClick={() => handleOpenAppConfigUpload('wdl')}>
              Import from .wdl file
            </Button>
          </div>
          {instanceTypeFallback && (
            <div className="ml-auto">
              <InstanceTypeFallbackNotice fallback={instanceTypeFallback} onClick={focusInstanceTypeSelect} />
            </div>
          )}
        </ButtonRow>
        {modal.modalComp}
        <FormSectionTop>
          <TopFieldGroup>
            <label htmlFor="app-form-name">Name</label>
            <InputText
              id="app-form-name"
              {...register('name', {
                required: 'Name is required.',
                onChange: handleSnakeNameChange,
              })}
              disabled={isEdit || isSubmitting}
            />
            <ErrorMessage errors={errors} name="name" render={({ message }) => <InputError>{message}</InputError>} />
          </TopFieldGroup>

          <TopFieldGroup>
            <label htmlFor="app-form-title">Title</label>
            <InputText
              id="app-form-title"
              {...register('title', { required: 'Title is required.' })}
              disabled={isSubmitting}
            />
            <ErrorMessage errors={errors} name="title" render={({ message }) => <InputError>{message}</InputError>} />
          </TopFieldGroup>

          <FieldGroup>
            <Controller
              name="release"
              control={control}
              render={({ field }) => (
                <TopFieldGroupUbuntu>
                  <label htmlFor="app-ubuntu-release">Ubuntu Release</label>
                  <Select
                    id="app-ubuntu-release"
                    name={String(field.name)}
                    items={ubuntuReleasesOptions}
                    value={field.value}
                    onValueChange={v => {
                      field.onChange(v ?? '')
                      field.onBlur()
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      className={cn('w-full max-w-full justify-between')}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      aria-invalid={errors.release ? true : undefined}
                    >
                      <SelectValue placeholder="Select release" />
                    </SelectTrigger>
                    <SelectContent>
                      {ubuntuReleasesOptions.map(option => (
                        <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ErrorMessage
                    errors={errors}
                    name="release"
                    render={({ message }) => <InputError>{message}</InputError>}
                  />
                  <ErrorMessage
                    errors={errors}
                    name="release"
                    render={({ message }) => <InputError>{message}</InputError>}
                  />
                </TopFieldGroupUbuntu>
              )}
            />
          </FieldGroup>
          {isFork && (
            <TopFieldGroupTarget>
              <label htmlFor="app-form-target">Target</label>
              <InputText id="app-form-target" value={targetScopeName} disabled={true} />
            </TopFieldGroupTarget>
          )}
        </FormSectionTop>

        <div>
          <TabRow>
            <StyledPfTab $isActive={selectedSection === 'io'} onClick={() => setSelectedSection('io')}>
              <TabTitle>I/O SPEC</TabTitle>
              <TabDesc>Configure Input & Output Fields</TabDesc>
            </StyledPfTab>
            <StyledPfTab $isActive={selectedSection === 'vm'} onClick={() => setSelectedSection('vm')}>
              <TabTitle>VM ENVIRONMENT</TabTitle>
              <TabDesc>Configure your resources</TabDesc>
            </StyledPfTab>
            <StyledPfTab $isActive={selectedSection === 'script'} onClick={() => setSelectedSection('script')}>
              <TabTitle>SCRIPT</TabTitle>
              <TabDesc>Write your shell script</TabDesc>
            </StyledPfTab>
            <StyledPfTab $isActive={selectedSection === 'readme'} onClick={() => setSelectedSection('readme')}>
              <TabTitle>README</TabTitle>
              <TabDesc>Describe your app</TabDesc>
            </StyledPfTab>
          </TabRow>

          <PfTabContent $isShown={selectedSection === 'io'}>
            <Help>
              <span>Need help?</span>
              <a href="/docs/guides/creating-apps#input-and-output-spec" target="_blank" rel="noopener noreferrer">
                {' '}
                Learn more about app inputs and outputs
              </a>
            </Help>
            <Inputs
              control={control}
              errors={errors}
              watch={watch}
              register={register}
              trigger={trigger}
              setValue={setValue}
            />
            <Outputs
              control={control}
              errors={errors}
              watch={watch}
              register={register}
              trigger={trigger}
              setValue={setValue}
            />
          </PfTabContent>

          <PfTabContent $isShown={selectedSection === 'vm'}>
            <VmEnvTab control={control} errors={errors} trigger={trigger} />
          </PfTabContent>

          <PfTabContent $isShown={selectedSection === 'script'}>
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <FormFields data-testid="script-editor">
                  <Help>
                    <span>Need help?</span>
                    <a href="/docs/guides/creating-apps#app-script" target="_blank" rel="noopener noreferrer">
                      {' '}
                      Learn more about app scripts
                    </a>
                  </Help>
                  <MonacoEditor
                    height="40vh"
                    onChange={value => field.onChange(value)}
                    defaultLanguage="shell"
                    defaultValue={field.value}
                  />
                </FormFields>
              )}
            />
          </PfTabContent>

          <PfTabContent $isShown={selectedSection === 'readme'}>
            <Controller
              name="readme"
              control={control}
              render={({ field }) => <ReadMeInput onChange={field.onChange} value={field.value} />}
            />
          </PfTabContent>
        </div>
        {appSeriesConfirmModal}
        {appRevisionConfirmModal}
      </StyledForm>
    </>
  )
}
