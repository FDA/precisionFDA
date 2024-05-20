/* eslint-disable max-classes-per-file */
import React from 'react'
import { Button } from '../../../components/Button'
import { Markdown, MarkdownStyle } from '../../../components/Markdown'
import { IUser } from '../../../types/user'
import { StyledNameCell } from '../../home/home.styles'
import { Modal } from '../../modal'
import { ButtonRow } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { Submission } from './submission.types'


export const NameCell = ({ submission }: { submission: Submission }) => {
  const { isShown, setShowModal } = useModal()

  return (
    <>
      <StyledNameCell onClick={() => setShowModal(true)}>
        {submission.name}
      </StyledNameCell>
      <Modal
        id="submission-detail-modal"
        isShown={isShown}
        hide={() => setShowModal(false)}
        headerText={`Submittion: ${submission.name}`}
        footer={
          <ButtonRow>
            <Button onClick={() => setShowModal(false)}>Close</Button>
          </ButtonRow>
        }
      >
        <MarkdownStyle>
          <Markdown data={submission.desc} />
        </MarkdownStyle>
      </Modal>
    </>
  )
}

export const InputFileCell = ({
  authUser,
  submission,
  isSpaceMember,
}: {
  authUser: IUser
  submission: Submission
  isSpaceMember: boolean
}) => {
  return (
    <ul className="submission-ul">
      {submission.job_input_files.map(file => {
        const userCanAccessFile = (f: any) => {
          const fileIsPublic = f.scope === 'public'
          const userIsOwnerOfFile = f.user_id === authUser.id
          return (
            !authUser.is_guest &&
            (fileIsPublic || userIsOwnerOfFile || isSpaceMember)
          )
        }

        const generateAppropriateLink = (f: any) => {
          if (isSpaceMember) {
            const space_file: any = submission.run_input_data.filter(
              (v: any) => v.file_name === f.name,
            )?.[0]
            return space_file
              ? `/home/files/${space_file?.file_uid}`
              : `/home/files/${f.uid}`
          }

          return `/home/files/${f.uid}`
        }

        if (userCanAccessFile(file)) {
          return (
            <li key={file.id}>
              <a
                href={generateAppropriateLink(file)}
                target="_blank"
                rel="noreferrer"
              >
                {file.name}
              </a>
            </li>
          )
        }
        return <li key={file.id}>{file.name}</li>
      })}
    </ul>
  )
}
