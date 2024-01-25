import React, { useState } from 'react'
import styled, { css } from 'styled-components'
import { Button } from '../../../components/Button'
import { Markdown } from '../../../components/Markdown'
import { FormFields, Help } from './styles'
import ExternalLink from '../../../components/Controls/ExternalLink'
import MonacoEditor from '../../../components/MonacoEditor/MonacoEditor'

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;

  button {
    &:first-of-type {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    &:not(:first-of-type) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    &:not(:first-of-type):not(:last-of-type) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
`

const TopReadme = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const View = styled.div<{ $shouldDisplay: boolean }>`
  display: none;
  ${({ $shouldDisplay }) =>
    $shouldDisplay &&
    css`
      display: initial;
    `}
`

type Selection = 'edit' | 'preview'

export const ReadMeInput = ({
  onChange,
  value,
}: {
  onChange: (val?: string) => void
  value: string
}) => {
  const [selected, setSelected] = useState<Selection>('edit')
  const handleClick = (val: Selection) => {
    setSelected(val)
  }

  return (
    <FormFields>
      <TopReadme>
        <Help>
          <span>Need help?</span>
          <ExternalLink to="https://jonschlinkert.github.io/remarkable/demo/"> Learn how to format Markdown</ExternalLink>
        </Help>
        <ButtonRow>
          <Button type="button" onClick={() => handleClick('edit')}>
            Edit
          </Button>
          <Button type="button" onClick={() => handleClick('preview')}>
            Preview
          </Button>
        </ButtonRow>
      </TopReadme>

      <View $shouldDisplay={selected === 'edit'}>
        <MonacoEditor
          height="40vh"
          onChange={val => onChange(val)}
          defaultLanguage="markdown"
          defaultValue={value}
        />
      </View>

      <View $shouldDisplay={selected === 'preview'}>
        <Markdown data={value} />
      </View>
    </FormFields>
  )
}
