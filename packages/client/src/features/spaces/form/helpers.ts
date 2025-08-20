import * as Yup from 'yup'
import { ISpace } from '../spaces.types'

export const getSpaceTypeOptions = ({
  isGovUser,
  isAdmin,
  isReviewAdmin,
}: {
  isGovUser: boolean
  isAdmin: boolean
  isReviewAdmin: boolean
}) => {
  const options: { value: ISpace['type']; label: string }[] = [{ value: 'private_type', label: 'Private' }]
  if (isGovUser) {
    options.push({ value: 'government', label: 'Government' })
  }
  if (isAdmin) {
    options.push({ value: 'administrator', label: 'Administrator' })
  }
  if (isReviewAdmin) {
    options.push({ value: 'review', label: 'Review' })
  }
  if (isReviewAdmin || isAdmin) {
    options.push({ value: 'groups', label: 'Group' })
  }
  return options
}

export const SPACE_TYPE_HINT: Record<ISpace['type'], string> = {
  private_type: 'Available to all users, and only consists of a private area.',
  groups:
    'Site admins can create a space in which any users can be invited.\nFor challenges, a group space is automatically created to house all user submissions.\nGroup spaces have two sides: Hosts and Guests.',
  review: 'Each Review Space has two areas: private and cooperative ones.\nReview Spaces have two sides: Reviewers and Sponsors.',
  government:
    'Only government users can create or join a Government‑Restricted Space.\nWhen adding members, a check the username belongs to a government user is performed.\nGovernment space only has one side, which is the Shared area.',
  administrator:
    'Only site admins can be members of an Administrator Space.\nMembership is implicit, i.e. all site admins can access and use any Administrator Space.\nAdministrator space has only one side, which is the Shared area.',
}

const nameOfLead = (leadType: 'guest' | 'host', spaceType: ISpace['type']) => {
  if (leadType === 'guest') {
    switch (spaceType) {
      case 'groups':
        return 'Guest'
      case 'review':
        return 'Sponsor'
      default:
        return 'Lead'
    }
  }
  // host
  switch (spaceType) {
    case 'groups':
      return 'Host'
    case 'review':
      return 'Review'
    default:
      return 'Lead'
  }
}

export const validationSchema = Yup.object().shape({
  space_type: Yup.string().required('Space type required'),
  name: Yup.string().required('Name required'),
  description: Yup.string().required('Description required'),
  guest_lead_dxuser: Yup.string()
    .nullable()
    .when('space_type', (space_type: string, schema: Yup.StringSchema<string | null | undefined>) =>
      ['groups', 'review'].includes(space_type)
        ? schema.required(`${nameOfLead('guest', space_type as ISpace['type'])} lead required`)
        : schema,
    ),

  host_lead_dxuser: Yup.string()
    .nullable()
    .when('space_type', (space_type: string, schema: Yup.StringSchema<string | null | undefined>) =>
      ['groups', 'review'].includes(space_type)
        ? schema.required(`${nameOfLead('host', space_type as ISpace['type'])} lead required`)
        : schema,
    ),
  cts: Yup.string()
    .nullable()
    .when('space_type', {
      is: (space_type: string) => space_type === 'review',
      then: Yup.string().nullable(),
    }),
  protected: Yup.boolean().nullable(),
})

export const editValidationSchema = Yup.object().shape({
  spaceType: Yup.string().required('Space type required'),
  name: Yup.string().required('Name required'),
  description: Yup.string().required('Description required'),
  cts: Yup.string()
    .nullable()
    .when('space_type', {
      is: (space_type: string) => space_type === 'review',
      then: Yup.string().nullable(),
    }),
})
