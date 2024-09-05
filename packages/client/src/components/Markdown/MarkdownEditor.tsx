/* eslint-disable react/jsx-no-useless-fragment */
import React from 'react'
import styled from 'styled-components'
import { ControllerRenderProps } from 'react-hook-form'
import { Markdown } from '.'

import { ITab, TabsSwitch } from '../TabsSwitch'
import { StyledMarkdown } from '../../features/discussions/styles'
import { MarkdownIcon } from '../icons/MarkdownIcon'
import ExternalLink from '../Controls/ExternalLink'

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
`

export const StyedEditor = styled.div`
  padding: 8px;

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
  field: ControllerRenderProps
}) => {
  return (
    <TabsSwitch
      transparent
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
                <StyledMarkdownHelper><ExternalLink to="https://www.markdownguide.org/basic-syntax/"><WeMarkdown><MarkdownIcon height={17} />Markdown Support</WeMarkdown></ExternalLink></StyledMarkdownHelper>
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
