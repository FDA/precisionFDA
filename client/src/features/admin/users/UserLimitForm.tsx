import React from 'react'
import styled from 'styled-components'
import { StyledInput } from '../../../components/InputText'
import { ButtonSolidBlue } from '../../../components/Button'
import { User } from './types'

type Props = {
  buttonText: string
  onSubmit: () => void
  onChange: (n: number) => void
  selectedUsers: User[];
  isSubmitButtonDisabled: boolean
}

const LimitButtonWrapper = styled.div`
  display: flex;
  gap: 1px;
  margin-left: 16px;
`

export const UserLimitForm = ({ buttonText, selectedUsers, onSubmit, onChange, isSubmitButtonDisabled }: Props) => (
  <LimitButtonWrapper>
    <StyledInput
      type="number"
      step={0.01}
      onChange={(e) => {
        onChange(parseFloat(e.target.value))
      }}
      min={0}
      style={{
        width: '72px',
        fontSize: 11,
        lineHeight: '1.1rem',
        paddingRight: 2,
      }}
    />
    <ButtonSolidBlue
      data-testid="admin-users-set-total-limit-button"
      disabled={selectedUsers.length === 0 || isSubmitButtonDisabled}
      onClick={onSubmit}
    >
      {buttonText}
    </ButtonSolidBlue>
  </LimitButtonWrapper>
)
