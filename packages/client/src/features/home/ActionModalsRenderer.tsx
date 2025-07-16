import React, { ReactNode } from 'react'

export interface ActionModalsRendererProps {
  modals: Record<string, ReactNode | null>
}

/**
 * A reusable component that renders action modals from a modals object.
 * This component consolidates the common pattern of mapping over modal entries
 * and rendering them within React fragments.
 * 
 * @param modals - Object with action names as keys and modal components as values
 */
export const ActionModalsRenderer: React.FC<ActionModalsRendererProps> = ({ modals }) => {
  return (
    <>
      {Object.entries(modals).map(([actionName, modal]) => (
        <React.Fragment key={actionName}>
          {modal}
        </React.Fragment>
      ))}
    </>
  )
}
