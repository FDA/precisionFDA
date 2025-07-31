import styled from 'styled-components'
import { Pill } from '../../features/home/show.styles'

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-bottom: 1px solid var(--c-layout-border);
  &:last-child {
    border-bottom: none;
  }
`
export const SearchContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  height: 500px;
`

export const SearchBar = styled.div`
  position: relative;
  gap: 8px;
  padding: 16px;
  border-bottom: 1px solid var(--c-layout-border);

  .iconwrap {
    z-index: 5;
    position: absolute;
    height: 32px;
    display: flex;
    align-items: center;
    padding-left: 8px;
    color: var(--c-text-400);
      
    &.iconwrap-right {
        right: 24px;
        top: 0;
        bottom: 0;
        margin: auto 0;
        cursor: pointer;
    }
  }

  input {
    padding-left: 32px;
  }
`

export const FilterSidebar = styled.div`
  width: 200px;
  border-right: 1px solid var(--c-layout-border);
  padding: 16px;
`

export const FilterTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--c-text-700);
`

export const FilterOption = styled.label<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  cursor: pointer;
  color: var(--c-text-700);
  font-size: 14px;
  
  input[type="radio"] {
    margin: 0;
  }
  
  ${({ $selected }) => $selected && `
    font-weight: 600;
    color: var(--c-primary-500);
  `}
`

export const SearchResults = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const SearchResultItem = styled.div`
  padding: 12px 8px;
  border-bottom: 1px solid var(--c-layout-border-100);
  background-color: var(--tertiary-70);
  border-radius: 4px;
  cursor: pointer;
  
  &:last-child {
    border-bottom: none;
  }

  a {
    color: var(--c-link);
  }
    
  &:hover span {
    text-decoration: underline;
  }
`

export const ResultTitle = styled.h4`
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--c-text-700);
`

export const ResultDescription = styled.p`
  margin: 0 0 8px 0;
  font-size: 14px;
  color: var(--c-text-500);
  line-height: 1.4;
`

export const ResultLink = styled.span`
  font-size: 12px;
  color: var(--c-link);
  text-decoration: none;
  display: block;
`

export const SectionHeader = styled.h3`
  margin: 24px 0 0px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--c-text-700);
  border-bottom: 2px solid var(--c-primary-500);
  
  &:first-child {
    margin-top: 0;
  }
`

export const ViewMoreButton = styled.button`
  background: none;
  border: none;
  color: var(--c-link);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 16px;
  width: fit-content;
  align-self: center;
  
  &:hover {
    text-decoration: underline;
  }
`

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--c-text-400);
  text-align: center;
  gap: 8px;
`

export const CountPill = styled(Pill)`
    margin-left: auto;
    background-color: var(--tertiary-100);
`
