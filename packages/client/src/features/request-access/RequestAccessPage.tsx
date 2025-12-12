import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React, { createContext, useCallback, useContext, useState } from 'react'
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import * as Yup from 'yup'
import { Button } from '../../components/Button'
import { Checkbox } from '../../components/Checkbox'
import { FieldGroup } from '../../components/form/FieldGroup'
import { CheckboxLabel, InputError } from '../../components/form/styles'
import { InputText } from '../../components/InputText'
import { Loader } from '../../components/Loader'
import { PFDALogoDark, PFDALogoLight } from '../../components/NavigationBar/PFDALogo'
import PublicLayout from '../../layouts/PublicLayout'
import { createRequestAccess } from './api'
import { RequestAccessSuccessMessage } from './RequestAccessSuccessMessage'
import {
  CheckboxGroup,
  CheckboxRow,
  FlexRow,
  FormGroup,
  FormHeader,
  FormWrapper,
  LogoBar,
  RequestAccessPageContainer,
  SectionTitle,
  StyledForm,
} from './style'
import { RequestAccess, RequestAccessPayload } from './type'
import { toastError } from '../../components/NotificationCenter/ToastHelper'

const requestAccessValidationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email().required('Email is required'),
  reason: Yup.string().required('Reason is required'),
})

const RequestAccessContext = createContext<{
  submissionSuccess: boolean
  setSubmissionSuccess: React.Dispatch<React.SetStateAction<boolean>>
} | null>(null)

const useRequestAccess = () => {
  const ctx = useContext(RequestAccessContext)
  if (!ctx) {
    throw new Error('useRequestAccess must be used within a RequestAccessProvider')
  }
  return ctx
}

