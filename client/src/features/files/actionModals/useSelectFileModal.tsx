import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { Checkbox } from '../../../components/Checkbox'
import { FieldInfo } from '../../../components/form/FieldInfo'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { Radio } from '../../../components/Radio'
import { StyledName } from '../../../components/ResourceTable'
import { useDebounce } from '../../../components/Table/useDebounce'
import { Tabs } from '../../../components/Tabs/Tabs'
import { ArrowUpRightFromSquareIcon } from '../../../components/icons/ArrowUpRightFromSquareIcon'
import { FileIcon } from '../../../components/icons/FileIcon'
import { GlobeIcon } from '../../../components/icons/GlobeIcon'
import { LockIcon } from '../../../components/icons/LockIcon'
import { ObjectGroupIcon } from '../../../components/icons/ObjectGroupIcon'
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
import { fetchFilteredFiles } from '../../apps/apps.api'
import {
  IAccessibleFile,
} from '../../databases/databases.api'
import { DialogType } from '../../home/types'
import { useFetchFilesByUIDQuery } from '../query/useFetchFilesByUIDQuery'

const StyledLoader = styled.div`
  padding: 12px;
`

const SyledFilterWrapper = styled.div`
  display: flex;
  gap: 4px;
`

const StyledFilterFileSection = styled(StyledFilterSection)`
  display: block;
`

const StyledFieldInfoWrapper = styled.div`
  margin-top: 5px;
`

const FileIconAndLabel = ({ file }: { file: IAccessibleFile }) => {
  let icon = null
  let label = 'N/A'

  const {
    private: isPrivate,
    public: isPublic,
    space_private,
    space_public,
    in_space,
  } = file

  if (isPrivate) {
    icon = <LockIcon />
    label = 'Private'
  } else if (isPublic) {
    icon = <GlobeIcon />
    label = 'Public'
  } else if (space_private) {
    icon = <ObjectGroupIcon />
    label = 'Shared in Space (Confidential)'
  } else if (space_public) {
    icon = <ObjectGroupIcon />
    label = 'Shared in Space (Cooperative)'
  } else if (in_space) {
    icon = <ObjectGroupIcon />
    label = 'Shared in Space'
  }

  return (
    <>
      {icon}
      {label}
    </>
  )
}

