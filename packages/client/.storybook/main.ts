
import type { StorybookConfig } from '@storybook/react-webpack5'
import webpack from 'webpack';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-webpack5-compiler-swc'
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  },
  staticDirs: ['../public'],
  webpackFinal: async (webpackConfig) => {
    webpackConfig.plugins = webpackConfig.plugins || [];
    webpackConfig.plugins.push(
      new webpack.DefinePlugin({
        ENABLE_DEV_MSW: JSON.stringify(Boolean(process.env.ENABLE_DEV_MSW)),
      })
    );

    return webpackConfig;
  }
};

export default config
