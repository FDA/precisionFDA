import React from 'react'
import { StoryFn, Meta } from '@storybook/react'
import { Button } from '.'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Components/Button',
  component: Button,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as Meta<typeof Button>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const ButtonSolidBlueTemplate: StoryFn<typeof Button> = args => (
  <Button data-variant="primary" {...args}>Submit</Button>
)
const ButtonSolidRedTemplate: StoryFn<typeof Button> = args => (
  <Button data-variant="warning" {...args}>Stop</Button>
)
const ButtonTextTemplate: StoryFn<typeof Button> = args => (
  <Button {...args}>Add a property</Button>
)

export const Blue = ButtonSolidBlueTemplate.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Blue.args = {
  disabled: false,
}

export const Red = ButtonSolidRedTemplate.bind({})
Red.args = {
  disabled: false,
}

export const Text = ButtonTextTemplate.bind({})
Text.args = {
  disabled: false,
}
