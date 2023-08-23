import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components'
import { Button, ButtonSolidBlue } from '../../../../components/Button'
import { StyledName } from '../../../../components/ResourceTable'
import { Modal } from '../../../modal'
import { useModal } from '../../../modal/useModal'
import { fetchFilteredFiles } from '../../apps/apps.api'
import { FileIcon } from '../../../../components/icons/FileIcon'
import { Radio } from '../../../../components/Radio'
import { Checkbox } from '../../../../components/Checkbox'
import { colors } from '../../../../styles/theme'
import { StyledInput } from '../../../../components/InputText'
import { LockIcon } from '../../../../components/icons/LockIcon'
import { GlobeIcon } from '../../../../components/icons/GlobeIcon'
import { ArrowUpRightFromSquareIcon } from '../../../../components/icons/ArrowUpRightFromSquareIcon'
import { Tabs } from '../../../../components/Tabs/Tabs'
import { Loader } from '../../../../components/Loader'
import { useDebounce } from '../../../../components/Table/useDebounce'
import { ModalScroll } from '../../../modal/styles'
import { useAuthUser } from '../../../auth/useAuthUser'
import { IAccessibleFile } from '../../databases/databases.api'
import { ObjectGroupIcon } from '../../../../components/icons/ObjectGroupIcon'

const SelectableTable = styled.table`
  padding: 0px;
  width: 100%;
  tr:hover {
      color: ${colors.primaryBlue};
      cursor: pointer;
      background-color: ${colors.subtleBlue};
  }
`
const StyledRow = styled.tr`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-top: 1px ${colors.textLightGrey} solid;
  padding: 0px;
`

const StyledCell = styled.td`
  display: flex;
  flex-direction: column;
`

const StyledAction = styled.a`
  color: ${colors.primaryBlue};
  padding: 12px;
`

const StyledOnlyMine = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
`
const StyledContainer = styled.div`
  margin: 0.5rem;
`

const StyledFilterSection = styled.div`
  display: flex;
  flex-direction: row;
  padding-bottom: 12px;
  padding-top: 12px;
`

const StyledFileDetail = styled.div`
  display: flex;
  align-items: center;
  margin-left: 28px;
  color: ${colors.textMediumGrey};
  font-size: 85%;
  padding: 5px;
`

const StyledFileDetailItem = styled.span`
  margin-left: 10px;
`

const StyledSubtitle = styled.div`
  color: ${colors.textMediumGrey};
  font-size: 85%;
`

const ButtonBadge = styled.div`
  background-color: white;
  color: blue;
  border-radius: 10px;
  padding: 3px 7px;
  line-height: 1;
`

const Tab = styled.div`
`

const StyledModal = styled(Modal)`
  height: 500px;
  padding: 0px;
