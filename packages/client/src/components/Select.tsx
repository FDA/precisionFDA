import ReactSelect from 'react-select'
import styled from 'styled-components'
import { compactScrollBarV2 } from './Page/styles'

export const Select = styled(ReactSelect).attrs({
  isMenuOpen: true,
  classNames: {
    indicatorsContainer: () => 'pf-select-indicatorsContainer',
    valueContainer: () => 'pf-select-valueContainer',
    singleValue: () => 'pf-select-single',
    control: ({ isDisabled }) => (isDisabled ? 'pf-select-control disabled' : 'pf-select-control'),
    menu: () => 'pf-select-menu',
    option: ({ isSelected }) => (isSelected ? 'pf-select-option selected' : 'pf-select-option'),
    menuList: () => 'pf-select-listbox',
    multiValue: () => 'pf-select-multi-value',
    multiValueLabel: () => 'pf-select-multi-value-label',
    input: () => 'pf-select-input',
  },
})`
  --height: var(--slect-height, 32px);
  min-height: var(--height);
  min-width: 200px;
  .pf-select-single {
    font-weight: 500;
    color: var(--c-text-600);
  }
  .pf-select-valueContainer {
    font-size: 14px;
    height: var(--height);
    padding-top: 0;
  }
  .pf-select-indicatorsContainer {
    height: var(--height);
  }
  .pf-select-listbox {
    font-size: 14px;
    ${compactScrollBarV2}
  }
  .pf-select-control {
    min-height: var(--height);
    height: var(--height);
    background: var(--background);
    border-color: var(--c-input-border);

    &.disabled {
      background: var(--tertiary-100);
    }
  }
  .pf-select-menu {
    background: var(--c-dropdown-bg);
    box-sizing: content-box;
    border: 1px solid var(--c-layout-border-200);
  }
  .pf-select-option {
    height: var(--height);
    font-weight: 500;
    font-size: 14px;
    background: var(--c-dropdown-bg);
    &:hover {
      background: var(--c-dropdown-hover-bg);
    }
  }
  [class*="-indicatorSeparator"] {
    background-color: var(--c-layout-border);
  }
  [class*="-indicatorContainer"] {
    color: var(--c-layout-border);
  }
  [class*="-Svg"] {
    height: 16px;
  }
  .pf-select-multi-value {
    background: var(--c-dropdown-bg);
    border: 1px solid var(--c-layout-border-200);
    border-radius: 4px;
    font-size: 14px;
  }
  .pf-select-multi-value-label {
    color: var(--base);
  }
  .selected {
    background: var(--primary-600);
    &:hover {
      background: var(--primary-500);
    }
  }
`
