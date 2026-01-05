import styled, { css } from 'styled-components'
import { Footer } from '../../modal/styles'

export const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  padding: var(--modal-padding-TB) var(--modal-padding-LR);
  gap: 1rem;
`

export const StyledFooter = styled(Footer)`
  padding: var(--modal-padding-TB) var(--modal-padding-LR);
  justify-content: space-between;
`

export const StatusPill = styled.div<{ $active: boolean }>`
  width: fit-content;
  border-radius: 7px;
  background-color: ${props => (props.$active ? 'var(--success-500)' : 'var(--warning-500)')};
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 2px 6px;
  display: inline-block;
`

export const MemberTable = styled.div`
  width: 100%;
  border: none;
  border-radius: 0px;
`

export const MemberItemsWrapper = styled.div`
  overflow-y: auto;
  max-height: 300px;
  scrollbar-width: thin;
  scrollbar-gutter: stable;
  scrollbar-color: var(--c-scrollbar) transparent;
`

export const MemberItem = styled.div<{ $isDisabled?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr 100px 1fr;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  padding: 9px 15px;
  border-bottom: 1px solid var(--c-layout-border-200);
  ${({ $isDisabled }) =>
    $isDisabled &&
    css`
      pointer-events: none;
      opacity: 0.6;
    `}
`

export const MemberItemHeader = styled(MemberItem)`
  font-weight: 600;
  color: var(--c-text-500);
  border-bottom: 1px solid var(--c-layout-border);
`
