import styled from 'styled-components'

export const Title = styled.div`
  font-size: 18px;
`

export const Remove = styled.th`
  padding: 4px 16px;
  button {
    min-height: 23px;
  }
`
export const Status = styled.th`
  padding: 4px 16px;
  width: 90px;
  text-align: left;
  vertical-align: top;
`
export const Name = styled.th`
  padding: 4px 16px;
  text-align: left;
  vertical-align: top;
  min-width: 260px;
`

export const UploadFilesContainer = styled.div`
  background: var(--background); // or just #fff if no theme
  border: none;
  overflow: hidden;
  border-radius: 0;
  padding: 0 8px 8px;
`

export const UploadFilesHeader = styled.div<{ showRemove?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 130px ${props => (props.showRemove ? '48px' : '')};
  gap: 12px;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 14px;
  color: var(--c-text-500);
  padding: 9px 15px;
  border-bottom: 1px solid var(--c-layout-border);
`

export const FileItem = styled.div<{ showRemove?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 120px ${props => (props.showRemove ? '48px' : '')};
  gap: 20px;
  padding: 2px 16px;
  border-bottom: 1px solid var(--c-layout-border-200);
  align-items: center;
  transition: background 0.15s ease;

  &:hover {
    background: var(--c-dropdown-hover-bg);
  }

  &:last-child {
    border-bottom: none;
  }
`

export const FileName = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;

  .file-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    background: var(--primary-100);
    border: 1.5px solid var(--primary-200);
    border-radius: 4px;
  }

  .file-name-text {
    font-weight: 500;
    color: var(--c-text-700);
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

export const StatusWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 32px;
`

export const RemoveButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--c-text-400);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.2s ease,
    transform 0.2s ease,
    color 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--warning-100);
    color: var(--warning-600);
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

export const StatusContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--c-text-600);
  text-transform: capitalize;
`

export const DropZoneWrapper = styled.div`
  transition: all 0.4s ease;
  max-height: 250px;
  opacity: 1;
  transform: translateY(0);

  &.exit {
    max-height: 0;
    opacity: 0;
    transform: translateY(-10px);
    overflow: hidden;
  }
`

export const DropZoneCard = styled.div<{ uploadInProgress?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 24px;
  border: 2px var(--c-layout-border);
  border-radius: 12px;
  background: var(--background);
  cursor: ${({ uploadInProgress }) => (uploadInProgress ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  text-align: center;
  user-select: none;

  input {
    display: none;
  }
`

export const DropZoneContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
`

export const DropZoneTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--c-text-700);
  margin: 0;

  .clickable {
    color: var(--primary-600);
    text-decoration: underline;
    cursor: pointer;

    &:hover {
      color: var(--primary-700);
    }
  }
`

export const DropZoneDescription = styled.p`
  font-size: 14px;
  color: var(--c-text-500);
  margin: 0;
  line-height: 1.5;
`

export const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--primary-100);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
    color: var(--primary-600);
  }
`
