import { ISpace } from '../spaces.types'

export const getSpaceTypeOptions = ({ isGovUser, isAdmin, isReviewAdmin }: {
  isGovUser: boolean,
  isAdmin: boolean,
  isReviewAdmin: boolean,
}) => {
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
