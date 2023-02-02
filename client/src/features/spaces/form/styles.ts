import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { BackLink } from '../../../components/Page/PageBackLink'
import { colors } from '../../../styles/theme'

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media (min-width: 640px) {
    max-width: 500px;
  }
  margin-bottom: 64px;
`

export const HintText = styled.div`
  margin-top: 4px;
  font-size: 14px;
  color: ${colors.blacktextOnWhite};

  li {
    margin-bottom: 8px;
  }
`

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
`

export const StyledBack = styled(BackLink)`
  margin-top: 32px;
`

export const StyledButton = styled(Button)`
  padding: 4px;
  border: none;
  background: none;
`

export const StyledPageCenter = styled.div`
  display: flex;
  justify-content: center;
`
export const StyledPageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 500px;
  padding: 0 16px;
  width: 100%;
`
export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;

  input {
    margin: 0;
    margin-right: 10px;
    width: 14px;
    height: 14px;
  }
`
