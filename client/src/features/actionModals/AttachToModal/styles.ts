import styled from 'styled-components'
import { Svg } from '../../../components/icons/Svg'
import { Markdown } from '../../../components/Markdown'
import { colors } from '../../../styles/theme'

export const NotesMarkdown = styled(Markdown)`
  padding: 0;
`

export const SearchInput = styled.div`
  padding: 16px 8px;
  border-bottom: 1px solid var(--c-layout-border);
  display: flex;
  align-items: center;

  ${Svg} {
    padding-left: 8px;
    color: var(--tertiary-300);
  }
`

export const LeftBar = styled.div`
  min-width: 350px;
  max-width: 350px;
  overflow-y: auto;
  padding-right: 0;
`

export const NoteContainer = styled.div`
  padding-left: 12px;
  margin-right: 6px;
  min-width: 500px;
  overflow-y: auto;
  border-left: 1px solid var(--c-layout-border);

  ._title {
    font-size: 30px;
    margin: 15px 0;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--c-layout-border);
  }
  ._no-content {
    color: var(--c-text-400);
  }
`

export const ModalLoader = styled.div`
  padding: 32px;
`

export const StyledAttachToModal = styled.div`
  overflow: hidden;
  display: flex;

  .__items-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .__menu-item {
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    border-top: 1px solid var(--c-layout-border);

    &:hover &_chevron {
      color: #8198BC;
    }
    &--selected {
      background-color: #E3F3FC;

      &:hover {
        i {
          color: #b3c1d7;
        }
      }
    }
    input {
      margin: 0;
    }
    .__menu-item_clear {
    }
    ._no-content {
      color: #777777;
    }
    &_class-label {
      padding: 0 10px;
      color: #63A5DE;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 75%;
    }
    &_label-wrapper {
      display: flex;
      align-items: center;
      font-weight: 400;
      margin: 0;
      cursor: pointer;
    }
    &_chevron {
      padding-left: 10px;
      cursor: pointer;
      color: #b3c1d7;
    }
    &_clear {
      cursor: pointer;
      color: #63A5DE;
    }
    &_search-icons {
      i {
        color: #63A5DE;
        padding: 5px;
      }
      .fa-times {
        cursor: pointer;
      }
    }
  }

`
