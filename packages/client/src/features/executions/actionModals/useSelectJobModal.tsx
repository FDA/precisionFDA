import { useQuery } from '@tanstack/react-query'
import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { FileIcon } from '../../../components/icons/FileIcon'
import { GlobeIcon } from '../../../components/icons/GlobeIcon'
import { Loader } from '../../../components/Loader'
import { Radio } from '../../../components/Radio'
import { useDebounce } from '../../../components/Table/useDebounce'
import { Button } from '../../../components/ui/button'
import { Checkbox } from '../../../components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Switch } from '../../../components/ui/switch'
import { Table, TableBody, TableCell, TableRow } from '../../../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { useAuthUser } from '../../auth/useAuthUser'
import type { DialogType } from '../../home/types'
import { useModal } from '../../modal/useModal'
import { fetchFilteredJobs } from '../executions.api'
import type { IJob } from '../executions.types'

const Row = ({
  job,
  type,
  viewOnly,
  radioCallback,
  checkboxCallback,
  checked,
}: {
  job: IJob
  type: DialogType
  viewOnly: boolean
  radioCallback: (job: IJob) => void
  checkboxCallback: (checked: boolean, job: IJob) => void
  checked?: boolean
}) => (
  <TableRow
    className="cursor-pointer hover:bg-muted/50"
    onClick={() => {
      if (!viewOnly) {
        if (type === 'radio') {
          radioCallback(job)
        } else if (type === 'checkbox') {
          checkboxCallback(!checked, job)
        }
      }
    }}
  >
    <TableCell className="whitespace-normal px-3 py-2">
      <div className="flex items-start gap-2 text-foreground">
        {type === 'radio' && !viewOnly && (
          <div className="mr-2 shrink-0 pt-0.5">
            <Radio checked={checked} onChange={() => {}} />
          </div>
        )}
        {type === 'checkbox' && !viewOnly && (
          <div className="mr-2 shrink-0 pt-0.5">
            <Checkbox
              checked={checked}
              onCheckedChange={isChecked => checkboxCallback(isChecked, job)}
              onClick={event => event.stopPropagation()}
            />
          </div>
        )}
        <div className="min-w-0">
          <div className="break-all">
            <span className="inline-block align-text-bottom">
              <FileIcon width={14} height={14} />
            </span>{' '}
            <span>{job.title}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[85%] leading-5 text-muted-foreground">
            {job.public && (
              <span className="inline-flex items-center">
                <GlobeIcon height={13} />
              </span>
            )}
            {job.private && <span>Private</span>}
            {job.public && <span>Public</span>}
            <span>{job.user.full_name}</span>
            <span>{job.org.name}</span>
          </div>
        </div>
      </div>
    </TableCell>
    <TableCell className="w-10 px-2 py-2 align-top">
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-primary"
        render={
          <a href={job.path} aria-label={`Open ${job.title}`} onClick={event => event.stopPropagation()}>
            <span className="sr-only">Open {job.title}</span>
          </a>
        }
      >
        <ExternalLink className="size-4 shrink-0" />
      </Button>
    </TableCell>
  </TableRow>
)

/**
 * Dialog for selecting job(s). It can function in two modes specified
 * by DialogType. In Radio mode only single job selection is allowed, however
 * in checkbox mode it allows user select multiple jobs.
 *
 * @returns list of selected jobs
 */
