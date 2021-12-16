import { isCheckedAllCheckboxes, isExpandedAllItems, convertSecondsToDhms, isHttpSuccess } from '.'


describe('Test index helpers', () => {
  test('isCheckedAllCheckboxes test', () => {
    const items1 = [
      { isChecked: true },
      { isChecked: false },
    ]
    const items2 = [
      { isChecked: true },
      { isChecked: true },
    ]

    expect(isCheckedAllCheckboxes(items1)).toBe(false)
    expect(isCheckedAllCheckboxes(items2)).toBe(true)
    expect(isCheckedAllCheckboxes([])).toBe(false)
    expect(isCheckedAllCheckboxes()).toBe(false)
  })

  test('isExpandedAllItems test', () => {
    const items1 = [
      { isExpanded: true },
      { isExpanded: false },
    ]
    const items2 = [
      { isExpanded: true },
      { isExpanded: true },
    ]

    expect(isExpandedAllItems(items1)).toBe(false)
    expect(isExpandedAllItems(items2)).toBe(true)
    expect(isExpandedAllItems([])).toBe(false)
    expect(isExpandedAllItems()).toBe(false)
  })

  test('convertSecondsToDhms test', () => {
    expect(convertSecondsToDhms(31)).toBe('31 seconds')
    expect(convertSecondsToDhms(65)).toBe('1 minute 5 seconds')
  })

  test('isHttpSuccess test', () => {
    expect(isHttpSuccess(200)).toBe(true)
    expect(isHttpSuccess(207)).toBe(true)
    expect(isHttpSuccess(300)).toBe(false)
  })
})
