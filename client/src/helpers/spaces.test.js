/**
 * @jest-environment node
 */

import { getSpacesIcon, getSpacePageTitle } from './spaces'


describe('Spaces helpers', () => {
  test('getSpacesIcon test', () => {
    expect(getSpacesIcon('members')).toEqual('fa-group')
    expect(getSpacesIcon('apps')).toEqual('fa-cube')
    expect(getSpacesIcon('jobs')).toEqual('fa-cogs')
    expect(getSpacesIcon('workflows')).toEqual('fa-bolt')
    expect(getSpacesIcon('files')).toEqual('fa-files-o')
    expect(getSpacesIcon('some-non-existent')).toEqual('')
  })
})

describe('Spaces helpers', () => {
  test('getSpacePageTitle test', () => {
    expect(getSpacePageTitle('Members')).toBe('Shared Area Members')
    expect(getSpacePageTitle('Members', true)).toBe('Private Area Members')
    expect(getSpacePageTitle(null, true)).toBe('Private Area null')
    expect(getSpacePageTitle(undefined, true)).toBe('Private Area undefined')
  })
})
