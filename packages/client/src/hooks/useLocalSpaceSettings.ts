import { useLocalStorage } from './useLocalStorage'

export interface SpaceSettings {
  membershipView?: 'table' | 'cards'
  // Add more space-specific settings here as needed
  // sidebarExpanded?: boolean
  // defaultFilter?: string
  // etc.
}

/**
 * Custom hook for managing space-specific settings in localStorage.
 * 
 * This hook provides a way to store and retrieve settings for individual spaces
 * in a centralized localStorage object with the key 'spaceSettings'.
 * 
 * @param spaceId - The ID of the space to manage settings for
 * @returns An object containing the space settings and a function to update them
 * 
 * Usage:
 * const { settings, updateSettings } = useSpaceSettings(space.id)
 * const viewMode = settings.membershipView || 'table'
 * updateSettings({ membershipView: 'cards' })
 */
export function useLocalSpaceSettings(spaceId: number | string) {
  const [allSpaceLocalSettings, setAllSpaceSettings] = useLocalStorage<Record<string, SpaceSettings>>(
    'spaceSettings',
    {},
  )

  const spaceKey = `space-${spaceId}`
  const localSettings = allSpaceLocalSettings[spaceKey] || {}

  const updateLocalSettings = (newSettings: Partial<SpaceSettings>) => {
    setAllSpaceSettings({
      ...allSpaceLocalSettings,
      [spaceKey]: {
        ...localSettings,
        ...newSettings,
      },
    })
  }

  return {
    settings: localSettings,
    updateSettings: updateLocalSettings,
  }
}
