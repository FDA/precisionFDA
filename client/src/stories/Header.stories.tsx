import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Header } from '../components/Header';
import { Router } from 'react-router';
import history from '../utils/history';
import { LoaderWrapper } from '../views/components/LoaderWrapper/LoaderWrapper';
import GlobalStyle from '../styles/global';

export default {
  title: 'Components/Header',
  component: Header,
} as ComponentMeta<typeof Header>;

const Template: ComponentStory<typeof Header> = (args) => <Router history={history}><><GlobalStyle /><LoaderWrapper><Header {...args} /></LoaderWrapper></></Router>;

export const LoggedIn = Template.bind({});
LoggedIn.args = {};
