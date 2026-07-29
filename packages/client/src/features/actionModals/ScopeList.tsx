import type React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SpaceSelectionList } from '../spaces/SpaceSelectionList'
import type { EditableSpace } from '../spaces/spaces.api'

export const ScopeList = ({ onSelect }: { onSelect: (scope?: EditableSpace) => void }): React.ReactElement => {
  const [selectedScope, setSelectedScope] = useState<string>()
  const [searchQuery, setSearchQuery] = useState<string>('')

  const handleSelect = (selected: EditableSpace): void => {
    if (selected.scope === selectedScope) {
      setSelectedScope('')
      onSelect(undefined)
    } else {
      setSelectedScope(selected.scope)
      onSelect(selected)
    }
  }

  return (
    <>
      <div className="mb-4 flex gap-2">
        <Input
          className="h-8 min-w-0 flex-1"
          placeholder={'Search by space name or ID...'}
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
        />
        <Button className="h-8 shrink-0" type="button" variant="outline" onClick={() => setSearchQuery('')}>
          Clear
        </Button>
      </div>
      <div className="max-h-(--modal-max-height,50vh) min-w-0 flex-1 overflow-auto">
        <SpaceSelectionList
          filterString={searchQuery}
          selectedScope={selectedScope}
          onSelect={handleSelect}
          includeMyHome
        />
      </div>
    </>
  )
}
