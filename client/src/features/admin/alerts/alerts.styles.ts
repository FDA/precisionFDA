import styled, { css } from 'styled-components'
import { TransparentButton } from '../../../components/Button'
import { ButtonRow } from '../../modal/styles'
import { InputSelect } from '../../../components/form/styles'

export const PageTop = styled.div`
  padding: 16px 16px;
  display: flex;
  justify-content: space-between;

  h1 {
    font-weight: bold;
    font-size: 20px;
    display: flex;
    align-items: center;
  }
`
export const AlertItem = styled(TransparentButton) <{ $active?: boolean }>`
  white-space: initial;
  max-width: 500px;
  text-align: initial;
  text-wrap: pretty;
  border: 1px solid var(--c-layout-border);
  padding: 8px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  ${({ $active }) =>
    $active &&
    css`
      background-color: var(--background-shaded);
    `}
`
export const Title = styled.div`
  font-size: 16px;
  font-weight: bold;
`
export const Content = styled.div`
  font-size: 12px;
`
export const StyledAlertList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 16px;
  min-width: 300px;
  gap: 16px;
  overflow-y: auto;
  padding-bottom: 32px;
`

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

  padding: 0 16px;
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
`
