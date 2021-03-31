import styled from 'styled-components'
import { theme } from '../../styles/theme'

export const PageContainer = styled.div`
  padding-left: 20px;
  padding-right: 20px;
`

export const PageTitle = styled.h1`
  font-size: 30px;
  color: ${theme.primaryLite};
  margin: 0;
`

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
`

export const PageActions = styled.div`
  display: flex;
  gap: 10px;
`
