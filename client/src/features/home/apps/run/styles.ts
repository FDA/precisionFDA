import styled, { css } from 'styled-components'
import { BackLink } from '../../../../components/Page/PageBackLink'

const pageContainer = css`
  margin-inline: auto;
  width: min(100% - 32px, 900px);
`

export const AppsConfiguration = styled.div`
`

export const TipsRow = styled.div`
  padding: 16px 0;
  color: #777777;
  text-align: left;
`

export const SectionHeader = styled.div`
  padding: 20px 15px;
  border-bottom: 1px solid transparent;
  color: #333333;
  background-color: #f5f5f5;
  border-color: #ddd;
  border-top-color: rgb(221, 221, 221);
  border-right-color: rgb(221, 221, 221);
  border-bottom-color: rgb(221, 221, 221);
  border-left-color: rgb(221, 221, 221);
`

export const SectionBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: 15px;
  gap: 24px;
`

export const Section = styled.div`
  margin-bottom: 32px;
  border-radius: 3px;
  border: 1px solid transparent;
  border-color: #ddd;
`

export const Topbox = styled.div` 
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin: 32px 0;

  ${pageContainer};
`

export const TopboxItem = styled.div`
`

export const StyledRow = styled.div`
  display: flex;
  flex-direction: row;
`

export const StyledJobName = styled.div`
  flex-grow: 1;
  padding-right: 16px;
`

export const StyledForm = styled.form`
  ${pageContainer};
  padding-bottom: 64px;
`

export const WrapSelect = styled.div`
  max-width: 500px;
  font-size: 14px;
`

export const StyledLine = styled.div`
  display: flex;
  flex-direction: row;
`

export const StyledBackLink = styled(BackLink)`
  margin-bottom: 32px;
`