const RequestAccessForm = () => {
  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    duns: '',
    reason: '',
    participateIntent: false,
    organizeIntent: false,
    reqData: '',
    reqSoftware: '',
    researchIntent: false,
    clinicalIntent: false,
  }
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RequestAccessPayload>({
    resolver: yupResolver(requestAccessValidationSchema),
    defaultValues: { ...defaultValues },
  })

  const { setSubmissionSuccess } = useRequestAccess()
  const mutation = useMutation({
    mutationKey: ['request-access'],
    mutationFn: (payload: RequestAccessPayload) => createRequestAccess(payload),
    onSuccess: () => {
      setSubmissionSuccess(true)
    },
    onError: (e: AxiosError<{ error: { code: string; type: string; message: string } }>) => {
      const error = e?.response?.data?.error
      const errorStatus = e.response?.status
      const errorCode = error?.code ?? ''
      if (errorStatus === 400 && ['E_EMAIL_EXISTS'].includes(errorCode)) {
        setError('email', { message: error!.message })
        toastError('Some information is missing or incorrect. Please review and try again.')
      } else if (errorStatus === 400 && ['E_INVALID_CAPTCHA'].includes(errorCode)) {
        toastError('Captcha verification failed. Please try again.', { autoClose: false })
      } else {
        toastError('An unexpected error occurred. Please try again.', { autoClose: false })
      }
    },
  })

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.name as keyof RequestAccessPayload, e.target.checked)
  }

  const { executeRecaptcha } = useGoogleReCaptcha()

  const submitWithCaptcha = useCallback(
    async (data: RequestAccess) => {
      if (!executeRecaptcha) {
        return
      }

      const token = await executeRecaptcha('request_access')
      const payload: RequestAccessPayload = {
        ...data,
        captchaValue: token,
      }
      mutation.mutateAsync(payload)
    },
    [executeRecaptcha],
  )

  const onSubmitRequestAccess = (data: RequestAccess) => {
    if (!CAPTCHA_ENABLED) {
      mutation.mutateAsync(data)
      return
    }

    submitWithCaptcha(data)
  }

  return (
    <StyledForm onSubmit={handleSubmit(onSubmitRequestAccess)} autoComplete="off">
      <FormGroup>
        <SectionTitle>About me</SectionTitle>
        <FlexRow>
          <FieldGroup label="First name" required>
            <InputText {...register('firstName')} />
            <ErrorMessage errors={errors} name="firstName" render={({ message }) => <InputError>{message}</InputError>} />
          </FieldGroup>
          <FieldGroup label="Last name" required>
            <InputText {...register('lastName')} />
            <ErrorMessage errors={errors} name="lastName" render={({ message }) => <InputError>{message}</InputError>} />
          </FieldGroup>
        </FlexRow>
        <FieldGroup label="Email" required>
          <InputText {...register('email')} />
          <ErrorMessage errors={errors} name="email" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
        <FieldGroup label="DUNS">
          <InputText {...register('duns')} />
          <ErrorMessage errors={errors} name="duns" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
      </FormGroup>
      <FormGroup>
        <SectionTitle>My interest in precisionFDA</SectionTitle>
        <FieldGroup label="Tell us a bit more about your goals or reasons for requesting access" required>
          <InputText {...register('reason')} />
          <ErrorMessage errors={errors} name="reason" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
        <CheckboxGroup>
          <h5>Do you intend to organize or participate in a community challenge or appathon?</h5>
          <CheckboxRow>
            <CheckboxLabel>
              <Checkbox {...register('participateIntent')} onChange={handleCheckboxChange} />
              Yes, I intend to participate
            </CheckboxLabel>
            <CheckboxLabel>
              <Checkbox {...register('organizeIntent')} onChange={handleCheckboxChange} />
              Yes, I intend to organize
            </CheckboxLabel>
          </CheckboxRow>
        </CheckboxGroup>
        <FieldGroup label="Do you have any data to contribute? If so, list below.">
          <InputText {...register('reqData')} />
          <ErrorMessage errors={errors} name="reqData" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
        <FieldGroup label="Do you have any software to contribute? If so, list below.">
          <InputText {...register('reqSoftware')} />
          <ErrorMessage errors={errors} name="reqSoftware" render={({ message }) => <InputError>{message}</InputError>} />
        </FieldGroup>
        <CheckboxGroup>
          <h5>Ultimately, what do you see as your intended use for precisionFDA?</h5>
          <CheckboxRow>
            <CheckboxLabel>
              <Checkbox {...register('researchIntent')} onChange={handleCheckboxChange} />
              Research use
            </CheckboxLabel>
            <CheckboxLabel>
              <Checkbox {...register('clinicalIntent')} onChange={handleCheckboxChange} />
              Clinical use
            </CheckboxLabel>
          </CheckboxRow>
        </CheckboxGroup>
      </FormGroup>
      <Button data-variant="primary" type="submit" disabled={!isValid || isSubmitting}>
        Request Access to precisionFDA
      </Button>
      {isSubmitting && <Loader />}
    </StyledForm>
  )
}

const RequestAccessFormWrapper = () => {
  return (
    <FormWrapper>
      <FormHeader>
        <h3>Request Access to precisionFDA</h3>
        <p>To request access, please leave your information below.</p>
        <p>
          If you already have a contributor account, proceed to&nbsp;
          <Link to="/" title="precisionFDA Home Page">
            Log In
          </Link>
        </p>
      </FormHeader>
      {CAPTCHA_ENABLED && (
        <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY} useEnterprise>
          <RequestAccessForm />
        </GoogleReCaptchaProvider>
      )}
      {!CAPTCHA_ENABLED && <RequestAccessForm />}
    </FormWrapper>
  )
}

const RequestAccessPage = () => {
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false)
  return (
    <RequestAccessContext.Provider value={{ submissionSuccess, setSubmissionSuccess }}>
      <PublicLayout>
        <LogoBar>
          <Link to="/" title="precisionFDA Home Page">
            <PFDALogoLight className="brand-logo brand-logo-light" />
            <PFDALogoDark className="brand-logo brand-logo-dark" />
          </Link>
        </LogoBar>
        <RequestAccessPageContainer>
          {submissionSuccess && <RequestAccessSuccessMessage />}
          {!submissionSuccess && <RequestAccessFormWrapper />}
        </RequestAccessPageContainer>
      </PublicLayout>
    </RequestAccessContext.Provider>
  )
}

export default RequestAccessPage
