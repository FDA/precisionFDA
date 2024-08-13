import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { Button } from '../../../components/Button'
import { Checkbox } from '../../../components/CheckboxNext'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { Radio } from '../../../components/Radio'
import { ItemTitle, StyledName } from '../../../components/ResourceTable'
import { useDebounce } from '../../../components/Table/useDebounce'
import { FieldInfo } from '../../../components/form/FieldInfo'
import { ArrowUpRightFromSquareIcon } from '../../../components/icons/ArrowUpRightFromSquareIcon'
import { FileIcon } from '../../../components/icons/FileIcon'
import { GlobeIcon } from '../../../components/icons/GlobeIcon'
import { LockIcon } from '../../../components/icons/LockIcon'
import { ObjectGroupIcon } from '../../../components/icons/ObjectGroupIcon'
import {
  ButtonBadge,
  Card,
  LabelWrap,
  ModalPageCol,
  ModalPageRow,
  ScrollPlace,
  SelectableTable,
  Sticky,
  StyledAction,
  StyledCell,
  StyledCellNoShrink,
  StyledFieldInfoWrapper,
  StyledFileDetail,
  StyledFileDetailItem,
  StyledFilterFileSection,
  StyledHeading,
  StyledLoader,
  StyledOnlyMine,
  StyledRow,
  StyledSubtitle,
  SyledFilterWrapper,
  SyledUid,
  TabContent,
} from '../../actionModals/styles'
import { fetchFilteredFiles } from '../../apps/apps.api'
import { useAuthUser } from '../../auth/useAuthUser'
import { IAccessibleFile } from '../../databases/databases.api'
import { DialogType } from '../../home/types'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { useFetchFilesByUIDQuery } from '../query/useFetchFilesByUIDQuery'
import { noAccessText } from '../file.utils'

