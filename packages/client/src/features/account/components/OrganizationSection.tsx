import React, { useState } from 'react'
import clsx from 'clsx'
import { Pencil, UserPlus } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/Button'
import { ModalHeaderTop, ModalNext } from '@/features/modal/ModalNext'
import { Dialog } from '@/features/modal/useConfirm/Dialog'
import { OrgUser, ProfileOrganization, ProfileUser } from '../profile.types'
import {
  useDeactivateOrgUserMutation,
  useRemoveOrgMemberMutation,
  useUpdateOrganizationNameMutation,
} from '../useProfileQueries'
import styles from './OrganizationSection.module.css'

interface OrganizationSectionProps {
  user: ProfileUser
  organization: ProfileOrganization
  users: OrgUser[]
}

export function OrganizationSection({ user, organization, users }: OrganizationSectionProps): React.ReactElement {
  const [isEditingName, setIsEditingName] = useState(false)
  const [newOrgName, setNewOrgName] = useState(organization.name)
  const updateOrgNameMutation = useUpdateOrganizationNameMutation()

  const handleSaveOrgName = (): void => {
    if (newOrgName.trim() && newOrgName !== organization.name) {
      updateOrgNameMutation.mutate(newOrgName.trim(), {
        onSuccess: () => {
          setIsEditingName(false)
        },
      })
      return
    }
    setIsEditingName(false)
  }

  const handleCancelEdit = (): void => {
    setNewOrgName(organization.name)
    setIsEditingName(false)
  }

  return (
    <div className={styles.container}>
      <p className={styles.description}>Manage organization details and members.</p>
      <div className={styles.orgInfo}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Handle</span>
          <span className={styles.infoValue}>{organization.handle}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Name</span>
          {isEditingName ? (
            <div className={styles.editNameContainer}>
              <input
                type="text"
                className={styles.input}
                value={newOrgName}
                onChange={e => setNewOrgName(e.target.value)}
              />
              <div className={styles.editNameActions}>
                <Button onClick={handleSaveOrgName} data-variant="primary" disabled={updateOrgNameMutation.isPending}>
                  {updateOrgNameMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={handleCancelEdit}>Cancel</Button>
              </div>
            </div>
          ) : (
            <span className={styles.infoValue}>
              {organization.name}
              {user.isOrgAdmin && (
                <button type="button" className={styles.editButton} onClick={() => setIsEditingName(true)}>
                  <Pencil size={12} />
                  Edit
                </button>
              )}
            </span>
          )}
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Administrator</span>
          <span className={styles.infoValue}>{organization.adminFullName}</span>
        </div>
      </div>

      <OrgUsersTable users={users} currentUserId={user.id} isAdmin={user.isOrgAdmin} />

      {user.canProvisionAccounts && (
        <div className={styles.buttonGroup}>
          <Button data-variant="primary" as={Link} to="/account/admin/users/invitations/provisioning">
            <UserPlus size={16} />
            Provision new user under &quot;{organization.name}&quot;
          </Button>
        </div>
      )}
    </div>
  )
}

type PendingAction = {
  type: 'deactivate' | 'remove'
  user: OrgUser
}

interface OrgUsersTableProps {
  users: OrgUser[]
  currentUserId: number
  isAdmin: boolean
}

function OrgUsersTable({ users, currentUserId, isAdmin }: OrgUsersTableProps): React.ReactElement {
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const deactivateMutation = useDeactivateOrgUserMutation()
  const removeMutation = useRemoveOrgMemberMutation()

  const handleConfirm = (): void => {
    if (!pendingAction) return

    const onSettled = () => setPendingAction(null)

    if (pendingAction.type === 'deactivate') {
      deactivateMutation.mutate(pendingAction.user.id, { onSettled })
    } else {
      removeMutation.mutate(pendingAction.user.id, { onSettled })
    }
  }

  const isActionPending = deactivateMutation.isPending || removeMutation.isPending

  if (users.length === 0) {
    return <p>No users found in your organization.</p>
  }

  return (
    <>
      <table className={styles.usersTable}>
        <thead>
          <tr>
            <th>Username</th>
            <th>Name</th>
            <th>Joined</th>
            <th>Status</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map(orgUser => (
            <tr key={orgUser.id}>
              <td>
                <Link to={`/users/${orgUser.dxuser}`} className={styles.userLink}>
                  {orgUser.dxuser}
                </Link>
              </td>
              <td>{orgUser.fullName}</td>
              <td>{formatDate(orgUser.createdAt)}</td>
              <td>
                <span
                  className={clsx(styles.statusBadge, orgUser.isEnabled ? styles.statusActive : styles.statusInactive)}
                >
                  {orgUser.isEnabled ? 'Active' : 'Inactive'}
                </span>
                {orgUser.isAdmin && <span className={clsx(styles.statusBadge, styles.statusAdmin)}>Admin</span>}
              </td>
              {isAdmin && (
                <td>
                  {orgUser.id !== currentUserId && !orgUser.isAdmin && (
                    <div className={styles.orgActions}>
                      {orgUser.isEnabled && (
                        <Button
                          onClick={() => setPendingAction({ type: 'deactivate', user: orgUser })}
                        >
                          Deactivate
                        </Button>
                      )}
                      <Button
                        onClick={() => setPendingAction({ type: 'remove', user: orgUser })}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <ModalNext
        id="org-user-action-confirm"
        isShown={pendingAction !== null}
        hide={() => !isActionPending && setPendingAction(null)}
      >
        <ModalHeaderTop
          headerText={pendingAction?.type === 'deactivate' ? 'Deactivate User' : 'Remove Member'}
          hide={() => !isActionPending && setPendingAction(null)}
        />
        <Dialog
          body={
            pendingAction?.type === 'deactivate' ? (
              <p>
                Are you sure you want to deactivate <strong>{pendingAction.user.fullName}</strong>?
                They will no longer be able to log in.
              </p>
            ) : (
              <p>
                Are you sure you want to remove <strong>{pendingAction?.user.fullName}</strong> from
                the organization? This will create a request pending FDA admin approval.
              </p>
            )
          }
          ok={handleConfirm}
          okText={isActionPending ? 'Processing...' : pendingAction?.type === 'deactivate' ? 'Deactivate' : 'Remove'}
          cancel={() => setPendingAction(null)}
          cancelText="Cancel"
          dataVariant="warning"
        />
      </ModalNext>
    </>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
