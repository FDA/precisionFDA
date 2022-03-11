import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Button, ButtonSolidBlue } from '../Button'
import { inputFocus, InputSelect } from '../form/styles'

export const StyledInputJumpTo = styled.input`
  display: inline-block;
  width: 60px;
  margin-right: 5px;
  padding-left: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  transition: all 0.3s;
  ${inputFocus}
`

export const JumpToForm = styled.form`
  display: flex;
`

export const StyledPageOf = styled.div`
  display: inline-block;
  margin-right: 5px;
  white-space: pre;
`

export const StyledPagination = styled.div`
  margin-top: 32px;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: 20px;

  ${Button} {
    margin-right: 5px;
  }
`

export const PerPage = styled.div`
  display: flex;
  align-items: center;
  margin-right: 5px;
  white-space: pre;
`
export const StyledPerPageSelect = styled(InputSelect)`
  margin-right: 5px;
  height: 34px;
`

export function hidePagination(
  isFetched?: boolean,
  length?: number,
  totalPages?: number,
) {
  return length === 0 || (isFetched === false && totalPages === 0)
}

export const Pagination = ({
  page,
  setPage,
  totalCount,
  perPage,
  totalPages = Math.ceil(totalCount / perPage),
  isPreviousData,
  isNextData,
  hide,
  onPerPageSelect,
}: {
  page?: number
  setPage: (n: number) => void
  onPerPageSelect: (n: number) => void
  totalCount: number
  totalPages?: number
  perPage: number
  isPreviousData: boolean
  isNextData: boolean
  hide: boolean
}) => {
  if (hide) return null
  const [localTotal, setLocalTotal] = useState<number>(totalPages || 0)
  const [localPage, setLocalPage] = useState<number>(page || 0)

  useEffect(() => {
    if (totalPages) {
      setLocalTotal(totalPages)
    }
  }, [totalPages])

  useEffect(() => {
    if (page) {
      setLocalPage(page)
    }
  }, [page])

  const handleJumpToSubmit = (e: any) => {
    e.preventDefault()
    const value = parseInt(e.target[0].value)
    if (value > localTotal || value <= 0) {
      setPage(1)
    } else {
      setPage(value)
    }
  }

  const handleSetPage = (pa: number) => {
    setLocalPage(pa)
    setPage(pa)
  }

  return (
    <>
      <StyledPagination>
        <PerPage>
          <StyledPerPageSelect
            value={perPage}
            name="perPage"
            onChange={e => onPerPageSelect(parseInt(e.target.value))}
            data-testid="pagination-perpage-select"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </StyledPerPageSelect>
          Per Page
        </PerPage>
        <ButtonSolidBlue
          data-testid="pagination-previous-page-button"
          type="button"
          onClick={() => handleSetPage(Math.max(localPage - 1, 1))}
          disabled={localPage === 1}
        >
          Previous Page
        </ButtonSolidBlue>{' '}
        <ButtonSolidBlue
          data-testid="pagination-next-page-button"
          type="button"
          onClick={() => handleSetPage(localPage + 1)}
          disabled={localPage === localTotal}
        >
          Next Page
        </ButtonSolidBlue>
        <StyledPageOf data-testid="pagination-page-of">
          Page {localPage || '...'} of {localTotal || '...'}
        </StyledPageOf>
        <JumpToForm onSubmit={handleJumpToSubmit}>
          <StyledInputJumpTo
            data-testid="pagination-jumpto-input"
            defaultValue={1}
            type="number"
            id="page-jumpto"
            name="jumpto"
            max={localTotal}
            min={1}
          />
          <ButtonSolidBlue
            data-testid="pagination-submit-jumpto-button"
            type="submit"
          >
            Jump
          </ButtonSolidBlue>
        </JumpToForm>
      </StyledPagination>
    </>
  )
}
