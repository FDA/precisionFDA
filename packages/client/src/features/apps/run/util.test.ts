import { IApp, InputSpec } from '../apps.types'
import { createRequestObject, generateCopyUrl, shouldIncludeInputValue } from './utils'

describe('shouldIncludeInputValue', () => {
  it('should return false for undefined', () => {
    expect(shouldIncludeInputValue(undefined)).toBe(false)
  })

  it('should return false for null', () => {
    expect(shouldIncludeInputValue(null)).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(shouldIncludeInputValue('')).toBe(false)
  })

  it('should return true for non-empty string', () => {
    expect(shouldIncludeInputValue('value')).toBe(true)
  })

  it('should return true for string "0"', () => {
    expect(shouldIncludeInputValue('0')).toBe(true)
  })

  it('should return true for number', () => {
    expect(shouldIncludeInputValue(123)).toBe(true)
  })

  it('should return true for boolean true', () => {
    expect(shouldIncludeInputValue(true)).toBe(true)
  })

  it('should return true for boolean false', () => {
    expect(shouldIncludeInputValue(false)).toBe(true)
  })
})

describe('generateCopyUrl', () => {
  const UID = 'app-uid-1'
  const APP_SERIES_ID = 1
  const APP = { uid: UID, app_series_id: APP_SERIES_ID } as IApp
  const displayData = JSON.stringify({ key: 'value' })
  const encodedData = btoa(encodeURIComponent(displayData))

  it('should return url with uid for app', () => {
    const url = `https://example.com/${UID}/jobs/new`
    const copyType = 'app'

    const result = generateCopyUrl(displayData, url, APP, copyType)

    expect(result).toBe(`https://example.com/${UID}/jobs/new#${encodedData}`)
  })

  it('should replace the app UID for appSeries', () => {
    const url = `https://example.com/${UID}/jobs/new`
    const copyType = 'appSeries'

    const result = generateCopyUrl(displayData, url, APP, copyType)

    expect(result).toBe(`https://example.com/app-series-${APP_SERIES_ID}/jobs/new#${encodedData}`)
  })

  it('should return url with app series id for appSeries', () => {
    const url = `https://example.com/app-series-${APP_SERIES_ID}/jobs/new`
    const copyType = 'appSeries'

    const result = generateCopyUrl(displayData, url, APP, copyType)

    expect(result).toBe(`https://example.com/app-series-${APP_SERIES_ID}/jobs/new#${encodedData}`)
  })

  it('should replace the app series id for app', () => {
    const url = `https://example.com/app-series-${APP_SERIES_ID}/jobs/new`
    const copyType = 'app'

    const result = generateCopyUrl(displayData, url, APP, copyType)

    expect(result).toBe(`https://example.com/${UID}/jobs/new#${encodedData}`)
  })

  it('should handle empty display data', () => {
    const url = `https://example.com/${UID}/jobs/new`
    const copyType = 'app'

    const result = generateCopyUrl('', url, APP, copyType)

    expect(result).toBe(`${url}#`)
  })

  it('should handle special characters in the display data', () => {
    const specialDisplayData = JSON.stringify({ key: 'value with spaces & special chars !@#$%^&*()' })
    const url = `https://example.com/${UID}/jobs/new`
    const copyType = 'app'

    const result = generateCopyUrl(specialDisplayData, url, APP, copyType)

    const encodedSpecialData = btoa(encodeURIComponent(specialDisplayData))
    expect(result).toBe(`${url}#${encodedSpecialData}`)
  })
})

describe('createRequestObject', () => {
  it('should include integer 0 in inputs, but exclude null and undefined', () => {
    const jobName = 'test-job'
    const jobLimit = 10
    const outputFolderPath = '/output'
    const instanceType = 'baseline-8'
    const scope = 'private'
    const app = { uid: 'app-123' } as IApp

    const inputSpecs: InputSpec[] = [
      {
        name: 'intInput',
        class: 'int',
        label: 'Int Input',
        optional: false,
        default: null,
        choices: null,
        help: '',
      },
      {
        name: 'nullInput',
        class: 'string',
        label: 'Null Input',
        optional: true,
        default: null,
        choices: null,
        help: '',
      },
      {
        name: 'undefinedInput',
        class: 'string',
        label: 'Undefined Input',
        optional: true,
        default: null,
        choices: null,
        help: '',
      },
    ]

    const inputsParam = {
      intInput: '0',
      nullInput: null as any,
      undefinedInput: undefined,
    }

    const result = createRequestObject(
      jobName,
      jobLimit,
      outputFolderPath,
      instanceType,
      scope,
      inputsParam,
      app,
      inputSpecs,
    )

    expect(result.inputs).toHaveProperty('intInput', 0)
    expect(result.inputs).not.toHaveProperty('nullInput')
    expect(result.inputs).not.toHaveProperty('undefinedInput')
  })
})
