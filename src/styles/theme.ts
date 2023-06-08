
export const values = {
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

export const colors = {
  primaryBlue: '#1F70B5',
  primaryGreen: '#3c763d',
  primaryRed: '#eb776f',
  primaryYellow: '#f0ad4e',
  highlightBlue: '#3a80ba',
  blueOnWhite: '#3776a9',
  highlightYellow: '#edad58',
  highlightGreen: '#44b150',
  subtleBlue: '#f4f8fd',
  lightRed: '#e3405b',
  lightGreen: '#52c41a',
  lightBlue: '#a0c2e0',
  inactiveBlue: '#8c9ba8',
  lightYellow: '#efe5d7',
  mediumDarkBlue: '#2f5373',
  darkRed: '#CA2323',
  hoverDarkRed: '#8c0808',
  darkBlue: '#343E4D',
  darkGreen: '#1d764c',
  darkYellow: '#ec971f',
  textBlack: '#000',
  textDarkGrey: '#3C4043',
  textDarkGreyInactive: '#838789',
  textMediumGrey: '#667070',
  colorDateGrey: '#919191',
  stateLabelGrey: '#919191',
  textLightGrey: '#ddd',
  textWhite: '#fff',
  white110: '#f5f5f5',
  inactiveTab: '#eef1f2',
  backgroundLightGray: 'rgb(242, 242, 242)',
  shadedBg: '#e7eaec',
  borderDefault: '#C8C8C8',
  // Used for jobs or executions
  stateRunningBackground: '#f0f9fd',
  stateRunningColor: '#2071b5',
  stateFailedBackground: '#ffeeed',
  stateFailedColor: '#821a1d',
  stateDoneBackground: '#dff0d8',
  stateDoneColor: 'darken(#3c763d, 5%)',
  blacktextOnWhite: '#333333', 
  darkblueOnLightBlue: '#1f5cb7',
  stageBlue: '#d9edf7',
  brownOnWhite: '#aa6708',
  borderBrownOnWhite: '#af6a08',
  disabledBlackTextOnGrey: '#130101', 
  darkGreyOnGrey: '#7891b7',
  buttonGreenOnWhite: '#30825b',
  greyTextonBlack: '#919191',
  greyTextOnWhite: '#707070',
  brownOnGrey: '#b3453d', 
  blueOnBlack: '#368ad3',
  greyOnLightBlue: '#6d6d6d',
  orange: '#EB776F',
}

export const fontSize = {
  pageTitle: '32px',
  bannerTitle: '28px',
  h1: '20px',
  h2: '18px',
  body: '14px',
  subheading: '14px',
}

export const breakPoints = {
  xsmall: 320,
  small: 481,
  medium: 769,
  large: 1025,
  xlarge: 1201,
}

export const fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  bold: 600,
  black: 700,
}

export const padding = {
  mainContentHorizontal: `${values.paddingMainContentHorizontal}px`,
  mainContentHorizontalHalf: `${values.paddingMainContentHorizontal/2}px`,
  mainContentVertical: `${values.paddingMainContentVertical}px`,
  // TODO: Rename contentMargin to something like controlSpacing to be more accurate
  //       In fact mainContentHorizontal above can be named contentMargin instead
  contentMarginLarge: `${values.contentMargin*2}px`,
  contentMargin: `${values.contentMargin}px`,
  contentMarginHalf: `${values.contentMargin/2}px`,
  contentMarginThird: `${values.contentMargin/3}px`,
}

export const sizing = {
  mainContainerMaxWidth: '1330px',
  navigationBarHeight: `${values.navigationBarHeight}px`,
  navigationBarHeightNarrow: '50px',
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
  modalBorderRadius: '8px',
}

export const theme = {
  fontFamily: 'Lato, Helvetica, sans-serif',
  monofontFamily: 'Monaco, Courier',
  colors,
  fontSize,
  fontWeight,
  padding,
  sizing,
  values,
  breakPoints,
}
