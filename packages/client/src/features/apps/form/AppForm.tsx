/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useState, useCallback } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '../../../components/Button'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import MonacoEditor from '../../../components/MonacoEditor/MonacoEditor'
import { PageTitle } from '../../../components/Page/styles'
import { ButtonRow } from '../../../components/Public/styles'
import { Select } from '../../../components/Select'
import { PfTabContent } from '../../../components/Tabs/PfTab'
import { FieldGroup, InputError } from '../../../components/form/styles'
import { ArrowLeftIcon } from '../../../components/icons/ArrowLeftIcon'
import { APP_REVISION_CREATION_NOT_REQUESTED, APP_SERIES_CREATION_NOT_REQUESTED } from '../../../constants'
import { CONFIRM_APP_REVISION, CONFIRM_APP_SERIES } from '../../../constants/consts'
import { getSpaceIdFromScope } from '../../../utils'
import { useConfirmModal } from '../../files/actionModals/useConfirmModal'
import { StyledBackLink } from '../../home/home.styles'
import { CreateAppPayload } from '../apps.api'
import { CreateAppForm, FileType, IApp, InputSpec } from '../apps.types'
import { getBaseLink } from '../run/utils'
import { useUploadAppConfigFile } from '../useUploadAppConfigFile'
import { Inputs } from './Inputs'
import { Outputs } from './Outputs'
import { ReadMeInput } from './ReadMeInput'
import { VmEnvTab } from './VmEnvTab'
import { getChoicesValueFromForm, getDefaultValueFromForm, handleSnakeNameChange, validationSchema } from './common'
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

type SelectedSection = 'io' | 'vm' | 'script' | 'readme'

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

export const AppForm = ({
  isEdit = false,
  isFork = false,
  onSubmit,
  defaultVals,
  isSubmitting,
  app,
  targetScopeName,
}: {
  isEdit?: boolean
  isFork?: boolean
  onSubmit: (vals: CreateAppPayload) => Promise<void>
  defaultVals?: CreateAppForm
  isSubmitting: boolean
  app?: IApp
  targetScopeName?: string
}) => {
  const spaceId = getSpaceIdFromScope(app?.scope)
  const [selectedSection, setSelectedSection] = useState<SelectedSection>('io')
  const [selectedFileType, setSelectedFileType] = useState<FileType>('cwl')
  const modal = useUploadAppConfigFile({ filetype: selectedFileType })

  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CreateAppForm>({
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
    defaultValues: defaultVals || initialFormValues,
  })

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

  const performSubmit = useCallback(async (createAppSeries: boolean, createAppRevision: boolean) => {
    const vals = getValues()
    const formatted: CreateAppPayload = {
      ...vals,
      is_new: false,
      ordered_assets: vals.ordered_assets?.map(asset => asset.uid),
      input_spec: vals.input_spec.map(i => ({
        ...i,
        default: getDefaultValueFromForm(i.class, i.default) as InputSpec['default'],
        choices: i?.choices && getChoicesValueFromForm(i.class, i.choices) as InputSpec['choices'],
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
      } else {
        // Optional: re-throw or handle other errors if needed
        // console.error("Submission error:", err);
      }
    }
  }, [getValues, onSubmit, setShowAppSeriesConfirmModal, setShowAppRevisionConfirmModal])


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
        <ButtonRow>
          <Button type="button" onClick={() => handleOpenAppConfigUpload('cwl')}>
            Import from .cwl file
          </Button>
          <Button type="button" onClick={() => handleOpenAppConfigUpload('wdl')}>
            Import from .wdl file
          </Button>
        </ButtonRow>
        {modal.modalComp}
        <FormSectionTop>
          <TopFieldGroup>
            <label>Name</label>
            <InputText
              {...register('name', {
                required: 'Name is required.',
                onChange: handleSnakeNameChange,
              })}
              disabled={isEdit || isSubmitting}
            />
            <ErrorMessage errors={errors} name="name" render={({ message }) => <InputError>{message}</InputError>} />
          </TopFieldGroup>

          <TopFieldGroup>
            <label>Title</label>
            <InputText {...register('title', { required: 'Title is required.' })} disabled={isSubmitting} />
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
                    {...field}
                    options={ubuntuReleasesOptions}
                    isDisabled={isSubmitting}
                    onChange={option => field.onChange((option as { value: string })?.value)}
                    value={ubuntuReleasesOptions.find(option => option.value === field.value)}
                    isOptionDisabled={option => (option as { disabled: boolean }).disabled}
                    inputId="app-ubuntu-release"
                  />
                  <ErrorMessage errors={errors} name="release" render={({ message }) => <InputError>{message}</InputError>} />
                </TopFieldGroupUbuntu>
              )}
            />
          </FieldGroup>
          {isFork && (
            <TopFieldGroupTarget>
              <label>Target</label>
              <InputText value={targetScopeName} disabled={true} />
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
            <Inputs control={control} errors={errors} watch={watch} register={register} trigger={trigger} setValue={setValue} />
            <Outputs control={control} errors={errors} watch={watch} register={register} trigger={trigger} setValue={setValue} />
          </PfTabContent>

          <PfTabContent $isShown={selectedSection === 'vm'}>
            <VmEnvTab control={control} />
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
