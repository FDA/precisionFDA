import * as Yup from 'yup'
import { ISpace } from '../spaces.types'

export const getSpaceTypeOptions = ({ isGovUser, isAdmin, isReviewAdmin, isDuplicate }: {
  isGovUser: boolean,
  isAdmin: boolean,
  isReviewAdmin: boolean,
  isDuplicate?: boolean
}) => {
  if (isDuplicate) {
    return [{ value: 'review', label: 'Review' }]
  }

  const options: { value: ISpace['type']; label: string }[] = [
    { value: 'private_type', label: 'Private' },
  ]
  if (isGovUser) {
    options.push({ value: 'government', label: 'Government' })
  }
  if (isAdmin) {
    options.push(
      { value: 'administrator', label: 'Administrator' },
      { value: 'groups', label: 'Group' },
    )
  }
  if (isReviewAdmin) {
    options.push({ value: 'review', label: 'Review' })
  }
  return options
}

export const SPACE_TYPE_HINT: Record<ISpace['type'], string> = {
  private_type: 'Available to all users, and only consists of a private area.',
  groups:
    'Site admins can create a space in which any users can be invited.\nFor challenges, a group space is automatically created to house all user submissions.\nGroup spaces has two sides (Host and Lead), ',
  review:
    'Each Review Space has 2 areas: private and cooperative ones.\nEach review Space has 2 sides: reviewers and sponsors.',
  government:
    'Only a government user may create or join a Government-Restriced Space.\nValidation and error message should appear in the "Create Space" and "Add Members" forms to check that an entered username belongs to a government user.\nGovernment spaces only has one side, which is the Shared area.',
  administrator:
    'Only site admins can be members of an Administrator Space. Membership is implicit, i.e. all site admins can access and use any Administrator Space\nAdministrator space has only one side, which is the Shared area',
}

export const validationSchema = Yup.object().shape({
  space_type: Yup.string().required('Engine required'),
  name: Yup.string().required('Name required'),
  description: Yup.string().required('Description required'),
  guest_lead_dxuser: Yup.string()
    .nullable()
    .when('space_type', {
      is: (space_type: string) => space_type === 'groups',
      then: Yup.string().required('Guest lead required'),
    }),
  review_lead_dxuser: Yup.string()
    .nullable()
    .when('space_type', {
      is: (space_type: string) => space_type === 'review',
      then: Yup.string().required('Review lead required'),
    }),
  host_lead_dxuser: Yup.string()
    .nullable()
    .when('space_type', {
      is: (space_type: string) => space_type === 'groups',
      then: Yup.string().required('Host lead required'),
    }),
  sponsor_lead_dxuser: Yup.string()
    .nullable()
    .when('space_type', {
      is: (space_type: string) => space_type === 'review',
      then: Yup.string().required('Sponsor lead required'),
    }),
  cts: Yup.string()
    .nullable()
    .when('space_type', {
      is: (space_type: string) => space_type === 'review',
      then: Yup.string().nullable(),
    }),
  protected: Yup.boolean().nullable(),
})
