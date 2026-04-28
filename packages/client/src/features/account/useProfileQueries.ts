import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import {
  deactivateOrgUser,
  fetchOrganizationUsers,
  fetchProfilePage,
  removeOrgMember,
  updateOrganizationName,
  updateProfile,
  updateTimeZone,
} from './profile.api'
import type { UpdateProfilePayload, UpdateTimeZonePayload } from './profile.types'

export const profileKeys = {
  all: ['profile'] as const,
  page: () => [...profileKeys.all, 'page'] as const,
  orgUsers: () => [...profileKeys.all, 'orgUsers'] as const,
}

export function useProfilePageQuery() {
  return useQuery({
    queryKey: profileKeys.page(),
    queryFn: fetchProfilePage,
    staleTime: 5 * 60 * 1000,
  })
}

export function useOrganizationUsersQuery(enabled = true) {
  return useQuery({
    queryKey: profileKeys.orgUsers(),
    queryFn: fetchOrganizationUsers,
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.page() })
      queryClient.invalidateQueries({ queryKey: ['auth-user'] })
      toastSuccess('Profile updated successfully')
    },
  })
}

export function useUpdateTimeZoneMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateTimeZonePayload) => updateTimeZone(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.page() })
      queryClient.invalidateQueries({ queryKey: ['auth-user'] })
      toastSuccess('Time zone updated successfully')
    },
    onError: (error: Error) => {
      toastError(`Failed to update time zone: ${error.message}`)
    },
  })
}

export function useUpdateOrganizationNameMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => updateOrganizationName(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.page() })
      toastSuccess('Organization name updated successfully')
    },
    onError: (error: Error) => {
      toastError(`Failed to update organization name: ${error.message}`)
    },
  })
}

export function useDeactivateOrgUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => deactivateOrgUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.orgUsers() })
      toastSuccess('User has been deactivated')
    },
    onError: (error: Error) => {
      toastError(`Failed to deactivate user: ${error.message}`)
    },
  })
}

export function useRemoveOrgMemberMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => removeOrgMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.orgUsers() })
      toastSuccess('Member removal request has been submitted for approval')
    },
    onError: (error: Error) => {
      toastError(`Failed to submit removal request: ${error.message}`)
    },
  })
}
