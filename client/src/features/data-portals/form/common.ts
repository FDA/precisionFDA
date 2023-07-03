import * as Yup from 'yup'

export const title = 'Data Portals'
export const subtitle = 'Customized presentation of instructions, tools, data, reports, and dashboards, for members of Portal Spaces.'

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
  card_image_uid: Yup.string().nullable().optional(),
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