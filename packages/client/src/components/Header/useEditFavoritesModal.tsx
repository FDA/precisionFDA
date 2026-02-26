import React from 'react'
import { ModalNext } from '@/features/modal/ModalNext'
import { useModal } from '@/features/modal/useModal'
import styles from './EditFavoritesModal.module.css'
import { FavoriteMenuItemsScreen } from './FavoriteMenuItemsScreen'

const EditFavoritesModal = ({ handleClose }: { handleClose: () => void }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Customize Navigation & Favorites</h2>
          <p className={styles.subtitle}>
            Drag and drop items to reorder or click to favorite.
          </p>
        </div>
        <button className={styles.closeButton} onClick={handleClose}>
          ×
        </button>
      </div>
      <div className={styles.content}>
        <FavoriteMenuItemsScreen />
      </div>
    </div>
  )
}

export function useEditFavoritesModal() {
  const { isShown, setShowModal } = useModal()
  const handleClose = () => setShowModal(false)

  const modalComp = (
    <ModalNext
      id="edit-navigation"
      data-testid="edit-navigation"
      isShown={isShown}
      hide={handleClose}
    >
      <EditFavoritesModal handleClose={handleClose} />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