const Row = ({
  file,
  type,
  viewOnly,
  radioCallback,
  checkboxCallback,
  checked,
}: {
  file: IAccessibleFile
  type: DialogType
  viewOnly: boolean
  radioCallback: (file: IAccessibleFile) => void
  checkboxCallback: (checked: boolean, file: IAccessibleFile) => void
  checked?: boolean
}) => (
  <StyledRow
    onClick={() => {
      if (!viewOnly) {
        if (type === 'radio') {
          radioCallback(file)
        } else if (type === 'checkbox') {
          checkboxCallback(!checked, file)
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
        {file.title}
      </StyledName>

      <StyledFileDetail>
        <FileIconAndLabel file={file} />
        <StyledFileDetailItem>{file.file_path}</StyledFileDetailItem>
        <StyledFileDetailItem>{file?.user?.full_name}</StyledFileDetailItem>
        <StyledFileDetailItem>{file?.org?.name}</StyledFileDetailItem>
      </StyledFileDetail>
    </StyledCell>
    <StyledCell>
      <StyledAction href={file.path} target='_blank'>
        <ArrowUpRightFromSquareIcon />
      </StyledAction>
    </StyledCell>
  </StyledRow>
)

interface FileSelectTabsProps {
  type: DialogType
  scopes?: string[]
  setShowModal: (show: boolean) => void
  handleSelect: (files: IAccessibleFile[]) => void
  uids: string[] | null
}

const FileSelectTabs = ({
  type,
  scopes,
  setShowModal,
  handleSelect,
  uids,
}: FileSelectTabsProps) => {
  const user = useAuthUser()
  const [selectedFiles, setSelectedFiles] = useState<IAccessibleFile[]>([])
  const [filter, setFilter] = useState('')
  const [showOnlyMyFiles, setShowOnlyMyFiles] = useState(false)
  const searchText = useDebounce(filter, 250)

  const { data: fetchAccessibleData, status: fetchAccessibleStatus, isFetching } = useFetchFilesByUIDQuery(uids || [])

  const { data: filesData, isLoading, status: loadingFilesStatus } = useQuery({
    queryKey: ['list_files', searchText],
    queryFn: () => fetchFilteredFiles({
      searchString: searchText,
      scopes: scopes ?? [],
    }),
  })

  useEffect(() => {
    if (fetchAccessibleStatus === 'success' && fetchAccessibleData) {
      setSelectedFiles(fetchAccessibleData)
    }
  }, [fetchAccessibleStatus, fetchAccessibleData])

  const radioCallback = (file: IAccessibleFile) => {
    setSelectedFiles([file])
  }

  const addFile = (file: IAccessibleFile) => {
    setSelectedFiles(prev => [...prev, file])
  }

  const removeFile = (file: IAccessibleFile) => {
    setSelectedFiles(prev => [...prev.filter(item => file.uid !== item.uid)])
  }

  const checkboxCallback = (checked: boolean, file: IAccessibleFile) => {
    if (checked) {
      addFile(file)
    } else {
      removeFile(file)
    }
  }

  const toggleOnlyMine = (isChecked: boolean) => {
    if (isChecked) {
      setShowOnlyMyFiles(true)
    } else {
      setShowOnlyMyFiles(false)
    }
  }

  const handleSubmit = () => {
    handleSelect(selectedFiles)
    setShowModal(false)
  }

  const isMyFile = (file: IAccessibleFile): boolean =>
    file.user.dxuser === user?.dxuser

  const files = filesData?.objects ?? []

  return (
    <>
      <Tabs>
        <Tab
          title={`Selected ${selectedFiles?.length || uids?.length || '0'}`}
          key="selected"
        >
          {isFetching && (
            <StyledLoader>
              <Loader className="inline" />
            </StyledLoader>
          )}
          {(selectedFiles?.length === 0 || uids?.length === 0) &&
            !isFetching && <div>No selected files</div>}
          <ModalScroll>
            <SelectableTable>
              <tbody>
                {selectedFiles?.map(file => (
                  <Row
                    file={file}
                    type={type}
                    viewOnly
                    key={file.uid}
                    radioCallback={radioCallback}
                    checkboxCallback={checkboxCallback}
                  />
                ))}
              </tbody>
            </SelectableTable>
          </ModalScroll>
        </Tab>
        <Tab
          title={`Files ${
            loadingFilesStatus === 'success' ? files.length : ''
          }`}
          key="files"
        >
          <StyledFilterFileSection>
            <SyledFilterWrapper>
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
            </SyledFilterWrapper>
            <StyledFieldInfoWrapper>
              <FieldInfo text="Use % for wildcard searches" />
            </StyledFieldInfoWrapper>
          </StyledFilterFileSection>

          {isLoading && <Loader />}
          {loadingFilesStatus === 'success' && (
            <ModalScroll>
              <SelectableTable>
                <tbody>
                  {files
                    .filter((file: IAccessibleFile) =>
                      showOnlyMyFiles
                        ? isMyFile(file) && showOnlyMyFiles
                        : true,
                    )
                    .map((file: IAccessibleFile) => (
                      <Row
                        file={file}
                        type={type}
                        viewOnly={false}
                        key={file.uid}
                        radioCallback={radioCallback}
                        checkboxCallback={checkboxCallback}
                        checked={selectedFiles?.some(s => file.uid === s.uid)}
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
            variant='primary'
            onClick={handleSubmit}
            disabled={selectedFiles?.length === 0}
          >
            Select &nbsp;<ButtonBadge>{selectedFiles?.length}</ButtonBadge>
          </Button>
        </ButtonRow>
      </Footer>
    </>
  )
}

/**
 * Dialog for selecting file(s). It can function in two modes specified
 * by DialogType. In Radio mode only single file selection is allowed, however
 * in checkbox mode it allows user select multiple files.
 *
 * @returns list of selected files
 */
export const useSelectFileModal = (
  title: string,
  type: DialogType,
  handleSelect: (files: IAccessibleFile[]) => void,
  subtitle?: string,
  scopes?: string[],
  uids?: string[],
) => {
  const { isShown, setShowModal } = useModal()

  const showModalResetState = () => {
    setShowModal(true)
  }

  const modalComp = isShown && (
    <ModalNext
      id="select-file-modal"
      disableClose={false}
      headerText={title}
      hide={() => setShowModal(false)}
      isShown={isShown}
    >
      <ModalHeaderTop
        disableClose={false}
        headerText={title}
        hide={() => setShowModal(false)}
      />

      {subtitle && <StyledSubtitle>{subtitle}</StyledSubtitle>}
      <FileSelectTabs
        type={type}
        scopes={scopes}
        setShowModal={setShowModal}
        handleSelect={handleSelect}
        uids={uids}
      />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    showModalResetState,
    isShown,
  }
}
