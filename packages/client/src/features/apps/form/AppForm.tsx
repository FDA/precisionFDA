/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useState } from 'react'
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
import { CreateAppForm, FileType, IApp } from '../apps.types'
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
]

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
    defaultValues: !defaultVals
      ? {
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
      : defaultVals,
  })

  const handleOpenAppConfigUpload = (ftype: FileType) => {
    setSelectedFileType(ftype)
    modal.setShowModal(true)
  }

  let pageTitle = 'Create App'
  if (isEdit) pageTitle = 'Edit App'
  if (isFork) pageTitle = 'Fork App'

  let submitHandler: (createAppSeries: boolean, createAppRevision: boolean) => Promise<void>
  const { modalComp: appSeriesConfirmModal, setShowModal: setShowAppSeriesConfirmModal } = useConfirmModal(
    'Confirm',
    CONFIRM_APP_SERIES,
    async () => {
      setShowAppSeriesConfirmModal(false)
      await submitHandler(true, false)
    },
  )
  const { modalComp: appRevisionConfirmModal, setShowModal: setShowAppRevisionConfirmModal } = useConfirmModal(
    'Confirm',
    CONFIRM_APP_REVISION,
    async () => {
      setShowAppSeriesConfirmModal(false)
      await submitHandler(false, true)
    },
  )

  submitHandler = async (createAppSeries: boolean, createAppRevision: boolean) => {
    const vals = getValues() as CreateAppForm
    const formatted: CreateAppPayload = {
      ...vals,
      is_new: false,
      ordered_assets: vals.ordered_assets?.map(asset => asset.uid),
      input_spec: vals.input_spec.map(i => {
        return {
          ...i,
          default: getDefaultValueFromForm(i.class, i.default),
          choices: i?.choices && getChoicesValueFromForm(i.class, i.choices),
        }
      }),
    } as CreateAppPayload
    formatted.createAppSeries = createAppSeries
    formatted.createAppRevision = createAppRevision
    try {
      await onSubmit(formatted)
    } catch (err) {
      const code = err.response?.data?.error?.code
      if (code === APP_SERIES_CREATION_NOT_REQUESTED) {
        setShowAppSeriesConfirmModal(true)
      }
      if (code === APP_REVISION_CREATION_NOT_REQUESTED) {
        setShowAppRevisionConfirmModal(true)
      }
    }
  }

  const backLink = isEdit || isFork ? `/${getBaseLink(spaceId)}/apps/${app?.uid}` : `/${getBaseLink(spaceId)}/apps`
  const backLabel = isEdit || isFork ? 'Back to App' : 'Back to Apps'

  return (
    <>
      <StyledBackLink linkTo={backLink}>{backLabel}</StyledBackLink>

      <StyledForm onSubmit={handleSubmit(() => submitHandler(false, false))} autoComplete="off">
        <Row>
          <PageTitle>{pageTitle}</PageTitle>
          <SubmitRow>
            {isSubmitting && <Loader />}
            {isEdit && (
              <>
                <span>Revision {app?.revision}</span>
                <ArrowLeftIcon right height={14} />
              </>
            )}
            <Button disabled={Object.keys(errors).length > 0 || isSubmitting} data-variant="primary" type="submit">
              {isEdit && <div>Save Revision {(app?.revision || 0) + 1}</div>}
              {isFork && <div>Save Fork</div>}
              {!isFork && !isEdit && <div>Create App</div>}
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
                  <label>Ubuntu Release</label>
                  <Select
                    {...field}
                    options={ubuntuReleasesOptions}
                    isDisabled={isSubmitting}
                    onChange={option => field.onChange(option?.value)}
                    value={ubuntuReleasesOptions.find(option => option.value === field.value)}
                    isOptionDisabled={option => option.disabled}
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
              <ErrorMessage errors={errors} name="title" render={({ message }) => <InputError>{message}</InputError>} />
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
              <a href="/docs/guides/creating-apps#input-and-output-spec" target="_blank">
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
                    <a href="/docs/guides/creating-apps#app-script" target="_blank">
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
