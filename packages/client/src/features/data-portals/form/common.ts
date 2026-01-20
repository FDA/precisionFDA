import * as Yup from 'yup'

export const title = 'Data Portals'
export const subtitle =
  'Customized presentation of instructions, tools, data, reports, and dashboards, for members of Portal Spaces.'

export const dataPortalValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required').min(2).max(256),
  urlSlug: Yup.string()
    .required('URL slug is required')
    .min(3, 'URL slug must be at least 3 characters long')
    .max(50, 'URL slug must be at most 50 characters long')
    .matches(
      /^(?=.*[a-z])[a-z0-9-]+$/,
      'Lowercase alphabetic characters, digits and dashes allowed only; At least one alphabetic character required.',
    ),
  description: Yup.string().min(0).max(256).default(''),
  hostLeadDxuser: Yup.object({
    label: Yup.string().required('First Lead User is required'),
    value: Yup.string().required('First Lead User is required'),
  }),
  guestLeadDxuser: Yup.object({
    label: Yup.string().required('Second Lead User is required'),
    value: Yup.string().required('Second Lead User is required'),
  }),
  cardImageUid: Yup.string().nullable().default(null),
  cardImageFile: Yup.mixed<FileList>()
    .nullable()
    .test('presence', 'Image file is required', value => {
      if (!value || value.length > 0) {
        return true
      }
      return false
    })
    .default(null),
  sortOrder: Yup.number().default(0),
  cardImageUrl: Yup.string().nullable().default(null),
})
