import * as Yup from 'yup'
import { MutationErrors } from '../../../types/utils'
import { IChallengeForm } from './ChallengeForm'
import { ChallengePayload } from '../api'

export const title = 'Challenges'
export const subtitle = 'Advancing regulatory standards for bioinformatics, RWD, and AI, through community-sourced science.'

const commonValidationSchema = {
  name: Yup.string().required('Name is required').max(150, 'Name cannot be longer than 150 characters'),
  cardImageId: Yup.string().nullable().optional(),
  cardImageUrl: Yup.string().nullable().optional(),
  cardImageFile: Yup.mixed().when('cardImageUrl', (cardImageUrl, schema) => {
    if (!cardImageUrl) {
      return schema.test('presence', 'Image file is required', (value: unknown) => {
        const files = value as FileList | undefined
        return !!files && files.length > 0
      })
    }
    return schema
  }),
  scope: Yup.object()
    .shape({
      value: Yup.string(),
    })
    .nullable()
    .required('Scope is required'),
  appOwnerId: Yup.object()
    .shape({
      value: Yup.number(),
    })
    .nullable()
    .required('Scoring App User is required'),
  startAt: Yup.date()
    .nullable()
    .typeError('Invalid Date')
    .required('Start Date is required'),
  endAt: Yup.date()
    .min(Yup.ref('startAt'), 'End date cannot be before start date')
    .nullable()
    .typeError('Invalid Date')
    .required('End Date is required'),
  status: Yup.object()
    .shape({
      value: Yup.string(),
    })
    .nullable()
    .required('Status is required'),
  preRegistrationUrl: Yup.string()
    .when('status', {
      is: (val: { value: string } | null | undefined) => val?.value === 'pre-registration',
      then: (schema: Yup.StringSchema) => schema.required('Preregistration link is required for the pre-registration status'),
      otherwise: (schema: Yup.StringSchema) => schema,
    })
    .test(
      'is-valid-url',
      "Link must be a valid URL and start with either 'http://' or 'https://'",
      value =>
        !value ||
        /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(
          value,
        ),
    ),
}

export const createValidationSchema = Yup.object().shape({
  ...commonValidationSchema,
  hostLeadDxuser: Yup.object()
    .shape({
      value: Yup.string(),
    })
    .nullable()
    .required('Host Lead User is required'),
  guestLeadDxuser: Yup.object()
    .shape({
      value: Yup.string(),
    })
    .nullable()
    .required('Guest Lead User is required'),
})

export const editValidationSchema = Yup.object().shape({
  ...commonValidationSchema,
  startAt: Yup.date()
    .nullable()
    .typeError('Invalid Date')
    .required('Start date is required'),
})

export const proposeValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email().required('Email is required'),
  organisation: Yup.string().required('Organisation is required'),
  specificQuestion: Yup.string().required('Please select one of the options'),
  specificQuestionText: Yup.string().when('specificQuestion', {
    is: (specificQuestion: string) => specificQuestion === 'Yes',
    then: Yup.string().required('Field is required'),
    otherwise: Yup.string().nullable(),
  }),
  dataDetails: Yup.string().required('Please select one of the options'),
  dataDetailsText: Yup.string().when('dataDetails', {
    is: (dataDetails: string) => dataDetails === 'Yes',
    then: Yup.string().required('Field is required'),
    otherwise: Yup.string().nullable(),
  }),
})

export function formatMutationErrors(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj?: any | unknown,
): MutationErrors | undefined {
  const nObj = obj
  if (nObj) {
    delete nObj['app_id']
    return {
      errors: [obj['app_id']],
      fieldErrors: { ...nObj },
    }
  }
  return undefined
}

export function mapFormToPayload(v: IChallengeForm): ChallengePayload {
  return {
    appOwnerId: v.appOwnerId?.value,
    description: v.description,
    endAt: v.endAt,
    guestLeadDxuser: v.guestLeadDxuser?.value,
    hostLeadDxuser: v.hostLeadDxuser?.value,
    image: v?.cardImageFile?.[0],
    name: v.name,
    preRegistrationUrl: v.preRegistrationUrl === '' ? null : v.preRegistrationUrl,
    scope: v.scope.value,
    startAt: v.startAt,
    status: v.status?.value,
  }
}
