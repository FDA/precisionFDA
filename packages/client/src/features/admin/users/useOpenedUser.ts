import { useEffect, useState } from 'react'

export const useOpenedUser = <T extends { id: number }>(rows: T[], isLoading: boolean) => {
  const [openedUserId, setOpenedUserId] = useState<number | null>(null)

  useEffect(() => {
    if (openedUserId == null) return
    if (isLoading) return
    if (rows.some(row => row.id === openedUserId)) return
    setOpenedUserId(null)
  }, [rows, isLoading, openedUserId])

  return {
    openedUserId,
    openUser: (id: number) => setOpenedUserId(id),
    closeUser: () => setOpenedUserId(null),
  }
}
