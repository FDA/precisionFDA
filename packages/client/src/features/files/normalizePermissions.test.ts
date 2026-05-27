import { describe, expect, it } from 'vitest'
import type { IFile, IFolder } from './files.types'
import { normalizePermissions } from './normalizePermissions'

const baseFolder = (): IFolder => ({
  path: [],
  state: null,
  id: 1,
  name: 'folder',
  type: 'Folder',
  stiType: 'Folder',
  locked: false,
  location: 'Private',
  origin: null,
  addedBy: 'Test User',
  createdAt: '2026-01-01T00:00:00.000Z',
  featured: false,
  scope: 'private',
  spaceId: null,
  tags: [],
  properties: {},
  createdAtDateTime: '2026-01-01T00:00:00.000Z',
})

const baseClosedFile = (): IFile => ({
  id: 2,
  name: 'file.txt',
  type: 'UserFile',
  locked: false,
  resource: false,
  state: 'closed',
  location: 'Private',
  addedBy: 'Test User',
  createdAt: '2026-01-01T00:00:00.000Z',
  featured: false,
  scope: 'private',
  spaceId: null,
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
})

