import styled, { css } from 'styled-components'

export const StyledResourceItem = styled.div<{isDeleting?: boolean}>`
  display: flex;
  align-items: center;
  padding: 4px;
  border-top: 1px solid var(--c-layout-border-200);
  min-height: 40px;
  max-height: 40px;
  cursor: pointer;
  overflow-y: hidden;

  ${({ isDeleting }) => isDeleting && css`
    opacity: 0.3;
  `}
`

export const ItemName = styled.span`
  flex: 1; // Ensure the name takes up remaining space
  margin-left: 16px;
  font-weight: bold;
  font-size: 14px;
`

export const ImageContainer = styled.div`
  width: 100px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  
  img {
    object-fit: cover;
    display: block;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIsMUExMSwxMSwwLDEsMCwyMywxMiwxMSwxMSwwLDAsMCwxMiwxWm0wLDE5YTgsOCwwLDEsMSw4LThBOCw4LDAsMCwxLDEyLDIwWiIgb3BhY2l0eT0iLjI1Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSIyLjUiIHI9IjEuNSI+PGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXBlPSJyb3RhdGUiIGR1cj0iMC43NXMiIHZhbHVlcz0iMCAxMiAxMjszNjAgMTIgMTIiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PC9jaXJjbGU+PC9zdmc+") no-repeat center;
  }
`

export const FileThumbSmall = styled.div`
  display: flex;
  justify-content: end;
  align-items: center;
  gap: 4px;
  
  .upload-error {
    font-size: 11px;
    width: 50px;
    padding: 5px;
    text-align: center;
  }
`

export const FileThumb = styled.div`
  display: grid;
  justify-content: flex-start;
  align-items: center;

  svg {
    grid-area: 1 / 1;
  }
  // it is used, even though IDE says it is not !!!
  .ext {
    grid-area: 1 / 1;
    text-align: center;
  }
  
  .upload-error {
    font-size: 11px;
    width: 50px;
    padding: 5px;
    text-align: center;
  }
`

export const TopRow = styled.div`
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 0 16px;
`

export const TopCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 6px 0;
`

export const SearchBarWrapper = styled.div`
  display: flex;
  justify-content: center;
`

export const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px; // Space between input and button

  & > input {
    max-width: 330px;
    min-width: 120px;
    flex-grow: 1;
  }
`

export const ResourcePageRow = styled.div`
  display: flex;
  flex-grow: 1;
  background-color: var(--background);
`

export const ResourceList = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr; // Two columns for larger screens
  }

  ${StyledResourceItem} {
    padding: 2px 16px;
  }
`

export const StyledResourcePreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding-bottom: 32px;
  flex-grow: 1;
`
export const PreviewTop = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  height: auto;
  font-weight: bolder;
`
export const PreviewBottom = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  justify-content: flex-end;
  justify-self: flex-end;
`
export const StyledPageContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 75vh;
  min-width: 500px;
`
export const StyledSide = styled.div<{ isDeleting?: boolean }>`
  display: flex;
  flex-direction: column;
  height: 75vh;
  border-left: 1px solid var(--c-layout-border);
  min-width: 360px;

  ${({ isDeleting }) => isDeleting && css`
    opacity: 0.3;
  `}
`

export const StyledNothingSelected = styled.div`
  padding: 16px;
  color: var(--tertiary-400);
  display: flex;
  justify-content: center;
`
export const PreviewMain = styled.div`
  padding: 0 16px;
`
export const PreviewMainImg = styled.div`
  min-height: 210px;
  padding: 0 16px;

  img {
    height: 100%;
  }
`

export const CopyUrl = styled.span`
  opacity: 0.7;
  box-sizing: border-box;
  border-style: solid;
  position: relative;
  display: flex;
  gap: 3px;
  width: 100%;
  cursor: pointer;
  align-items: center;
  overflow: hidden;
  white-space: normal;
  word-break: break-all;
  border-radius: 6px;
  border-width: 1px;
  border-color: rgb(225 221 236 / 1);
  background-color: rgb(246 246 249 / 1);
  padding-left: 12px;
  padding-right: 12px;
  padding-top: 8px;
  padding-bottom: 8px;
  font-size: 14px;
  line-height: 20px;
  color: rgb(86 81 101 / 1);
  box-shadow:
    0 0 #0000,
    0 0 #0000,
    inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
  transition-property: all;
  transition-duration: 0.15s;
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);

  svg {
    flex-shrink: 0;
    width: 16px;
    color: var(--primary-500);
  }

  &:hover {
    opacity: 1;
  }
`
