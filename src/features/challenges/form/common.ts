import * as Yup from 'yup'

export const title = 'Challenges'
export const subtitle = 'Advancing regulatory standards for bioinformatics, RWD, and AI, through community-sourced science.'


export const createValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
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
  status: Yup.object()
    .shape({
      value: Yup.string(),
    })
    .nullable()
    .required('Status is required'),
  cardImage: Yup.mixed().test(
    'present',
    'An image file is required',
    value => value && value.length === 1,
  ),
})

export const editValidationSchema = Yup.object().shape({
  start_at: Yup.date()
    .nullable()
    .typeError('Invalid Date')
    .required('Start date is required'),
  end_at: Yup.date()
    .min(Yup.ref('start_at'), 'End date cannot be before start date')
    .typeError('Invalid Date')
    .nullable()
    .required('End Date is required'),
  name: Yup.string().required('Name is required'),
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
  status: Yup.object()
    .shape({
      value: Yup.string(),
    })
    .nullable()
    .required('Status is required'),
})

export const proposeValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email().required('Email is required'),
  organisation: Yup.string().required('Organisation is required'),
  specific_question: Yup.string().required("Please select one of the options"),
  specific_question_text: Yup.string().when('specific_question', {
    is: (specific_question: string) => specific_question === 'Yes',
    then: Yup.string().required('Field is required'),
    otherwise: Yup.string().nullable()
  }),
  data_details: Yup.string().required("Please select one of the options"),
  data_details_text: Yup.string().when('data_details', {
    is: (data_details: string) => data_details === 'Yes',
    then: Yup.string().required('Field is required'),
    otherwise: Yup.string().nullable()
  })
})