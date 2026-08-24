import { HttpResponse, http } from 'msw'
import { useEffect } from 'react'
import { describe, expect, test, vi } from 'vitest'
import { worker } from '@/test/setup'
import { render } from '@/test/test-utils'
import { mockWorkstationExecution } from '../../mocks/handlers/executions.handlers'
import type { IExecution } from './executions.types'
import { useSnapshotModal, validationSchema } from './useSnapshotModal'

const NAME_PATTERN = new RegExp(`^${mockWorkstationExecution.name} \\d{4}-\\d{2}-\\d{2}-\\d{4}$`)

const SnapshotModalHost = ({ execution }: { execution: IExecution }) => {
  const { modalComp, setShowModal } = useSnapshotModal({ selected: execution })

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])

  return modalComp
}

describe('validationSchema', () => {
  const validValues = { name: 'snapshot-1', terminate: false, preScript: '' }

  test('accepts alphanumeric, dash, underscore, and space characters in the name', async () => {
    await expect(validationSchema.isValid({ ...validValues, name: 'My Snapshot_1-2 3' })).resolves.toBe(true)
  })

  test.each(['snapshot!', 'snap/shot', 'snap.shot', 'snap@shot'])('rejects a name containing "%s"', async name => {
    await expect(validationSchema.isValid({ ...validValues, name })).resolves.toBe(false)
  })

  test('rejects an empty name', async () => {
    await expect(validationSchema.isValid({ ...validValues, name: '' })).resolves.toBe(false)
  })

  test('requires terminate to be a boolean', async () => {
    await expect(validationSchema.isValid({ ...validValues, terminate: undefined })).resolves.toBe(false)
  })

  test('allows preScript to be omitted', async () => {
    const { preScript: _preScript, ...rest } = validValues
    await expect(validationSchema.isValid(rest)).resolves.toBe(true)
  })
})

describe('useSnapshotModal', () => {
  test('pre-fills the snapshot name from the execution name and current date', async () => {
    const screen = render(<SnapshotModalHost execution={mockWorkstationExecution} />)

    await expect.element(screen.getByTestId('modal-create-snapshot')).toBeVisible()
    const nameInput = screen.getByRole('textbox', { name: 'Name' })
    await expect.element(nameInput).toBeVisible()
    expect((nameInput.element() as HTMLInputElement).value).toMatch(NAME_PATTERN)
  })

  test('shows the pre-execution script editor when the workstation API version supports it', async () => {
    const screen = render(<SnapshotModalHost execution={mockWorkstationExecution} />)

    await expect.element(screen.getByText('Pre-execution script')).toBeVisible()
  })

  test('hides the pre-execution script editor when the workstation API version is too old', async () => {
    const screen = render(
      <SnapshotModalHost execution={{ ...mockWorkstationExecution, workstationApiVersion: '1.2.0' }} />,
    )

    await expect.element(screen.getByTestId('modal-create-snapshot')).toBeVisible()
    await expect.element(screen.getByText('Pre-execution script')).not.toBeInTheDocument()
  })

  test('submits the snapshot request with the form values and closes the modal on success', async () => {
    const requestBody = vi.fn()
    worker.use(
      http.post('/api/v2/jobs/:uid/snapshot', async ({ request }) => {
        requestBody(await request.json())
        return HttpResponse.json({ meta: { messages: [] } })
      }),
    )

    const screen = render(<SnapshotModalHost execution={mockWorkstationExecution} />)

    await screen.getByRole('checkbox', { name: 'Terminate' }).click()
    await screen.getByRole('button', { name: 'Create Snapshot' }).click()

    await expect.element(screen.getByTestId('modal-create-snapshot')).not.toBeInTheDocument()
    expect(requestBody).toHaveBeenCalledWith(expect.objectContaining({ terminate: true, preScript: '' }))
  })

  test('shows an error toast and keeps the modal open when the request fails', async () => {
    worker.use(
      http.post('/api/v2/jobs/:uid/snapshot', () => HttpResponse.json({ error: { message: 'Boom' } }, { status: 500 })),
    )

    const screen = render(<SnapshotModalHost execution={mockWorkstationExecution} />)

    await screen.getByRole('button', { name: 'Create Snapshot' }).click()

    await expect.element(screen.getByTestId('modal-create-snapshot')).toBeVisible()
  })
})
