import { describe, expect, it } from 'vitest'
import type { IUser } from '@/types/user'
import type { IFile, IFolder } from './files.types'
import { normalizePermissions } from './normalizePermissions'

const baseFolder = (): IFolder => ({
  state: null,
  id: 1,
  name: 'folder',
  stiType: 'Folder',
  locked: false,
  location: 'Private',
  addedBy: 'Test User',
  createdAt: '2026-01-01T00:00:00.000Z',
  featured: false,
  scope: 'private',
  spaceId: null,
  folderId: null,
  tags: [],
  properties: {},
  createdAtDateTime: '2026-01-01T00:00:00.000Z',
})

const baseClosedFile = (): IFile => ({
  id: 2,
  name: 'file.txt',
  stiType: 'UserFile',
  locked: false,
  resource: false,
  state: 'closed',
  location: 'Private',
  addedBy: 'Test User',
  createdAt: '2026-01-01T00:00:00.000Z',
  featured: false,
  scope: 'private',
  spaceId: null,
  folderId: null,
  origin: null,
  tags: [],
  properties: {},
  uid: 'file-abc-1',
  fileSize: '1 B',
  createdAtDateTime: '2026-01-01T00:00:00.000Z',
  description: null,
})

describe('normalizePermissions', () => {
  it('allows copying folders when unlocked', () => {
    const permissions = normalizePermissions(baseFolder(), undefined, undefined)
    expect(permissions.canCopy).toBe(true)
  })

  it('still allows copying closed files when unlocked', () => {
    const permissions = normalizePermissions(baseClosedFile(), undefined, undefined)
    expect(permissions.canCopy).toBe(true)
  })

  const owner = { dxuser: 'test.user', full_name: 'Test User', admin: false } as unknown as IUser
  const adminUser = { dxuser: 'admin.user', full_name: 'Admin User', admin: true } as unknown as IUser

  it('allows owners to delete their own private files', () => {
    const file: IFile = { ...baseClosedFile(), addedByDxuser: 'test.user' }
    expect(normalizePermissions(file, owner, undefined).canDelete).toBe(true)
  })

  it('does not allow non-admin owners to delete their own public files', () => {
    const file: IFile = { ...baseClosedFile(), addedByDxuser: 'test.user', scope: 'public' }
    expect(normalizePermissions(file, owner, undefined).canDelete).toBe(false)
  })

  it('allows site admins to delete public files', () => {
    const file: IFile = { ...baseClosedFile(), scope: 'public' }
    expect(normalizePermissions(file, adminUser, undefined).canDelete).toBe(true)
  })
})
