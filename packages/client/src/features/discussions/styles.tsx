import styled, { css } from 'styled-components'
import { colors, theme } from '../../styles/theme'
import { TransparentButton } from '../../components/Button'
import { imageReset } from '../../styles/commonStyles'

export const CommentCount = styled.div`
  line-height: 32px;
  font-weight: bold;
`
export const DiscussionTitle = styled.div`
  display: flex;
  margin-top: 16px;
  margin-bottom: 16px;
`
export const StyledTitle = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  font-size: 32px;
  font-weight: bolder;
  height: 36px;
  svg {
    color: ${theme.colors.stateLabelGrey};
  }
`
export const StyledTitleEdit = styled.div`
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: center;
  input {
    width: 100%;
    max-width: 300px;
    height: 32px;
    padding: 0 8px;
  }
`

export const StyledReplyButton = styled(TransparentButton)`
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 16px;
`

export const PageContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
  padding: 16px;
  padding-bottom: 120px;
  gap: 16px;
  max-width: 880px;
  width: fill-available;
  align-self: center;
  box-sizing: border-box;
  width: 100%;

  @media (min-width: 640px) {
    padding: 32px;
  }
`

export const StyledTextArea = styled.textarea`
  font-family: ${theme.fontFamily};
  width: 100%;
`

export const ImageContainer = styled.div`
  position: relative;
`

export const AttachmentsLabel = styled.span`
  font-weight: bold;
  margin-bottom: 8px;
`

export const StyledCommentCard = styled.div<{ $isAnswer?: boolean }>`
  font-size: 14px;
  display: flex;
  padding: 8px 16px;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  border-radius: 6px;
  border: 1px solid var(--c-layout-border);
  background: var(--background);
  ${({ $isAnswer }) =>
    $isAnswer &&
    css`
      background: var(--c-discussion-answer-bg);
      border: 1px solid var(--c-discussion-answer-300);
    `}
`

export const Li = styled.li`
  cursor: pointer;
  padding: 4px 16px;
  white-space: nowrap;
  &:hover {
    background-color: ${colors.white110};
  }
  a {
    color: var(--c-text-700);
  }
`

export const Ol = styled.ol`
  margin: 0;
  padding: 2px 0;
  list-style: none;
  font-size: 14px;
  width: min-content;
  max-height: 350px;
  background-color: #fff;
  border: 1px solid #ccc;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 3px;
  box-shadow: 0 6px 12px rgb(0 0 0 / 18%);
`

export const UsernameLink = styled.a`
  font-weight: bold;
`
export const CardLeft = styled.div`
  display: flex;
  align-items: center;
  flex: 0 1 auto;
  gap: 8px;
  font-size: 14px;
`
export const StyledAnswerLabel = styled.div`
  display: flex;
  align-items: center;
  font-weight: bold;
  color: var(--c-discussion-answer-500);
  svg {
    margin-right: 4px;
  }
`
export const StyledEditButton = styled(TransparentButton)`
  color: var(--c-text-400);
  padding: 4px;
  padding-bottom: 2px;
`
export const CardRight = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  font-size: 14px;
`
export const StyledCardHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-self: stretch;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

export const StyledMarkdown = styled.div<{ $isAnswer?: boolean }>`
  ${({ $isAnswer }) =>
    $isAnswer &&
    css`
      background: #fdfcf2;
    `}
  font-size: 14px;
  align-self: stretch;
  h1 {
    font-size: 28px;
  }
  h2 {
    font-size: 21px;
  }
  h2 {
    font-size: 17.5px;
  }
  p {
    font-size: 14px;
    line-height: 1.6em;
    margin: 1em 0;
  }
  ul {
    li {
      line-height: 1.6em;
    }
  }
  img {
    ${imageReset}
  }
`
export const StyledCardList = styled.div`
  display: flex;
  padding-left: 0px;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;
  margin-left: 32px;
`
