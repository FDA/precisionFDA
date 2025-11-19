import React from 'react'
import Menu from '../../../components/Menu/Menu'
import { StarIcon } from '../../../components/icons/StarIcon'
import { ThreeDotsIcon } from '../../../components/icons/ThreeDotsIcon'
import { formatDiscussionDate } from '../helpers'
import { CardLeft, CardRight, Li, Ol, StyledAnswerLabel, StyledCardHeader, StyledEditButton, UsernameLink } from '../styles'
import { CardType } from '../discussions.types'
import { SimpleUser } from '../../../types/user'

const EDIT_TEXT = {
  answer: 'Edit Answer',
  comment: 'Edit Comment',
  discussion: 'Edit Discussion',
} satisfies Record<CardType, string>

const DELETE_TEXT = {
  answer: 'Delete Answer',
  comment: 'Delete Comment',
  discussion: 'Delete Discussion',
} satisfies Record<CardType, string>

export const CardHeader = ({
  timestamp,
  cardType,
  user,
  canUserEdit,
  onClickEdit,
  onClickDelete,
}: {
  timestamp: string
  cardType: CardType
  user: SimpleUser
  canUserEdit: boolean
  onClickEdit: () => void
  onClickDelete: () => void
}) => {
  return (
    <StyledCardHeader>
      <CardLeft>
        <UsernameLink href={`/users/${user.dxuser}`}>{user.fullName}</UsernameLink> on {formatDiscussionDate(timestamp)}
      </CardLeft>
      <CardRight>
        {cardType === 'answer' && (
          <StyledAnswerLabel>
            <StarIcon height={12} />
            Answer
          </StyledAnswerLabel>
        )}
        {canUserEdit && (
          <Menu
            trigger={
              <Menu.Trigger>
                <StyledEditButton data-testid={`${cardType}-dropdown`} tabIndex={0}>
                  <ThreeDotsIcon width={16} />
                </StyledEditButton>
              </Menu.Trigger>
            }
          >
            <Menu.Item onClick={() => onClickEdit()}>{EDIT_TEXT[cardType]}</Menu.Item>
            <Menu.Item onClick={() => onClickDelete()}>{DELETE_TEXT[cardType]}</Menu.Item>
          </Menu>
        )}
      </CardRight>
    </StyledCardHeader>
  )
}