`

export enum DialogType {
  RADIO = 'radio',
  CHECKBOX = 'checkbox'
}

const FileIconAndLabel = ({ file }: { file: IAccessibleFile }) => {
    let icon = null
    let label = 'N/A'

    const { private: isPrivate, public: isPublic, space_private, space_public, in_space } = file

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

    return (<>
        {icon}
        {label}
    </>)
}

const Row = ({ file, type, viewOnly, 
  radioCallback, checkboxCallback, checked }: 
  {file: IAccessibleFile, type: DialogType, viewOnly: boolean,
    radioCallback: (file: IAccessibleFile) => void,
    checkboxCallback: (checked: boolean, file: IAccessibleFile) => void, checked?: boolean}) =>
  (
    <StyledRow onClick={() => {
      if (!viewOnly) {
        if (type === DialogType.RADIO) {
          radioCallback(file)
        } else if (type === DialogType.CHECKBOX) {
          checkboxCallback(!checked, file)
        }
      }
    }
    }><StyledCell>
        <StyledName>
          <StyledContainer>
            {(type === DialogType.RADIO && !viewOnly) &&
              <Radio checked={checked} onChange={() => {}} />
            }
            {(type === DialogType.CHECKBOX && !viewOnly) &&
              <Checkbox onChange={() => {}} checked={checked} />}
          </StyledContainer>
          <FileIcon />
          {file.title}
        </StyledName>

        <StyledFileDetail>
          <FileIconAndLabel file={file} />
          <StyledFileDetailItem>{file.file_path}</StyledFileDetailItem>
          <StyledFileDetailItem>{file.user.full_name}</StyledFileDetailItem>
          <StyledFileDetailItem>{file.org.name}</StyledFileDetailItem>
        </StyledFileDetail>
      </StyledCell>
      <StyledCell>
        <StyledAction href={file.path}><ArrowUpRightFromSquareIcon /></StyledAction>
      </StyledCell>
    </StyledRow>
  )

/**
 * Dialog for selecting file(s). It can function in two modes specified 
 * by DialogType. In Radio mode only single file selection is allowed, however
 * in checkbox mode it allows user select multiple files.
 * 
 * @returns list of selected files
 */
export const useSelectFileModal = (title: string, type: DialogType, handleSelect: (files: IAccessibleFile[]) => void,
  subtitle?: string, scope?: string) => {

  const user = useAuthUser()
  const listedFiles: IAccessibleFile[] = []
  const { isShown, setShowModal } = useModal()
  const [selectedFiles, setSelectedFiles] = useState(listedFiles)
  const [filter, setFilter] = useState('')
  const [showOnlyMyFiles, setShowOnlyMyFiles] = useState(false)
  const searchText = useDebounce(filter, 250)

  const { data: filesData, status: loadingFilesStatus } = useQuery(['list_files', searchText], () => {
    const scopes = scope?.startsWith('space') ? [scope] : [] // blank is for all
    return fetchFilteredFiles(searchText, scopes)
  })

  const radioCallback = (file: IAccessibleFile) => {
    setSelectedFiles([file])
  }

  const addFile = (file: IAccessibleFile) => {
    setSelectedFiles(prev => [...prev, file])
  }

  const removeFile = (file: IAccessibleFile) => {
    setSelectedFiles(prev => 
      [...prev.filter(item => file.id !== item.id)],
    )
  }

  const checkboxCallback = (checked: boolean, file: IAccessibleFile) => {
    if (checked) {
      addFile(file)
    } else {
      removeFile(file)
    }
  }

  const showModalResetState = () => {
    setSelectedFiles([])
    setShowModal(true)
  }

  const toggleOnlyMine = (evt: React.MouseEvent<HTMLElement>) => {
    if (evt.target.checked) {
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

  const files = (filesData?.objects) ?? []

  const modalComp = isShown && (
    <StyledModal
      headerText={title}
      isShown={isShown}
      hide={() => setShowModal(false)}
      footer={
        <>
          <Button onClick={() => { setShowModal(false) }}>Cancel</Button>
          <ButtonSolidBlue onClick={handleSubmit} disabled={selectedFiles?.length === 0}>
            Select &nbsp;<ButtonBadge>{selectedFiles?.length}</ButtonBadge>
          </ButtonSolidBlue>
        </>
      }
    >
      {subtitle && <StyledSubtitle>{subtitle}</StyledSubtitle>}
      <Tabs>
        <Tab title={`Selected ${selectedFiles.length}`} key="selected">
          {selectedFiles.length === 0 && <>No selected files</>}
          {selectedFiles.length > 0 && <ModalScroll><SelectableTable>
            <tbody>{selectedFiles.map(file =>
            <Row file={file} type={type} viewOnly key={file.id}
            radioCallback={radioCallback} checkboxCallback={checkboxCallback} />,
            )}</tbody>
          </SelectableTable></ModalScroll>}
        </Tab>
        <Tab title={`Files ${files.length}`} key="files">
          <StyledFilterSection>
            <StyledInput placeholder='Filter...' onChange={(evt) => setFilter(evt.target.value)} />
            <StyledOnlyMine>
              <Checkbox onClick={(evt: React.MouseEvent<HTMLElement>) => toggleOnlyMine(evt)} />Only mine
            </StyledOnlyMine>
          </StyledFilterSection>
          {(loadingFilesStatus === 'loading') && <Loader />}
          {(loadingFilesStatus === 'success') &&
            <ModalScroll><SelectableTable>
              <tbody>
                {files.filter((file: IAccessibleFile) =>
                  ((showOnlyMyFiles) ? isMyFile(file) && showOnlyMyFiles : true))
                  .map((file: IAccessibleFile) =>
                    <Row file={file} type={type} viewOnly={false} key={file.id}
                      radioCallback={radioCallback} checkboxCallback={checkboxCallback}
                      checked={selectedFiles.some(selected => file.id === selected.id)} />,
                  )}
              </tbody>
            </SelectableTable></ModalScroll>
          }
        </Tab>
      </Tabs>
    </StyledModal>
  )
  return {
    modalComp,
    setShowModal,
    showModalResetState,
    isShown,
  }
}