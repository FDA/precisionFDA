import * as Yup from 'yup'

export const title = 'Data Portals'
export const subtitle = 'Customized presentation of instructions, tools, data, reports, and dashboards, for members of Portal Spaces.'

export const createValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required').min(2).max(256),
  url_slug: Yup.string().required('Url slug is required').min(3, 'Url slug must be at least 3 characters long').max(50, 'Url slug must be at most 50 characters long').matches(/^(?=.*[a-z])[a-z0-9-]+$/, 'Lowercase alphabetic characters, digits and dashes allowed only; At least one alphabetic character required.'),
  description: Yup.string().min(2).max(256),
  scope: Yup.object()
    .shape({
      value: Yup.string(),
    })
    .required('Scope is required'),
  app_owner_id: Yup.object()
    .shape({
      value: Yup.string(),
    })
    .required('App User is required'),
  host_lead_dxuser: Yup.object()
    .shape({
      value: Yup.string(),
    }).nullable().required('Data Portal Team Lead User is required'),
  guest_lead_dxuser: Yup.object()
    .shape({
      value: Yup.string(),
    }).nullable().required('Second Team Lead User is required'),
  status: Yup.object()
    .shape({
      value: Yup.string(),
    }).nullable().required('Status is required'),
  card_image_uid: Yup.string().nullable().optional(),
  card_image_file: Yup.mixed().test('presence', 'Image file is required', (value: FileList) => {
    if(value?.length > 0) {
      return true
    }
    return false
  }),
})

export const editValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required').min(2).max(256),
  description: Yup.string().min(2).max(256),
  sort_order: Yup.number().nullable().min(0),
  scope: Yup.object()
    .shape({
      value: Yup.string(),
    })
    .nullable()
    .required('Scope is required'),
  status: Yup.object()
    .shape({
      value: Yup.string(),
    })
    .nullable()
    .required('Status is required'),
})