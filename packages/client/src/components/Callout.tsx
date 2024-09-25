import styled from 'styled-components'

type CalloutType = 'primary' | 'warning' | 'info'

export const Callout = styled.div<{ 'data-variant': CalloutType }>`
  text-align: left;
  font-size: 13px;
  line-height: 24px;
  width: fit-content;
  padding: 6px;
  padding-right: 12px;
  border-left: 4px solid var(--tertiary-200);

  &[data-variant='primary'] {
    background-color: var(--primary-50);
    border-left-color: var(--primary-600);
    color: var(--primary-800);
  }

  &[data-variant='info'] {
    background-color: var(--highlight-100);
    border-left-color: var(--highlight-400);
    color: var(--highlight-800);
  }
  &[data-variant='warning'] {
    background-color: var(--warning-100);
    border-left-color: var(--warning-600);
    color: var(--warning-800);
  }
`
