import React from 'react'
import styled from 'styled-components'
import { InputNumber } from '../../../components/InputText'
import { User } from './types'
import { Button } from '../../../components/Button'

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
    <InputNumber
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
    <Button
      data-variant="primary"
      data-testid="admin-users-set-total-limit-button"
      disabled={selectedUsers.length === 0 || isSubmitButtonDisabled}
      onClick={onSubmit}
    >
      {buttonText}
    </Button>
  </LimitButtonWrapper>
)
