import styled, { css } from 'styled-components'
import { Callout } from '../../components/Callout'
import { PageContainer } from '../../components/Page/styles'

export const LogoBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  background-color: var(--c-bg-300);
  border-bottom: 1px solid var(--c-layout-border-200);

  .brand-logo-light {
    display: none;
  }

  ${({ theme }) =>
    theme.colorMode === 'dark' &&
    css`
      .brand-logo-light {
        display: inline-flex;
      }

      .brand-logo-dark {
        display: none;
      }
    `}
`

export const RequestAccessPageContainer = styled(PageContainer)`
  display: flex;
  flex-flow: wrap;
  padding: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

export const FormHeader = styled.div`
  width: 100%;
  padding: 12px;
  text-align: center;
  h3 {
    font-size: 20px;
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: 8px;
    letter-spacing: 1px;
  }
  p {
    line-height: 1.5;
  }
`

export const FormWrapper = styled.div`
  padding: 12px;
  width: 540px;
  max-width: 540px;

  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--c-layout-border-200);
  border-radius: 8px;
  background-color: var(--background);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
  }
`

export const StyledForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;

  button[type='submit'] {
    margin-left: auto;
    margin-right: auto;
    width: 100%;
  }
`

export const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  color: var(--c-text-500);
  letter-spacing: 0.7px;
  margin-bottom: 0;
  text-align: center;
`

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

export const FlexRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 8px;

  & > div {
    flex: 1;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`

export const CheckboxGroup = styled.div`
  & > h5 {
    font-weight: bold;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0;
    color: var(--c-text-700);
  }
  label {
    font-weight: normal;
  }
`

export const CheckboxRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 8px;

  & > label {
    flex: 1;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;
  }
`

export const ServerError = styled.div`
  color: var(--c-text-700);
`

export const FormError = styled(Callout)`
  width: 100%;
  display: flex;
  flex: 20px 1 1;
  flex-direction: row;
  align-items: flex-start;
  gap: 4px;
`

export const MessageWrapper = styled.div`
  max-width: 600px;
  padding: 32px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;

  h3 {
    font-weight: 600;
    font-size: 20px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  p {
    line-height: 1.5;
  }
`
