import React, { ReactNode } from 'react'
import styled from 'styled-components'
import { FieldGroup as StyledFieldGroup } from './styles'

const Row = styled.div`
  display: flex;
  justify-content: space-between;
`
const Pill = styled.div`
  font-size: 12px;
  letter-spacing: 0;
  color: var(--c-text-700);
  line-height: 16px;
  background-color: var(--tertiary-200);
  border: 1px solid var(--base-opacity-06);
  padding: 3px 4px;
  border-radius: 3px;
  margin-left: 4px;
`

const RequiredPill = () => (
  <Pill>Required</Pill>
)

export const FieldGroup = ({ children, label, required = false, errorMessage }: { children?: React.ReactNode, label?: ReactNode, required?: boolean, errorMessage?: string }) => (
  <StyledFieldGroup>
    <Row>{label && <label>{label}</label>}{required && <RequiredPill />}</Row>
    {children}
  </StyledFieldGroup>
)
