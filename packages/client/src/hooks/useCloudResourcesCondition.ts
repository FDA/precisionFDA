import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React from 'react'
import { toastError } from '@/components/NotificationCenter/ToastHelper'
import { useAuthUser } from '@/features/auth/useAuthUser'

export type CloudResourcesResponse = {
  computeCharges: number
  storageCharges: number
  dataEgressCharges: number
  totalCharges: number
  usageLimit: number
  jobLimit: number
  usageAvailable: number
}

export const fetchCloudResources = async () => {
  return axios.get<CloudResourcesResponse>('/api/v2/users/me/cloud-resources').then(r => r.data)
}

export const useCloudResourcesQuery = () =>
  useQuery({
    queryKey: ['cloud_resources'],
    queryFn: fetchCloudResources,
  })

// TODO(samuel) find a better place where to define this
export const TOTAL_LIMIT_EXCEEDED_TEXT =
  'This precisionFDA account has reached its cloud platform resource \
limit and uploads, downloads, and executions are not available.\n\
Please email precisionFDA@fda.hhs.gov to request additional cloud \
platform resources.'
export const NO_RESOURCES_ALLOWED =
  'This precisionFDA account does not have any instance type authorized to run execution.\n\
Pleae email precisionFDA@fda.hhs.gov to request authorization to one or more instance types.'
export const EXECUTIONS_NOT_ALLOWED =
  'This precisionFDA user is not authorized to run executions at this time.\n\
Please email precisionFDA@fda.hhs.gov to request authorization to run executions.'

export type CloudResourcesConditionType = 'totalLimitCheck' | 'all'

export const useCloudResourcesCondition = (condition: CloudResourcesConditionType) => {
  const user = useAuthUser()
  const query = useCloudResourcesQuery()

  const isUsageAvailable = query.isSuccess ? query.data!.usageAvailable > 0 : true
  const isJobLimitPositive = query.isSuccess ? query.data!.jobLimit > 0 : true
  const hasUserSomeResourcesAllowed = query.isSuccess && user?.resources ? user.resources.length > 0 : true
  switch (condition) {
    case 'all': {
      const state = [
        { isUserAllowed: isJobLimitPositive, errorMessage: EXECUTIONS_NOT_ALLOWED },
        { isUserAllowed: isUsageAvailable, errorMessage: TOTAL_LIMIT_EXCEEDED_TEXT },
        { isUserAllowed: hasUserSomeResourcesAllowed, errorMessage: NO_RESOURCES_ALLOWED },
      ] as const
      const isAllowed = state.every(({ isUserAllowed }) => isUserAllowed)
      const messages = state.filter(({ isUserAllowed }) => !isUserAllowed).map(({ errorMessage }) => errorMessage)
      const onViolation = () => {
        const content =
          messages.length > 1
            ? React.createElement(
                'div',
                null,
                React.createElement('p', null, 'Following errors were encountered:'),
                React.createElement(
                  'ul',
                  { className: 'list-disc pl-5' },
                  ...messages.map((msg, i) =>
                    React.createElement('li', { key: i, className: 'whitespace-pre-wrap' }, msg),
                  ),
                ),
              )
            : messages[0]
        toastError(content, { toastId: `Cloud resources exceeded - condition "${condition}"` })
      }
      return {
        query,
        isAllowed,
        onViolation,
      }
    }
    case 'totalLimitCheck': {
      const isAllowed = isUsageAvailable
      const onViolation = () => {
        toastError(TOTAL_LIMIT_EXCEEDED_TEXT, { toastId: `Cloud resources exceeded - condition "${condition}"` })
      }
      return {
        query,
        isAllowed,
        onViolation,
      }
    }
  }
}
