import React from 'react'
import { SpecTable } from './SpecTable'
import { StyledSpecTab } from './styles'
import { AppSpec } from '../apps.types'
import { MetadataKey } from '../../home/show.styles'
import { RESOURCE_LABELS } from '../../../types/user'


export const SpecTab = ({ spec, spaceId }: { spec: AppSpec, spaceId?: string }) => {
  const internetAccess = spec.internet_access ? 'Yes' : 'No'

  return (
    <StyledSpecTab>
      <div className="__header">
        <div className="__header_item">
          <MetadataKey>
            default instance type
          </MetadataKey>
          <div data-testid="app-default-instance-type" className="__header_item_value">
            {RESOURCE_LABELS[spec.instance_type] ?? spec.instance_type}
          </div>
        </div>
        <div className="__header_item">
          <MetadataKey>
            has internet access
          </MetadataKey>
          <div data-testid="app-has-internet-access" className="__header_item_value">
            {internetAccess}
          </div>
        </div>
      </div>
      <div className="__table-container">
        <SpecTable dataTestId="app-inputs" spaceId={spaceId} title="app inputs" config={spec.input_spec} />
        <SpecTable dataTestId="app-outputs" spaceId={spaceId} title="app outputs" config={spec.output_spec} />
      </div>
    </StyledSpecTab>
  )
}