export const useSelectJobModal = (
  title: string,
  type: DialogType,
  handleSelect: (jobs: IJob[]) => void,
  subtitle?: string,
  scopes?: string[],
) => {
  const user = useAuthUser()
  const listedJobs: IJob[] = []
  const { isShown, setShowModal } = useModal()
  const [selectedJobs, setSelectedJobs] = useState(listedJobs)
  const [filter, setFilter] = useState('')
  const [showOnlyMyJobs, setShowOnlyMyJobs] = useState(false)
  const searchText = useDebounce(filter, 250)

  const {
    data: jobsData,
    isLoading: isLoadingJobs,
    status: loadingJobsStatus,
  } = useQuery({
    queryKey: ['list_jobs', searchText],
    // @ts-expect-error unusual use of scopes, but it works
    queryFn: () => fetchFilteredJobs(searchText, scopes ?? []), // scopes: [] mean all scopes.
    enabled: isShown,
  })

  const radioCallback = (job: IJob) => {
    setSelectedJobs([job])
  }

  const addJob = (job: IJob) => {
    setSelectedJobs(prev => [...prev, job])
  }

  const removeJob = (job: IJob) => {
    setSelectedJobs(prev => [...prev.filter(item => job.id !== item.id)])
  }

  const checkboxCallback = (checked: boolean, job: IJob) => {
    if (checked) {
      addJob(job)
    } else {
      removeJob(job)
    }
  }

  const showModalResetState = () => {
    setSelectedJobs([])
    setShowModal(true)
  }

  const toggleOnlyMine = (isChecked: boolean) => {
    if (isChecked) {
      setShowOnlyMyJobs(true)
    } else {
      setShowOnlyMyJobs(false)
    }
  }

  const handleSubmit = () => {
    handleSelect(selectedJobs)
    setShowModal(false)
    setFilter('')
  }

  const isMyJob = (job: IJob): boolean => job.user.dxuser === user?.dxuser

  const jobs = jobsData ?? []

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent
        id="select-job-modal"
        variant="medium"
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-4 overflow-hidden"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {subtitle && <div className="text-muted-foreground text-sm leading-5">{subtitle}</div>}
        <Tabs defaultValue="jobs" className="min-h-0 flex-1 flex-col overflow-hidden">
          <TabsList className="shrink-0">
            <TabsTrigger value="jobs">Jobs {jobs.length}</TabsTrigger>
            <TabsTrigger value="selected">Selected {selectedJobs.length}</TabsTrigger>
          </TabsList>
          <TabsContent value="jobs" className="flex min-h-0 min-w-[min(400px,100%)] flex-1 flex-col overflow-hidden">
            <div className="flex flex-row items-start gap-2 pb-3">
              <Input className="flex-1" placeholder="Filter..." onChange={evt => setFilter(evt.target.value)} />
              <label
                htmlFor="select-jobs-only-mine"
                className="flex shrink-0 flex-col items-center gap-1 text-muted-foreground text-xs font-medium"
              >
                <Switch id="select-jobs-only-mine" checked={showOnlyMyJobs} onCheckedChange={toggleOnlyMine} />
                <span>Mine only</span>
              </label>
            </div>
            {isLoadingJobs && <Loader />}
            {loadingJobsStatus === 'success' && (
              <div className="min-h-0 flex-1 overflow-auto">
                <Table>
                  <TableBody>
                    {jobs
                      .filter((asset: IJob) => (showOnlyMyJobs ? isMyJob(asset) && showOnlyMyJobs : true))
                      .map((job: IJob) => (
                        <Row
                          job={job}
                          type={type}
                          viewOnly={false}
                          key={job.id}
                          radioCallback={radioCallback}
                          checkboxCallback={checkboxCallback}
                          checked={selectedJobs.some(selected => job.id === selected.id)}
                        />
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          <TabsContent
            value="selected"
            className="flex min-h-0 min-w-[min(400px,100%)] flex-1 flex-col overflow-hidden"
          >
            {selectedJobs.length === 0 && <div className="border-t px-3 py-2 text-foreground">No selected jobs</div>}
            {selectedJobs.length > 0 && (
              <div className="min-h-0 flex-1 overflow-auto">
                <Table>
                  <TableBody>
                    {selectedJobs.map(job => (
                      <Row
                        job={job}
                        type={type}
                        viewOnly
                        key={job.id}
                        radioCallback={radioCallback}
                        checkboxCallback={checkboxCallback}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowModal(false)
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={selectedJobs?.length === 0}>
            Select &nbsp;
            <span className="rounded-[10px] bg-primary-foreground/20 px-1.75 py-0.75 leading-none">
              {selectedJobs?.length}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
  return {
    modalComp,
    setShowModal,
    showModalResetState,
    isShown,
  }
}
