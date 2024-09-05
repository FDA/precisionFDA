import styled, { css } from 'styled-components'

export const PfTabTitle = styled.div`
  font-size: 18px;
  font-weight: bold;
`

export const PfTabContent = styled.div<{ $isShown?: boolean }>`
  display: none;
  margin-bottom: 32px;
  padding: 16px;
  line-height: 24px;

  ${({ $isShown }) =>
    $isShown &&
    css`
      box-sizing: border-box;
      display: inline-block;
      border: 1px solid var(--c-layout-border);
      border-top: 0;
      width: 100%;
      padding-top: 16px;
    `}

  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid var(--c-layout-border-200);
  }
`

export const PfTab = styled.div<{ $isActive?: boolean }>`
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  position: relative;
  top: 1px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  color: inherit;
  background-color: var(--tertiary-70);
  border: 1px solid var(--c-layout-border);

  ${({ $isActive }) =>
    $isActive
      ? css`
          background-color: var(--background);
          border-bottom: 1px solid transparent;
        `
      : css`
          border-bottom: 1px solid var(--c-layout-border);
          &:hover {
            color: inherit;
          }
        `}
`

export const PfTabRow = styled.div`
  margin-top: 32px;
  display: flex;
  flex-direction: column;

  @media (min-width: 1000px) {
    flex-direction: row;
    gap: 8px;
    border-bottom: 1px solid var(--c-layout-border);
  }
`