const FileIconAndLabel = ({ file }: { file: IAccessibleFile }) => {
  let icon = null
  let label = 'N/A'

  const { private: isPrivate, public: isPublic, space_private, space_public, in_space } = file

  if (isPrivate) {
    icon = <LockIcon height={13} />
    label = 'Private'
  } else if (isPublic) {
    icon = <GlobeIcon height={13} />
    label = 'Public'
  } else if (space_private) {
    icon = <ObjectGroupIcon height={13} />
    label = 'Shared in Space (Confidential)'
  } else if (space_public) {
    icon = <ObjectGroupIcon height={13} />
    label = 'Shared in Space (Cooperative)'
  } else if (in_space) {
    icon = <ObjectGroupIcon height={13} />
    label = 'Shared in Space'
  }

  return (
    <LabelWrap>
      {icon}
      {label}
    </LabelWrap>
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
        {type === 'radio' && !viewOnly && <Radio checked={checked} onChange={() => {}} />}
        {type === 'checkbox' && !viewOnly && <Checkbox onChange={() => {}} checked={checked ?? false} />}
        <FileIcon height={16} />
        <ItemTitle>{file.title}</ItemTitle>
      </StyledName>

      <StyledFileDetail>
        <FileIconAndLabel file={file} />
        <StyledFileDetailItem>{file.file_path}</StyledFileDetailItem>
        <StyledFileDetailItem>{file?.user?.full_name}</StyledFileDetailItem>
        <StyledFileDetailItem>{file?.org?.name}</StyledFileDetailItem>
      </StyledFileDetail>
    </StyledCell>
    <StyledCellNoShrink>
      <StyledAction href={file.path} target="_blank">
        <ArrowUpRightFromSquareIcon height={18} />
      </StyledAction>
    </StyledCellNoShrink>
  </StyledRow>
)

interface FileSelectTabsProps {
  type: DialogType
  scopes?: string[]
  setShowModal: (show: boolean) => void
  handleSelect: (files: IAccessibleFile[]) => void
  uids: string[]
}

const FileSelectTabs = ({ type, scopes, setShowModal, handleSelect, uids }: FileSelectTabsProps) => {
  const user = useAuthUser()
  const [selectedFiles, setSelectedFiles] = useState<IAccessibleFile[]>([])
  const [filter, setFilter] = useState('')
  const [showOnlyMyFiles, setShowOnlyMyFiles] = useState(false)
  const searchText = useDebounce(filter, 250)

  const { data: fetchAccessibleData, status: fetchAccessibleStatus, isFetching } = useFetchFilesByUIDQuery(uids || [])
  const accessError = uids && fetchAccessibleData && uids?.length !== fetchAccessibleData?.length
  const accessibleUids = fetchAccessibleData?.map(i => i.uid)
  const noneSelected = (uids && uids.length === 0) || (selectedFiles && selectedFiles.length === 0)

  const {
    data: filesData,
    isLoading,
    status: loadingFilesStatus,
  } = useQuery({
    queryKey: ['list_files', searchText],
    queryFn: () =>
      fetchFilteredFiles({
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

  const isMyFile = (file: IAccessibleFile): boolean => file.user.dxuser === user?.dxuser

  const files = filesData?.objects ?? []

  return (
    <>
      <ModalPageRow>
        <ModalPageCol>
          <ScrollPlace>
            <Sticky>
              <StyledHeading>
                All Files
                <StyledOnlyMine>
                  <Checkbox onChange={e => toggleOnlyMine(e.target.checked)} checked={showOnlyMyFiles} />
                  Only mine
                </StyledOnlyMine>
              </StyledHeading>
              <StyledFilterFileSection>
                <SyledFilterWrapper>
                  <InputText placeholder="Filter..." onChange={evt => setFilter(evt.target.value)} />
                </SyledFilterWrapper>
                <StyledFieldInfoWrapper>
                  <FieldInfo text="Use % for wildcard searches" />
                </StyledFieldInfoWrapper>
              </StyledFilterFileSection>

              {isLoading && <Loader />}
            </Sticky>
            {loadingFilesStatus === 'success' && (
              <SelectableTable>
                <tbody>
                  {files
                    .filter((file: IAccessibleFile) => (showOnlyMyFiles ? isMyFile(file) && showOnlyMyFiles : true))
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
            )}
          </ScrollPlace>
        </ModalPageCol>
        <ModalPageCol>
          <ScrollPlace>
            <Sticky>
              {accessError && (
                <TabContent>
                  <Card>
                    <div>{uids.length === 1 ? noAccessText.single : noAccessText.multi}</div>
                    <div>{uids?.filter(i => !accessibleUids?.includes(i)).map(i => <SyledUid key={i}>{i}</SyledUid>)}</div>
                  </Card>
                </TabContent>
              )}
              {noneSelected ? <StyledHeading>No selected files</StyledHeading> : <StyledHeading>Selected Files</StyledHeading>}

              {isFetching && (
                <StyledLoader>
                  <Loader className="inline" />
                </StyledLoader>
              )}
            </Sticky>
            <SelectableTable>
              <tbody>
                {selectedFiles?.map(file => (
                  <Row
                    file={file}
                    type={type}
                    key={file.uid}
                    radioCallback={radioCallback}
                    checkboxCallback={checkboxCallback}
                    checked={selectedFiles?.some(s => file.uid === s.uid)}
                  />
                ))}
              </tbody>
            </SelectableTable>
          </ScrollPlace>
        </ModalPageCol>
      </ModalPageRow>
      <Footer>
        <ButtonRow>
          <Button
            onClick={() => {
              setShowModal(false)
            }}
          >
            Cancel
          </Button>
          <Button data-variant="primary" onClick={handleSubmit} disabled={selectedFiles?.length === 0}>
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

  const modalComp = (
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
      <FileSelectTabs type={type} scopes={scopes} setShowModal={setShowModal} handleSelect={handleSelect} uids={uids} />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    showModalResetState,
    isShown,
  }
}
