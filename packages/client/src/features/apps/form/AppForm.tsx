/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/Button'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { PageTitle } from '../../../components/Page/styles'
import { ButtonRow } from '../../../components/Public/styles'
import { PfTabContent } from '../../../components/Tabs/PfTab'
import {
  FieldGroup,
  InputError,
  SelectFieldLabel,
} from '../../../components/form/styles'
import { ArrowLeftIcon } from '../../../components/icons/ArrowLeftIcon'
import { StyledBackLink } from '../../home/home.styles'
import { CreateAppForm, FileType, IApp } from '../apps.types'
import { useUploadAppConfigFile } from '../useUploadAppConfigFile'
import { Inputs } from './Inputs'
import { Outputs } from './Outputs'
import { ReadMeInput } from './ReadMeInput'
import { VmEnvTab } from './VmEnvTab'
import {
  getChoicesValueFromForm,
  getDefaultValueFromForm,
  handleSnakeNameChange,
  validationSchema,
} from './common'
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
  TopFieldGroupUbuntu,
} from './styles'
import { getBaseLink } from '../run/utils'
import { getSpaceIdFromScope } from '../../../utils'
import { CreateAppPayload } from '../apps.api'
import { Select } from '../../../components/Select'
import MonacoEditor from '../../../components/MonacoEditor/MonacoEditor'

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
}: {
  isEdit?: boolean
  isFork?: boolean
  onSubmit: (vals: CreateAppPayload) => Promise<void>
  defaultVals?: CreateAppForm
  isSubmitting: boolean
  app?: IApp
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

  const submitHandler = async () => {
    const vals = getValues() as CreateAppForm

    const formatted: CreateAppPayload = {
      ...vals,
      is_new: false,
      ordered_assets: vals.ordered_assets?.map(asset => asset.uid),
      input_spec: vals.input_spec.map(i => {
        const spec = {
          ...i,
          default: getDefaultValueFromForm(i.class, i.default),
          choices: i?.choices && getChoicesValueFromForm(i.class, i.choices),
        }
        return spec
      }),
    }
    await onSubmit(formatted)
  }

  const backLink = isEdit || isFork ? `/${getBaseLink(spaceId)}/apps/${app?.uid}` : `/${getBaseLink(spaceId)}/apps`
  const backLabel = isEdit || isFork ? 'Back to App' : 'Back to Apps'

  return (
    <>
      <StyledBackLink
        linkTo={backLink}
      >
        {backLabel}
      </StyledBackLink>

      <StyledForm onSubmit={handleSubmit(submitHandler)} autoComplete="off">
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
            <Button
              disabled={Object.keys(errors).length > 0 || isSubmitting}
              data-variant='primary'
              type="submit"
            >
              {isEdit && <div>Save Revision {(app?.revision || 0) + 1}</div>}
              {isFork && <div>Save Fork</div>}
              {!isFork && !isEdit && <div>Create App</div>}
            </Button>
          </SubmitRow>
        </Row>
        <ButtonRow>
          <Button
            type="button"
            onClick={() => handleOpenAppConfigUpload('cwl')}
          >
            Import from .cwl file
          </Button>
          <Button
            type="button"
            onClick={() => handleOpenAppConfigUpload('wdl')}
          >
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
            <ErrorMessage
              errors={errors}
              name="name"
              render={({ message }) => <InputError>{message}</InputError>}
            />
          </TopFieldGroup>

          <TopFieldGroup>
            <label>Title</label>
            <InputText
              {...register('title', { required: 'Title is required.' })}
              disabled={isSubmitting}
            />
            <ErrorMessage
              errors={errors}
              name="title"
              render={({ message }) => <InputError>{message}</InputError>}
            />
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
                    onChange={(option) => field.onChange(option?.value)}
                    value={ubuntuReleasesOptions.find(option => option.value === field.value)}
                    isOptionDisabled={(option) => option.disabled}
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
        </FormSectionTop>

        <div>
          <TabRow>
            <StyledPfTab
              $isActive={selectedSection === 'io'}
              onClick={() => setSelectedSection('io')}
            >
              <TabTitle>I/O SPEC</TabTitle>
              <TabDesc>Configure Input & Output Fields</TabDesc>
            </StyledPfTab>
            <StyledPfTab
              $isActive={selectedSection === 'vm'}
              onClick={() => setSelectedSection('vm')}
            >
              <TabTitle>VM ENVIRONMENT</TabTitle>
              <TabDesc>Configure your resources</TabDesc>
            </StyledPfTab>
            <StyledPfTab
              $isActive={selectedSection === 'script'}
              onClick={() => setSelectedSection('script')}
            >
              <TabTitle>SCRIPT</TabTitle>
              <TabDesc>Write your shell script</TabDesc>
            </StyledPfTab>
            <StyledPfTab
              $isActive={selectedSection === 'readme'}
              onClick={() => setSelectedSection('readme')}
            >
              <TabTitle>README</TabTitle>
              <TabDesc>Describe your app</TabDesc>
            </StyledPfTab>
          </TabRow>

          <PfTabContent $isShown={selectedSection === 'io'}>
            <Help>
              <span>Need help?</span>
              <Link to="/docs/creating-apps#dev-io" target="_blank">
                {' '}
                Learn more about app inputs and outputs
              </Link>
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
            <VmEnvTab control={control} />
          </PfTabContent>

          <PfTabContent $isShown={selectedSection === 'script'}>
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <FormFields
                  data-testid="script-editor">
                  <Help>
                    <span>Need help?</span>
                    <Link to="/docs/creating-apps#dev-script" target="_blank">
                      {' '}
                      Learn more about app scripts
                    </Link>
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
              render={({ field }) => (
                <ReadMeInput onChange={field.onChange} value={field.value} />
              )}
            />
          </PfTabContent>
        </div>
      </StyledForm>
    </>
  )
}
