import React from 'react'
import { DropdownNext } from '../../../components/Dropdown/DropdownNext'
import { StarIcon } from '../../../components/icons/StarIcon'
import { ThreeDotsIcon } from '../../../components/icons/ThreeDotsIcon'
import { IUser } from '../../../types/user'
import { formatDiscussionDate } from '../helpers'
import {
  CardLeft,
  CardRight,
  Li,
  Ol,
  StyledAnswerLabel,
  StyledCardHeader,
  StyledEditButton,
  UsernameLink,
} from '../styles'
import { Identicon } from '../../../components/Identicon'
import { CardType } from '../discussions.types'


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
  user: IUser
  canUserEdit: boolean
  onClickEdit: () => void
  onClickDelete: () => void
}) => {
  return (
    <StyledCardHeader>
      <CardLeft>
        <Identicon dxuser={user.dxuser} />
        <span>
          <UsernameLink href={`/users/${user.dxuser}`}>{user.fullName}</UsernameLink> on {formatDiscussionDate(timestamp)}
        </span>
      </CardLeft>
      <CardRight>
        {cardType === 'answer' && <StyledAnswerLabel><StarIcon height={12} />Answer</StyledAnswerLabel>}
        {canUserEdit && (
          <DropdownNext
            placement="bottom-end"
            trigger="click"
            // eslint-disable-next-line react/no-unstable-nested-components
            content={() => (
              <Ol>
                <Li onClick={() => onClickEdit()}>{EDIT_TEXT[cardType]}</Li>
                <Li onClick={() => onClickDelete()}>{DELETE_TEXT[cardType]}</Li>
              </Ol>
            )}
          >
            {dropdownProps => (
              <StyledEditButton tabIndex={0} {...dropdownProps}><ThreeDotsIcon width={16} /></StyledEditButton>
            )}
          </DropdownNext>
        )}
      </CardRight>
    </StyledCardHeader>
  )
}
