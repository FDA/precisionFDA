import React, { useEffect, useState } from 'react'
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './NumberPagination.module.css'

interface NumberPaginationProps {
  page: number
  totalPages: number
  totalCount: number
  perPage: number
  setPage: (page: number) => void
  isHidden?: boolean
}

export const NumberPagination: React.FC<NumberPaginationProps> = ({
  page,
  totalPages,
  totalCount,
  perPage,
  setPage,
  isHidden = false,
}) => {
  const [inputValue, setInputValue] = useState(String(page))

  useEffect(() => {
    setInputValue(String(page))
  }, [page])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const commitPage = () => {
    const parsed = parseInt(inputValue, 10)
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      setPage(parsed)
    } else {
      setInputValue(String(page))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitPage()
    }
  }

  if (isHidden || totalCount === 0) {
    return null
  }

  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, totalCount)

  return (
    <div className={styles.wrapper}>
      <span className={styles.listSize}>
        {from}–{to} of {totalCount}
      </span>

      <div className={styles.controls}>
        <button className={styles.arrowButton} disabled={page <= 1} onClick={() => setPage(1)} aria-label="First page">
          <ChevronFirst size={16} />
        </button>
        <button
          className={styles.arrowButton}
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        <span className={styles.pageIndicator}>
          <input
            className={styles.pageInput}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={commitPage}
            onKeyDown={handleKeyDown}
            aria-label="Current page"
          />
          <span>of {totalPages}</span>
        </span>

        <button
          className={styles.arrowButton}
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
        <button
          className={styles.arrowButton}
          disabled={page >= totalPages}
          onClick={() => setPage(totalPages)}
          aria-label="Last page"
        >
          <ChevronLast size={16} />
        </button>
      </div>
    </div>
  )
}
