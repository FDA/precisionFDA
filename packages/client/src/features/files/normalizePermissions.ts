import type { IFile, IFolder, NodePermissions } from '@/features/files/files.types'
import type { ISpace } from '@/features/spaces/spaces.types'
import type { IUser } from '@/types/user'

const CAN_EDIT_ROLES = ['lead', 'admin', 'contributor'] as const

/**
 * Returns a resolved NodePermissions object for a file or folder item.
 *
 * When the server-provided `permissions` field exists (NestJS endpoint),
 * it is returned directly. Otherwise, permissions are derived from the
 * item's fields and the current user/space context. This fallback keeps
 * the client working during the migration from Ruby list endpoints to
 * NestJS endpoints that include server-computed permissions.
 */
export function normalizePermissions(
  item: IFile | IFolder,
  user: IUser | undefined,
  space: ISpace | undefined,
): NodePermissions {
  if (item.permissions) return item.permissions

  const isOwnerByDxuser = !!item.addedByDxuser && item.addedByDxuser === user?.dxuser
  const isOwnerByFullName = item.addedBy === user?.full_name
  const isOwner = isOwnerByDxuser || (!item.addedByDxuser && isOwnerByFullName)
  const isAdmin = !!user?.admin
  const isClosed = item.stiType === 'UserFile' ? item.state === 'closed' : true
  const isFolder = item.stiType === 'Folder'
  const isResource = 'resource' in item && (item as IFile).resource

  const inSpace = !!space
  const memberRole = space?.current_user_membership?.role
  const isSpaceLead = inSpace && (space.host_lead?.id === user?.id || space.guest_lead?.id === user?.id)
  const hasEditRole = inSpace && !!memberRole && CAN_EDIT_ROLES.includes(memberRole as (typeof CAN_EDIT_ROLES)[number])
  const isProtectedAndNotLead = inSpace && !!space.protected && !isSpaceLead
  // Public nodes are removable only by site admins, including own public nodes.
  const isPublicScope = item.scope === 'public'

  // No license required -> can pass this check
  // License required + download link present -> can pass
  // License required + download link missing/empty -> blocked
  const requiresAcceptedLicense = 'fileLicense' in item && !!(item as IFile).fileLicense?.id
  const hasLegacyDownloadLink = !('downloadLink' in item) || !!(item as IFile).downloadLink
  const canDownloadWithLicense = !requiresAcceptedLicense || hasLegacyDownloadLink

  return {
    canDelete:
      !item.locked &&
      !isResource &&
      !isProtectedAndNotLead &&
      (isAdmin || ((isOwner || (inSpace && hasEditRole)) && !isPublicScope)),
    canMove: !item.locked && isClosed && !isProtectedAndNotLead && (isOwner || isAdmin || (inSpace && hasEditRole)),
    canDownload: (isFolder || isClosed) && !item.locked && canDownloadWithLicense && !isProtectedAndNotLead,
    canCopy: isClosed && (!item.locked || isSpaceLead),
    canEdit: (isOwner || isAdmin) && !item.locked && !isResource,
    canFeature: isAdmin,
    canPublish: isAdmin && item.scope === 'private' && (isFolder || isClosed),
    canLock: !item.locked && (isSpaceLead || (isOwner && !inSpace)),
    canUnlock: item.locked && (isSpaceLead || (isOwner && !inSpace)),
  }
}
