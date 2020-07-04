import { isCheckedAllCheckboxes } from '.'


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
})
