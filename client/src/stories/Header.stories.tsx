import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Header } from '../components/Header';
import { Router } from 'react-router';
import history from '../utils/history';
import { Provider } from 'react-redux';
import store from '../store';
import { LoaderWrapper } from '../views/components/LoaderWrapper/LoaderWrapper';
import GlobalStyle from '../styles/global';

export default {
  title: 'Components/Header',
  component: Header,
} as ComponentMeta<typeof Header>;

const Template: ComponentStory<typeof Header> = (args) => <Provider store={store}><Router history={history}><><GlobalStyle /><LoaderWrapper><Header {...args} /></LoaderWrapper></></Router></Provider>;

export const LoggedIn = Template.bind({});
LoggedIn.args = {};
