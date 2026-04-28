import styled from 'styled-components'
import { InputSelect } from '@/components/form/styles'
import { ButtonRow } from '../../modal/styles'

export const Form = styled.form`
  align-self: center;
  margin: 32px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 500px;
  flex: 1 0 auto;
  width: 100%;

  ${InputSelect} {
    min-height: 34px;
    font-size: 14px;
  }
`

export const PreviewBanner = styled.div`
  align-items: stretch;
  position: sticky;
  top: 0;
  z-index: 3;
  background-color: var(--background);

  p {
    font-size: 13px;
    font-weight: bold;
  }
`
export const StyledRow = styled(ButtonRow)`
  justify-content: flex-start;
`
export const FormPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow-y: auto;
  flex: 1;
  padding: 0 32px;
`
