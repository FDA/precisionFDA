import React from 'react'
import { SpecTable } from './SpecTable'
import { StyledSpecTab } from './styles'
import { AppSpec } from '../apps.types'


export const SpecTab = ({ spec }: { spec: AppSpec }) => {
  const internetAccess = spec.internet_access ? 'Yes' : 'No'

  return (
    <StyledSpecTab>
      <div className="__header">
        <div className="__header_item">
          <div className="__header_item_label">
            default instance type
          </div>
          <div className="__header_item_value">
            {spec.instance_type}
          </div>
        </div>
        <div className="__header_item">
          <div className="__header_item_label">
            has internet access
          </div>
          <div className="__header_item_value">
            {internetAccess}
          </div>
        </div>
      </div>
      <div className="__table-container">
        <SpecTable title="app inputs" config={spec.input_spec} />
        <SpecTable title="app outputs" config={spec.output_spec} />
      </div>
    </StyledSpecTab>
  )
}
