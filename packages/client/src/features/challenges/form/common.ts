import * as Yup from 'yup'
import { MutationErrors } from '../../../types/utils'
import { IChallengeForm } from './ChallengeForm'
import { ChallengePayload } from '../api'

export const title = 'Challenges'
export const subtitle = 'Advancing regulatory standards for bioinformatics, RWD, and AI, through community-sourced science.'

const commonValidationSchema = {
  name: Yup.string().required('Name is required').max(150, 'Name cannot be longer than 150 characters'),
  card_image_id: Yup.string().nullable().optional(),
  card_image_url: Yup.string().nullable().optional(),
  card_image_file: Yup.mixed()
  .when('card_image_url', {
    is: (val: string) => !val,
    then: Yup.mixed().test('presence', 'Image file is required', (value: FileList) => {
      if(value?.length > 0) {
        return true
      }
      return false
    }),
  }),
  scope: Yup.object()
    .shape({
      value: Yup.string(),
    })
    .nullable()
    .required('Scope is required'),
  app_owner_id: Yup.object()
    .shape({
      value: Yup.string(),
    })
    .nullable()
    .required('Scoring App User is required'),
  start_at: Yup.date()
    .min(new Date(), 'Start date has to be in the future')
    .nullable()
    .typeError('Invalid Date')
    .required('Start Date is required'),
  end_at: Yup.date()
    .min(Yup.ref('start_at'), 'End date cannot be before start date')
    .nullable()
    .typeError('Invalid Date')
    .required('End Date is required'),
  status: Yup.object()
    .shape({
      value: Yup.string(),
    })
    .nullable()
    .required('Status is required'),
  pre_registration_url: Yup.string()
    .when('status', {
      is: (val: { value: string }) => val?.value === 'pre-registration',
      then: Yup.string()
        .required('Preregistration link is required for the pre-registration status')
    }).test(
      'is-valid-url',
      'Link must be a valid URL and start with either \'http://\' or \'https://\'',
      value => !value || /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(value)
    ),
}

export const createValidationSchema = Yup.object().shape({
  ...commonValidationSchema,
  host_lead_dxuser: Yup.object()
    .shape({
      value: Yup.string(),
    })
    .nullable()
    .required('Host Lead User is required'),
  guest_lead_dxuser: Yup.object()
    .shape({
      value: Yup.string(),
    })
    .nullable()
    .required('Guest Lead User is required'),
})

export const editValidationSchema = Yup.object().shape({
  ...commonValidationSchema,
  start_at: Yup.date()
    .nullable()
    .typeError('Invalid Date')
    .required('Start date is required'),
})

export const proposeValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email().required('Email is required'),
  organisation: Yup.string().required('Organisation is required'),
  specific_question: Yup.string().required('Please select one of the options'),
  specific_question_text: Yup.string().when('specific_question', {
    is: (specific_question: string) => specific_question === 'Yes',
    then: Yup.string().required('Field is required'),
    otherwise: Yup.string().nullable(),
  }),
  data_details: Yup.string().required('Please select one of the options'),
  data_details_text: Yup.string().when('data_details', {
    is: (data_details: string) => data_details === 'Yes',
    then: Yup.string().required('Field is required'),
    otherwise: Yup.string().nullable(),
  }),
})

export function formatMutationErrors(
  obj?: Record<string, any> | unknown,
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
    app_owner_id: v.app_owner_id?.value,
    description: v.description,
    end_at: v.end_at,
    guest_lead_dxuser: v.guest_lead_dxuser?.value,
    host_lead_dxuser: v.host_lead_dxuser?.value,
    image: v?.card_image_file?.[0],
    name: v.name,
    pre_registration_url: v.pre_registration_url,
    scope: v.scope.value,
    start_at: v.start_at,
    status: v.status?.value,
  }
}
