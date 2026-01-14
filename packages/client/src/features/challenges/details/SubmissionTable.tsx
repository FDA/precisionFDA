import React from 'react'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { Markdown, MarkdownStyle } from '../../../components/Markdown'
import { IUser } from '../../../types/user'
import { ButtonRow, Footer } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { SubmissionInputFile, SubmissionV2 } from './submission.types'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'

const StyledFileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const StyledFileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;

  a {
    color: var(--c-link);
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`

const StyledNameCell = styled.div`
  cursor: pointer;
  color: var(--c-link);
`

export const NameCell = ({ submission }: { submission: SubmissionV2 }) => {
  const { isShown, setShowModal } = useModal()

  return (
    <>
      <StyledNameCell onClick={() => setShowModal(true)}>{submission.name}</StyledNameCell>
      <ModalNext id="submission-detail-modal" isShown={isShown} hide={() => setShowModal(false)}>
        <ModalHeaderTop headerText={`Submission: ${submission.name}`} hide={() => setShowModal(false)} />
        <MarkdownStyle>
          <Markdown data={submission.description} />
        </MarkdownStyle>
        <Footer>
          <ButtonRow>
            <Button onClick={() => setShowModal(false)}>Close</Button>
          </ButtonRow>
        </Footer>
      </ModalNext>
    </>
  )
}

export const InputFileCell = ({
  authUser,
  submission,
  isSpaceMember,
}: {
  authUser?: IUser
  submission: SubmissionV2
  isSpaceMember: boolean
}) => {
  return (
    <StyledFileList>
      {submission.job.inputFiles.map(file => {
        const userCanAccessFile = (f: SubmissionInputFile) => {
          const fileIsPublic = f.scope === 'public'
          const userIsOwnerOfFile = f.userId === authUser?.id
          return fileIsPublic || userIsOwnerOfFile || isSpaceMember
        }

        if (userCanAccessFile(file)) {
          return (
            <StyledFileItem key={file.id}>
              <a href={`/home/files/${file.uid}`} target="_blank" rel="noreferrer">
                {file.name}
              </a>
            </StyledFileItem>
          )
        }
        return <StyledFileItem key={file.id}>{file.name}</StyledFileItem>
      })}
    </StyledFileList>
  )
}
