
const values = {
  paddingMainContentHorizontal: 32,
  paddingMainContentVertical: 32,
  contentMargin: 12,
  largeColumnWidth: 288,
  smallColumnWidth: 128,
  smallerColumnWidth: 96,
  thumbnailWidth: 288,
  thumbnailHeight: 148,
  navigationBarHeight: 64,
}

const colors = {
  primaryBlue: '#1F70B5',
  primaryGreen: '#3c763d',
  primaryRed: '#eb776f',
  primaryYellow: '#f0ad4e',
  highlightBlue: '#3a80ba',
  highlightYellow: '#edad58',
  highlightGreen: '#44b150',
  subtleBlue: '#f4f8fd',
  lightRed: '#e3405b',
  lightGreen: '#52c41a',
  lightBlue: '#a0c2e0',
  lightYellow: '#efe5d7',
  darkRed: '#c41331',
  darkBlue: '#343E4D',
  darkGreen: '#1d764c',
  darkYellow: '#ec971f',
  textBlack: '#000',
  textDarkGrey: '#272727',
  textMediumGrey: '#646464',
  textWhite: '#fff',
  backgroundLightGray: 'rgb(242, 242, 242)',
  borderDefault: '#ddd',
  stateRunningBackground: '#f0f9fd',
  stateRunningColor: '#2071b5',
  stateFailedBackground: '#ffeeed',
  stateFailedColor: '#821a1d',
  stateDoneBackground: '#dff0d8',
  stateDoneColor: 'darken(#3c763d, 5%)',
}

const fontSize = {
  pageTitle: '32px',
  h1: '20px',
  h2: '18px',
  body: '14px',
  subheading: '14px',
}

export const fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  bold: 600,
  black: 700,
}

const padding = {
  mainContentHorizontal: `${values.paddingMainContentHorizontal}px`,
  mainContentVertical: `${values.paddingMainContentVertical}px`,
  contentMarginLarge: `${values.contentMargin*2}px`,
  contentMargin: `${values.contentMargin}px`,
  contentMarginHalf: `${values.contentMargin/2}px`,
  contentMarginThird: `${values.contentMargin/3}px`,
}

const sizing = {
  mainContainerMaxWidth: '1330px',
  navigationBarHeight: `${values.navigationBarHeight}px`,
  navigationBarHeightNarrow: '48px',
  largeColumnWidth: `${values.largeColumnWidth}px`,
  smallColumnWidth: `${values.smallColumnWidth}px`,
  smallerColumnWidth: `${values.smallerColumnWidth}px`,
  mainColumnMaxImageSize: '820px',
  thumbnailWidth: `${values.thumbnailWidth}px`,
  thumbnailHeight: `${values.thumbnailHeight}px`,
  thumbnailWidthSmall: '172px',
  thumbnailHeightSmall: '90px',
  iconSmall: '56px',
  highlightBarWidth: '4px',
}

export const theme = {
  fontFamily: 'Lato, Helvetica, sans-serif',

  primaryLite: '#7891b7',
  primaryShade: '#185589',
  white: '#F4F8FD',
  lightLightYellow: '#efe5d7',

  colors: colors,
  fontSize: fontSize,
  fontWeight: fontWeight,
  padding: padding,
  sizing: sizing,
  values: values,
}
