import styled from 'styled-components'
import { Markdown } from '../../../../components/Markdown'

export const NotesMarkdown = styled(Markdown)`
  padding: 0;
`

export const SearchInput = styled.div`
  padding: 16px 0;
  padding-right: 16px;
`

export const LeftBar = styled.div`
  width: 300px;
  overflow-y: auto;
  padding: 16px;
  padding-right: 0;
`

export const NoteContainer = styled.div`
  padding: 6px 12px;
  width: 700px;
  overflow-y: auto;
  border-left: 1px solid #ddd;

  ._title {
    font-size: 30px;
    margin: 15px 0;
    padding-bottom: 15px;
    border-bottom: 1px solid #e5e5e5;
  }
  ._no-content {
    color: #777777;
  }
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    border-bottom: 1px solid #ddd;

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
