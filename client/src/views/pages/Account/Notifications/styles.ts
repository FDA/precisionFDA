import styled from "styled-components";
import { theme } from "../../../../styles/theme";

export const StyledNotifications = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`

export const FieldGroup = styled.fieldset`
  display: flex;
  border: none;
  padding: none;

  label {
    margin-left: 5px;
  }
`

export const SectionTitle = styled.h2`
  color: ${theme.black};
`

export const StyledSelectWrap = styled.div`
  width: 400px;
  margin-bottom: 20px;
`
