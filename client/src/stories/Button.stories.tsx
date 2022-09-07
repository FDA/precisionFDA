import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

// import { Button } from './Button';
import { Button, ButtonSolidBlue, ButtonSolidGreen, ButtonSolidRed } from '../components/Button';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Components/Button',
  component: Button,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof Button>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const ButtonSolidBlueTemplate: ComponentStory<typeof Button> = (args) => <ButtonSolidBlue {...args}>Submit</ButtonSolidBlue>;
const ButtonSolidRedTemplate: ComponentStory<typeof Button> = (args) => <ButtonSolidRed {...args}>Stop</ButtonSolidRed>;
const ButtonSolidGreenTemplate: ComponentStory<typeof Button> = (args) => <ButtonSolidGreen {...args}>All Good</ButtonSolidGreen>;

export const Blue = ButtonSolidBlueTemplate.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Blue.args = {
  disabled: false,
};

export const Red = ButtonSolidRedTemplate.bind({});
Red.args = {
  disabled: false,
};

export const Green = ButtonSolidGreenTemplate.bind({});
Green.args = {
  disabled: false,
};
