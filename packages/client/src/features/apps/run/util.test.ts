import { IApp } from '../apps.types'
import { generateCopyUrl } from './utils'

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
