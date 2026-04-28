import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '../../../components/Button'
import { Loader } from '../../../components/Loader'
import { getAlertRequest } from './alerts.api'
import { Alert } from './alerts.types'
import { EditAlertForm } from './EditAlertForm'
import { useAlertDismissed } from './useAlertDismissedLocalStorage'

const AlertList = ({
  list,
  isLoading,
  selected,
  setSelected,
}: {
  list?: Alert[]
  isLoading: boolean
  selected?: number
  setSelected: (id: number) => void
}) => {
  if (isLoading) return <Loader />

  if (!list?.length) {
    return (
      <div className="flex max-w-[360px] min-w-[320px] flex-col rounded-md bg-(--background) p-4 shadow-[0_1px_3px_0_var(--base-opacity-06),0_1px_2px_0_var(--base-opacity-06)]">
        <h2 className="mb-2 text-sm font-semibold text-(--c-text-600)">Existing Alerts</h2>
        <div className="rounded-lg border border-dashed border-(--c-layout-border) bg-(--background-shaded) px-4 py-6 text-sm text-(--c-text-500)">
          No alerts found. Use &quot;Create New Alert&quot; to add one.
        </div>
      </div>
    )
  }

  return (
    <div className="flex max-w-[420px] min-w-[320px] flex-col rounded-md bg-(--background) p-4 shadow-[0_1px_3px_0_var(--base-opacity-06),0_1px_2px_0_var(--base-opacity-06)]">
      <h2 className="mb-3 text-sm font-semibold text-(--c-text-600)">Existing Alerts</h2>
      <div className="flex max-h-[65vh] flex-col gap-3 overflow-y-auto pr-1">
        {list?.map(a => {
          return (
            <button
              className={`flex w-full cursor-pointer flex-col items-start rounded-lg border p-3 text-left text-pretty whitespace-normal transition-colors ${
                selected === a.id
                  ? 'border-(--primary-300) bg-(--primary-50)'
                  : 'border-(--c-layout-border) bg-(--background) hover:bg-(--background-shaded)'
              }`}
              type="button"
              key={a.id}
              onClick={() => {
                setSelected(a.id)
              }}
            >
              <div className="text-sm font-semibold text-(--c-text)">{a.title}</div>
              <div className="mt-1 text-xs leading-5 text-(--c-text-500)">{a.content}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function AlertsPage() {
  const { setIsAlertDismissed } = useAlertDismissed()
  const [selected, setSelected] = useState<number>()
  const [createMode, setCreateMode] = useState(false)

  const { data: alertsData, isLoading } = useQuery({
    queryKey: ['alerts-list'],
    queryFn: getAlertRequest,
  })

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-6 py-6 lg:px-8">
      <div className="flex flex-col gap-4 rounded-md bg-(--background) p-5 shadow-[0_1px_3px_0_var(--base-opacity-06),0_1px_2px_0_var(--base-opacity-06)] md:flex-row md:items-center md:justify-between">
        <div>
          {selected === undefined && !createMode ? (
            <h1 className="text-2xl font-bold text-(--c-text)">Site Alert Editor</h1>
          ) : (
            <h1 className="text-2xl font-bold text-(--c-text)">
              {createMode ? 'New Alert' : `Edit Alert ${selected}`}
            </h1>
          )}
          <p className="mt-1 text-sm text-(--c-text-500)">Create, update, and preview site-wide alerts for users.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={() => {
              setCreateMode(true)
              setSelected(undefined)
            }}
          >
            Create New Alert
          </Button>
          <Button
            type="button"
            onClick={() => {
              setIsAlertDismissed(false)
            }}
          >
            Reset dismissed alert for current user
          </Button>
        </div>
      </div>

      <div className="grid min-h-[420px] gap-4 lg:grid-cols-[420px_minmax(0,1fr)]">
        <AlertList
          isLoading={isLoading}
          list={alertsData}
          selected={selected}
          setSelected={(id: number) => {
            setSelected(id)
            setCreateMode(false)
          }}
        />
        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-md bg-(--background)">
            <Loader />
          </div>
        ) : (
          (selected !== undefined || createMode) && (
            <div className="rounded-md bg-(--background) pt-3 shadow-[0_1px_3px_0_var(--base-opacity-06),0_1px_2px_0_var(--base-opacity-06)]">
              <EditAlertForm
                alertItem={alertsData?.find(i => i.id === selected)}
                onSuccess={id => {
                  setCreateMode(false)
                  setSelected(id)
                }}
                isNew={createMode}
              />
            </div>
          )
        )}
      </div>
    </div>
  )
}
