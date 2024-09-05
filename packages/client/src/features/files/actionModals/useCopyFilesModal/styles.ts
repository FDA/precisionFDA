import styled from 'styled-components'
import { StyledBreadcrumbs } from '../../../../components/Breadcrumb'
import { Button } from '../../../../components/Button'
import { compactScrollBarV2 } from '../../../../components/Page/styles'
import { StyledName } from '../../../../components/ResourceTable'
import { Svg } from '../../../../components/icons/Svg'
import { SelectableTable, StyledCell, StyledFileDetail, StyledRow } from '../../../actionModals/styles'
import { Help } from '../../../apps/form/styles'
import { ModalPageRow } from '../../../modal/styles'

export const ShorternName = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const ShorternFolderName = styled(ShorternName)`
  width: calc(100% - 30px);
`

export const CopyHelp = styled(Help)`
  width: calc(100% - 24px);
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 12px;
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

export const CopyModalPageCol = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-self: stretch;
  min-width: 350px;
  width: 40vw;

  border-right: 1px solid var(--c-layout-border-200);
  &:last-child {
    border: 0;
  }
`

export const Sticky = styled.div`
  position: sticky;
  top: 0;
  background-color: var(--background);
`

export const CopyModalScrollPlace = styled.div`
  ${compactScrollBarV2}
  overflow-y: auto;
  max-height: 60vh;
`
export const StyledStickyTop = styled.div`
  width: calc(100% - 1px);
  position: sticky;
  top: 0;
  background-color: var(--background);
  padding: 12px;
  padding-bottom: 8px;
`

export const SelectedList = styled.ul`
  list-style-type: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 0 12px;
  box-sizing: border-box;
  padding-bottom: 16px;
`

export const FileListItem = styled.li<{ $isCopied?: boolean }>`
  padding: 12px;
  border-radius: 4px;
  border: 1px solid var(--c-layout-border-200);
  background-color: ${({ $isCopied }) => ($isCopied ? 'var(--highlight-100)' : 'transparent')};
`

export const NodeHeading = styled.a`
  display: flex;
  align-items: center;
  span {
    margin-left: 8px;
  }
`

export const SpaceAndFolderTable = styled(SelectableTable)`
  width: calc(100% - 1px);
`

export const FolderHeading = styled(NodeHeading)`
  padding: 12px;
  border-bottom: 1px solid var(--c-layout-border-200);
`

export const FolderItem = styled(FileListItem)<{ $isCopied?: boolean }>`
  border: 1px solid var(--c-layout-border-200);
  padding: 0;
  background-color: ${({ $isCopied }) => ($isCopied ? 'var(--highlight-100)' : 'transparent')};
`

export const FolderChildrenList = styled.ul`
  padding-left: 24px;
  list-style-type: none;
`

export const FolderChildrenListItem = styled.li<{ $isCopied?: boolean }>`
  border-bottom: 1px solid var(--c-layout-border-200);
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
  height: fit-content;
  display: flex;
  align-items: center;
  margin-top: 4px;
`

export const StyledBreadcrumb = styled.div`
  display: inline-flex;
  height: 20px;
`

export const StyledBreadcrumbButton = styled(Button)`
  padding: 0;
`

export const ModalSearchBarWrapper = styled.div`
  justify-content: flex-end;
  display: flex;
`

export const ModalStyledRow = styled(StyledRow)`
  padding: 12px 8px;
  gap: 8px;
  width: 100%;
  &:first-child {
    border-top: none;
  }
`

export const ModalStyledCell = styled(StyledCell)`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`

export const SpaceStyledName = styled(StyledName)`
  overflow: hidden;
  align-items: center;
  gap: 4px;
  ${Svg} {
    padding-right: 0;
  }
`

export const StyledNameIcon = styled.div`
  width: 30px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 4px;
`

export const MyHomeStyledName = styled(StyledName)`
  font-weight: 600;
  ${Svg} {
    padding-right: 0;
  }
`
