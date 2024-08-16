import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Checkbox } from '../../../components/Checkbox'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { Radio } from '../../../components/Radio'
import { StyledName } from '../../../components/ResourceTable'
import { useDebounce } from '../../../components/Table/useDebounce'
import { Tabs } from '../../../components/Tabs/Tabs'
import { ArrowUpRightFromSquareIcon } from '../../../components/icons/ArrowUpRightFromSquareIcon'
import { FileIcon } from '../../../components/icons/FileIcon'
import { GlobeIcon } from '../../../components/icons/GlobeIcon'
import { useAuthUser } from '../../auth/useAuthUser'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import {
  ButtonBadge,
  SelectableTable,
  StyledAction,
  StyledCell,
  StyledContainer,
  StyledFileDetail,
  StyledFileDetailItem,
  StyledFilterSection,
  StyledOnlyMine,
  StyledRow,
  StyledSubtitle,
  Tab,
} from '../../actionModals/styles'
import { DialogType } from '../../home/types'
import { fetchFilteredJobs } from '../executions.api'
import { IJob } from '../executions.types'
import { Button } from '../../../components/Button'

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
  <StyledRow
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
    <StyledCell>
      <StyledName>
        {type === 'radio' && !viewOnly && (
          <StyledContainer>
            <Radio checked={checked} onChange={() => {}} />
          </StyledContainer>
        )}
        {type === 'checkbox' && !viewOnly && (
          <StyledContainer>
            <Checkbox onChange={() => {}} checked={checked} />
          </StyledContainer>
        )}
        <FileIcon />
        {job.title}
      </StyledName>

      <StyledFileDetail>
        {job.public && <GlobeIcon />}

        {job.private && 'Private'}
        {job.public && 'Public'}

        <StyledFileDetailItem>{job.user.full_name}</StyledFileDetailItem>
        <StyledFileDetailItem>{job.org.name}</StyledFileDetailItem>
      </StyledFileDetail>
    </StyledCell>
    <StyledCell>
      <StyledAction href={job.path}>
        <ArrowUpRightFromSquareIcon />
      </StyledAction>
    </StyledCell>
  </StyledRow>
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

  const { data: jobsData, isLoading: isLoadingJobs, status: loadingJobsStatus } = useQuery({
    queryKey: ['list_jobs', searchText],
    queryFn: () => fetchFilteredJobs(searchText, scopes ?? ([] as any)), // scopes: [] mean all scopes.
    enabled: isShown,
  })

  const radioCallback = (job: IJob) => {
    setSelectedJobs([job])
  }

  const addApp = (job: IJob) => {
    setSelectedJobs(prev => [...prev, job])
  }

  const removeApp = (job: IJob) => {
    setSelectedJobs(prev => [...prev.filter(item => job.id !== item.id)])
  }

  const checkboxCallback = (checked: boolean, job: IJob) => {
    if (checked) {
      addApp(job)
    } else {
      removeApp(job)
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
  }

  const isMyApp = (job: IJob): boolean => job.user.dxuser === user?.dxuser

  const jobs = jobsData ?? []

  const modalComp = (
    <ModalNext
      id="select-job-modal"
      headerText={title}
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop headerText={title} hide={() => setShowModal(false)} />
      {subtitle && <StyledSubtitle>{subtitle}</StyledSubtitle>}
      <Tabs>
        <Tab title={`Selected ${selectedJobs.length}`} key="selected">
          {selectedJobs.length === 0 && <StyledRow>No selected jobs</StyledRow>}
          {selectedJobs.length > 0 && (
            <ModalScroll>
              <SelectableTable>
                <tbody>
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
                </tbody>
              </SelectableTable>
            </ModalScroll>
          )}
        </Tab>
        <Tab title={`Jobs ${jobs.length}`} key="files">
          <StyledFilterSection>
            <InputText
              placeholder="Filter..."
              onChange={evt => setFilter(evt.target.value)}
            />
            <StyledOnlyMine>
              <input
                type="checkbox"
                onClick={e => toggleOnlyMine(e.target.checked)}
              />
              Only mine
            </StyledOnlyMine>
          </StyledFilterSection>
          {isLoadingJobs && <Loader />}
          {loadingJobsStatus === 'success' && (
            <ModalScroll>
              <SelectableTable>
                <tbody>
                  {jobs
                    .filter((asset: IJob) =>
                      showOnlyMyJobs ? isMyApp(asset) && showOnlyMyJobs : true,
                    )
                    .map((job: IJob) => (
                      <Row
                        job={job}
                        type={type}
                        viewOnly={false}
                        key={job.id}
                        radioCallback={radioCallback}
                        checkboxCallback={checkboxCallback}
                        checked={selectedJobs.some(
                          selected => job.id === selected.id,
                        )}
                      />
                    ))}
                </tbody>
              </SelectableTable>
            </ModalScroll>
          )}
        </Tab>
      </Tabs>
      <Footer>
        <ButtonRow>
          <Button
            onClick={() => {
              setShowModal(false)
            }}
          >
            Cancel
          </Button>
          <Button
            data-variant="primary"
            onClick={handleSubmit}
            disabled={selectedJobs?.length === 0}
          >
            Select &nbsp;<ButtonBadge>{selectedJobs?.length}</ButtonBadge>
          </Button>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    showModalResetState,
    isShown,
  }
}
