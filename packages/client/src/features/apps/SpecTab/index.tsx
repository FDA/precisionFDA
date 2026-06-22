import React from 'react'
import { COMPUTE_RESOURCE_LABELS } from '@/types/user'
import { MetadataKey } from '../../home/show.styles'
import { AppSpec } from '../apps.types'
import { SpecTable } from './SpecTable'
import { StyledSpecTab } from './apps-spec-tab.styles'

export const SpecTab = ({ spec, spaceId }: { spec: AppSpec; spaceId?: string }): React.JSX.Element => {
  if (!spec) {
    return <></>
  }

  const internetAccess = spec.internetAccess ? 'Yes' : 'No'
  return (
    <StyledSpecTab>
      <div className="__header">
        <div className="__header_item">
          <MetadataKey>default instance type</MetadataKey>
          <div data-testid="app-default-instance-type" className="__header_item_value">
            {COMPUTE_RESOURCE_LABELS[spec.instanceType]}
          </div>
        </div>
        <div className="__header_item">
          <MetadataKey>has internet access</MetadataKey>
          <div data-testid="app-has-internet-access" className="__header_item_value">
            {internetAccess}
          </div>
        </div>
      </div>
      <div className="__table-container">
        <SpecTable dataTestId="app-inputs" spaceId={spaceId} title="app inputs" config={spec.inputSpec} />
        <SpecTable dataTestId="app-outputs" spaceId={spaceId} title="app outputs" config={spec.outputSpec} />
      </div>
    </StyledSpecTab>
  )
}
