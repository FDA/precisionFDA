import styled from 'styled-components';
import { ToastContainer } from 'react-toastify';
import { colors, sizing } from './theme';

export const StyledToastContainer = styled(ToastContainer)`
  // https://styled-components.com/docs/faqs#how-can-i-override-styles-with-higher-specificity
  &&&.Toastify__toast-container {
  }

  .Toastify__toast-body {
    padding: 0px;
    width: 100%;
    font-weight: 400;
    margin: auto 12px !important;
    min-width: 400px !important;
  }

  .Toastify__toast--error {
    border: 2px solid ${colors.primaryRed} !important;
    border-radius: ${sizing.modalBorderRadius} !important;
  }

  .Toastify__toast--success {
    border: 2px solid ${colors.highlightGreen} !important;
    border-radius: ${sizing.modalBorderRadius} !important;
  }

  .Toastify__toast--warning {
    border: 2px solid ${colors.primaryYellow}  !important;
    border-radius: ${sizing.modalBorderRadius} !important;
  }
`
