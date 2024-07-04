import styled from 'styled-components'
import { StyledBreadcrumbs } from '../../../../components/Breadcrumb'
import { Button } from '../../../../components/Button'
import { StyledName } from '../../../../components/ResourceTable'
import { Svg } from '../../../../components/icons/Svg'
import { StyledCell, StyledFileDetail, StyledRow } from '../../../actionModals/styles'
import { Help } from '../../../apps/form/styles'
import { ModalPageCol, ModalPageRow, ScrollPlace } from '../../../modal/styles'
import { SearchBarWrapper } from '../../../resources/styles'

export const ShorternName = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const CopyHelp = styled(Help)`
  width: 100%;
  border-radius: 4px;
  background-color: var(--highlight-100);
  border-color: var(--highlight-500);
`

export const CopyModalPageRow = styled(ModalPageRow)`
  & > div {
    max-width: 500px;
    height: 60vh;
  }
`

export const CopyModalPageCol = styled(ModalPageCol)`
  padding: 8px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
`

export const CopyModalScrollPlace = styled(ScrollPlace)`
  max-height: 100%;
`

export const SelectedList = styled.ul`
  list-style-type: none;
  padding-left: 0;
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`

export const FileListItem = styled.li<{ $isCopied?: boolean }>`
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: ${({ $isCopied }) => ($isCopied ? 'var(--highlight-100)' : 'transparent')};
`

export const NodeHeading = styled.a`
  display: flex;
  align-items: center;
  span {
    margin-left: 8px;
  }
`

export const FolderHeading = styled(NodeHeading)`
  padding: 12px;
  border-bottom: 1px solid #ddd;
`

export const FolderItem = styled(FileListItem)<{ $isCopied?: boolean }>`
  border: 1px solid #ddd;
  padding: 0;
  background-color: ${({ $isCopied }) => ($isCopied ? 'var(--highlight-100)' : 'transparent')};
`

export const FolderChildrenList = styled.ul`
  padding-left: 24px;
  list-style-type: none;
`

export const FolderChildrenListItem = styled.li<{ $isCopied?: boolean }>`
  border-bottom: 1px solid #ddd;
  padding: 12px;
  background-color: ${({ $isCopied }) => ($isCopied ? 'var(--highlight-100)' : 'transparent')};
  &:last-child {
    border-bottom: none;
  }
`

export const StyledCopyFileDetail = styled(StyledFileDetail)`
  padding-left: 0;
  padding-right: 0;
  margin-left: 24px;
`

export const StyledFileDetailIcon = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
`

export const FileDetailItem = styled.a`
  display: flex;
  color: var(--c-text-500);
  overflow-x: hidden;
  &:hover,
  &:focus {
    text-decoration: underline;
    color: var(--c-text-500);
  }
  span {
    margin-left: 4px;
  }
`

export const ModalStyledBreadcrumbs = styled(StyledBreadcrumbs)`
  padding: 12px;
  height: fit-content;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ddd;
`

export const StyledBreadcrumb = styled.div`
  display: inline-flex;
  height: 20px;
`

export const StyledBreadcrumbButton = styled(Button)`
  padding: 0;
`

export const ModalSearchBarWrapper = styled(SearchBarWrapper)`
  justify-content: flex-end;
  margin-top: 8px;
  margin-right: 8px;
`

export const ModalStyledRow = styled(StyledRow)`
  padding: 12px 8px;
  gap: 8px;
  &:first-child {
    border-top: none;
  }
`

export const ModalStyledCell = styled(StyledCell)`
  max-width: 460px; // 500 - 2 - 16 - 20 and rounded down
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`

export const ModalStyledSpaceCell = styled(ModalStyledCell)`
  max-width: 350px;
`

export const SpaceStyledName = styled(StyledName)`
  overflow: hidden;
  ${Svg} {
    padding-right: 0;
    margin-right: 4px;
  }
`

export const StyledNameIcon = styled.div`
  width: 30px;
  height: 100%;
  display: flex;
  align-items: center;
  margin-right: 4px;
`

export const MyHomeStyledName = styled(StyledName)`
  font-weight: 600;
  ${Svg} {
    padding-right: 0;
  }
`
