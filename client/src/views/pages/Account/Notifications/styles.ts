import styled from "styled-components";
import { commonStyles } from "../../../../styles/commonStyles";
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
  ${commonStyles.sectionHeading};
  font-size: 16px;
  text-transform: uppercase;
`

export const StyledSelectWrap = styled.div`
  width: 400px;
  margin-bottom: 20px;
`
