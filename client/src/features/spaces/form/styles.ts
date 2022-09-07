import styled from 'styled-components'
import { Button } from '../../../components/Button'
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
`

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
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
