import React from 'react'
import { ModalHeaderTop, ModalNext } from '../../features/modal/ModalNext'
import { useModal } from '../../features/modal/useModal'
import { FavoriteMenuItemsScreen } from './FavoriteMenuItemsScreen'
import { HeaderText, HeaderTextDetails, ModalScroll } from '../../features/modal/styles'

export function useEditFavoritesModal() {
  const { isShown, setShowModal } = useModal()

  const modalComp = (
    <ModalNext id="edit-navigation" data-testid="edit-navigation" isShown={isShown} hide={() => setShowModal(false)}>
      <ModalHeaderTop
        disableClose={false}
        headerText={
          <div>
            <HeaderText>Customize Navigation & Favorites</HeaderText>
            <HeaderTextDetails>Drag and drop items to reorder or click to favorite.</HeaderTextDetails>
          </div>
        }
        hide={() => setShowModal(false)}
      />
      <ModalScroll>
        <FavoriteMenuItemsScreen />
      </ModalScroll>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
