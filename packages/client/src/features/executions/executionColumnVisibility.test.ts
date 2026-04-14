// @vitest-environment node

import { describe, expect, it } from 'vitest'
import { getHiddenExecutionColumns, shouldShowExecutionColumn } from './executionColumnVisibility'

describe('getHiddenExecutionColumns()', () => {
  it('hides expected home columns for me scope', () => {
    const hidden = getHiddenExecutionColumns('home', 'me')

    expect(hidden.has('addedBy')).toBe(true)
    expect(hidden.has('location')).toBe(true)
    expect(hidden.has('featured')).toBe(true)
    expect(hidden.has('workflowTitle')).toBe(true)
    expect(hidden.has('createdAtDateTime')).toBe(true)
  })

  it('keeps location visible for spaces scope and featured visible for everybody scope', () => {
    const spacesHidden = getHiddenExecutionColumns('home', 'spaces')
    const everybodyHidden = getHiddenExecutionColumns('home', 'everybody')

    expect(spacesHidden.has('location')).toBe(false)
    expect(spacesHidden.has('featured')).toBe(true)
    expect(everybodyHidden.has('location')).toBe(true)
    expect(everybodyHidden.has('featured')).toBe(false)
  })

  it('returns app and workflow hidden columns matching current behavior', () => {
    const appHidden = getHiddenExecutionColumns('app')
    const workflowHidden = getHiddenExecutionColumns('workflow')

    expect(appHidden.has('featured')).toBe(true)
    expect(appHidden.has('location')).toBe(true)
    expect(appHidden.has('select')).toBe(true)
    expect(appHidden.has('app_title')).toBe(true)

    expect(workflowHidden.has('featured')).toBe(true)
    expect(workflowHidden.has('location')).toBe(true)
    expect(workflowHidden.has('tags')).toBe(true)
    expect(workflowHidden.has('select')).toBe(true)
    expect(workflowHidden.has('workflow')).toBe(true)
  })
})

describe('shouldShowExecutionColumn()', () => {
  it('uses accessor key when filtering home columns', () => {
    expect(shouldShowExecutionColumn('home', { accessorKey: 'location' }, 'spaces')).toBe(true)
    expect(shouldShowExecutionColumn('home', { accessorKey: 'location' }, 'me')).toBe(false)
  })

  it('uses id when filtering context columns', () => {
    expect(shouldShowExecutionColumn('app', { id: 'select' })).toBe(false)
    expect(shouldShowExecutionColumn('workflow', { id: 'select' })).toBe(false)
  })

  it('preserves current legacy key behavior for app and workflow execution lists', () => {
    expect(shouldShowExecutionColumn('app', { accessorKey: 'appTitle' })).toBe(true)
    expect(shouldShowExecutionColumn('workflow', { accessorKey: 'workflowTitle' })).toBe(true)
  })
})
