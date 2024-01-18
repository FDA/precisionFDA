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
  },
})`
  --height: 32px;

  .pf-select-single {
    font-weight: 500;
    color: var(--c-text-600);
  }
  .pf-select-valueContainer {
    height: var(--height);
    padding-top: 0;
  }
  .pf-select-indicatorsContainer {
    height: var(--height);
  }
  .pf-select-listbox {
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
    background: var(--c-dropdown-bg);
    &:hover {
      background: var(--c-dropdown-hover-bg);
    }
  }
  .selected {
    background: var(--primary-600);
    &:hover {
      background: var(--primary-500);
    }
  }
`
