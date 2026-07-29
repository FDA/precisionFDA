import type { ColumnDef } from '@tanstack/react-table'
import { render } from '../../test/test-utils'
import Table from './index'

type Row = { id: number; name: string }

const columns: ColumnDef<Row>[] = [{ accessorKey: 'name', header: 'Name' }]
const data: Row[] = [
  { id: 1, name: 'alpha' },
  { id: 2, name: 'beta' },
]

describe('Table', () => {
  test('keeps the sticky header opaque over scrolled rows', async () => {
    // The app's global styles define --background; the test page does not, so
    // provide it - an undefined custom property would compute to transparent
    // and make the opacity assertions below meaningless.
    document.documentElement.style.setProperty('--background', 'rgb(255, 255, 255)')

    const screen = render(<Table isLoading={false} data={data} columns={columns} />)
    await expect.element(screen.getByTestId('pfda-table')).toBeInTheDocument()

    const table = document.querySelector('[data-testid="pfda-table"]') as HTMLTableElement
    const thead = table.querySelector('thead') as HTMLTableSectionElement
    const headerCell = thead.querySelector('th') as HTMLTableCellElement

    // Tailwind preflight applies `border-collapse: collapse`, under which collapsed borders are
    // painted by the table instead of the sticky <thead>, leaving 1px slits along the header rows
    // that scrolled body rows show through. Guard the whole mechanism that prevents the defect:
    // separate borders without spacing, a sticky header, and opaque header cells.
    const tableStyle = getComputedStyle(table)
    expect(tableStyle.borderCollapse).toBe('separate')
    expect(tableStyle.borderSpacing).toBe('0px')

    const theadStyle = getComputedStyle(thead)
    expect(theadStyle.position).toBe('sticky')
    expect(theadStyle.top).toBe('0px')
    expect(['transparent', 'rgba(0, 0, 0, 0)']).not.toContain(theadStyle.backgroundColor)

    expect(['transparent', 'rgba(0, 0, 0, 0)']).not.toContain(getComputedStyle(headerCell).backgroundColor)
  })
})
