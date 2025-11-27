import React, { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { TransparentButton } from '../../components/Button'
import { BullsEyeIcon } from '../../components/icons/BullsEyeIcon'
import { CogsIcon } from '../../components/icons/Cogs'
import { CubeIcon } from '../../components/icons/CubeIcon'
import { FileIcon } from '../../components/icons/FileIcon'
import { FileZipIcon } from '../../components/icons/FileZipIcon'
import { FolderIcon } from '../../components/icons/FolderIcon'
import { TrashIcon } from '../../components/icons/TrashIcon'
import { Attachment, AttachmentKey, AttachmentType, FormAttachments } from './discussions.types'
import { areAttachmentsEmpty, typeAttachmentKey } from './helpers'
import { AttachmentsLabel } from './styles'

const StyledAttachmentsContainer = styled.div``

const TableRow = styled.div`
  display: flex;
  justify-content: space-between;
  border-radius: 3px;
  &:hover {
    background-color: var(--background-shaded-100);
  }
`
const TableCell = styled.span`
  padding: 0 8px;
  display: flex;
  justify-content: space-between;
  gap: 30px;
  margin: 3px 0;

  a {
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    overflow: hidden;
    flex: 0 1 auto;
    align-items: center;
    gap: 4px;
  }
`

const IconRight = styled.div`
  display: flex;
  align-items: center;
  flex: 0 1 auto;
`

const NoLink = styled.div`
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  overflow: hidden;
  flex: 0 1 auto;
  align-items: center;
  gap: 4px;
`

const StyledAttachmentsList = styled.div`
  font-size: 14px;
  margin: 8px 8px 16px 16px;
  max-width: 100%;
  overflow: hidden;
`
const TypeLabel = styled.div`
  padding-left: 8px;
  font-weight: 600;
`

export const AttachmentsList = ({
  attachments,
  onRemoveAttachment,
}: {
  attachments: FormAttachments | undefined
  onRemoveAttachment?: (field: `attachments.${AttachmentKey}`, id: string | number) => void
}) => {
  if (areAttachmentsEmpty(attachments)) {
    return null
  }

  const { files = [], folders = [], assets = [], apps = [], jobs = [], comparisons = [] } = attachments!

  const typeIcon = {
    UserFile: <FileIcon height={14} />,
    Folder: <FolderIcon height={14} />,
    Asset: <FileZipIcon height={14} />,
    Job: <CogsIcon height={14} />,
    Comparison: <BullsEyeIcon height={14} />,
    App: <CubeIcon height={14} />,
  } satisfies Record<AttachmentType, ReactNode>

  const renderList = (items: Array<Attachment>, type: string) => {
    if (items.length === 0) {
      return null
    }

    return (
      <StyledAttachmentsList data-testid={`attachments-${type.toLowerCase()}`}>
        <TypeLabel>{type}</TypeLabel>

        {items.map(item => (
          <TableRow key={item.id}>
            <TableCell>
              {item.link ? (
                <Link target="_blank" to={item.link} rel="noopener noreferrer">
                  {typeIcon[item.type]} {item.name}
                </Link>
              ) : (
                <NoLink>
                  {typeIcon[item.type]} {item.name}
                </NoLink>
              )}
            </TableCell>

            {onRemoveAttachment && (
              <TableCell>
                <IconRight>
                  <TransparentButton
                    type="button"
                    onClick={() => onRemoveAttachment(`attachments.${typeAttachmentKey[item.type]}`, item.id)}
                  >
                    <TrashIcon height={14} />
                  </TransparentButton>
                </IconRight>
              </TableCell>
            )}
          </TableRow>
        ))}
      </StyledAttachmentsList>
    )
  }

  return (
    <>
      <AttachmentsLabel>Attachments</AttachmentsLabel>
      <StyledAttachmentsContainer>
        {renderList(files, 'Files')}
        {renderList(folders, 'Folders')}
        {renderList(assets, 'Assets')}
        {renderList(apps, 'Apps')}
        {renderList(jobs, 'Jobs')}
        {renderList(comparisons, 'Comparisons')}
      </StyledAttachmentsContainer>
    </>
  )
}
