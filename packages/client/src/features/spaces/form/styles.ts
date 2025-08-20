import styled from 'styled-components'
import { BackLink } from '../../../components/Page/PageBackLink'
import { Button } from '../../../components/Button'

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  @media (min-width: 640px) {
    max-width: 580px;
  }
  margin-bottom: 48px;
  padding: 20px;
  background: var(--background);
  border-radius: 16px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--tertiary-200);
`

export const HintText = styled.div`
  margin-top: 8px;
  padding: 12px 16px 12px;
  font-size: 14px;
  line-height: 1.5;
  background: var(--primary-50);
  border: 1px solid var(--tertiary-200);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  white-space: pre-line;

  &:before {
    height: 100%;
    width: 4px;
    content: '';
    background: var(--primary-400);
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
  }

  p {
    margin: 0 0 12px 0;

    &:last-child {
      margin-bottom: 0;
    }
  }

  ul {
    margin: 8px 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
    position: relative;

    &::marker {
      color: var(--primary-500);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  /* Special styling for CTS hint */
  &:has(+ *) {
    background: var(--highlight-50);
    border-color: var(--highlight-200);

    &::before {
      background: var(--highlight-400);
    }
  }
`

export const Row = styled.div`
  display: flex;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--tertiary-200);
`

export const StyledBack = styled(BackLink)`
  margin-top: 32px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(-2px);
  }
`

export const StyledButton = styled(Button)`
  padding: 8px 12px;
  border: none;
  background: none;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--tertiary-100);
  }
`

export const StyledPageCenter = styled.div`
  display: flex;
  justify-content: center;
`
export const StyledPageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 640px;
  width: 100%;
`
