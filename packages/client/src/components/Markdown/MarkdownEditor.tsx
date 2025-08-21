import React from 'react'
import type { ControllerRenderProps } from 'react-hook-form'
import styled from 'styled-components'
import { Markdown } from '.'

import { type ITab, TabsSwitch } from '../TabsSwitch'
import { StyledMarkdown } from '../../styles/commonStyles'

export const Help = styled.div`
  padding: 6px;
  padding-right: 12px;
  background-color: var(--tertiary-100);
  border-left: 5px solid var(--c-layout-border);
  color: var(--c-text-400);
  text-align: left;
  font-size: 13px;
  width: fit-content;
`

export const WeMarkdown = styled.div`
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--c-text-500);
  opacity: 0.6;
  transition: opacity 0.08s linear 0.08s;

  svg {
    color: var(--primary-600);
  }
  &:hover {
      opacity: 1;
  }
`
export const StyledMarkdownHelper = styled.div`
  width: fit-content;
  padding: 8px 0;
  justify-self: flex-start;
`

export const StyedEditor = styled.div`
  padding: 8px 8px;

  --spacing: 8px;
  textarea {
    min-width: calc(100% - var(--spacing) * 2);
    max-width: calc(100% - var(--spacing) * 2);
    padding: var(--spacing);
    min-height: 70px;
    border-radius: 5px;
    border: 1px solid var(--tertiary-250);
    background: var(--c-textarea-bg);
    height: 20vh;

    &:focus {
      border-color: var(--primary-600);
      border-right-width: 1px !important;
      outline: 0;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }
`
const StyledPreview = styled(StyledMarkdown)`
  padding: 8px 16px;
  min-height: 74px;
`

export const MarkdownEditor = ({
  disabled,
  field,
}: {
  disabled: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: ControllerRenderProps<any>
}) => {
  return (
    <TabsSwitch
      tabsConfig={
        [
          {
            header: 'Edit',
            tab: (
              <StyedEditor>
                <textarea
                  placeholder="Leave a comment"
                  disabled={disabled}
                  {...field}
                />
              </StyedEditor>
            ),
            hide: false,
          },
          {
            header: 'Preview',
            tab: (
              <StyledPreview>
                <Markdown data={field.value ?? ''} docRef={null} />
              </StyledPreview>
            ),
            hide: false,
          },
        ] satisfies ITab[]
      }
    />
  )
}
