import React from 'react'
import { SpecTable } from './SpecTable'
import { StyledSpecTab } from './styles'


export const SpecTab = ({ spec = {} }: { spec: any }) => {
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
        <SpecTable title="inputs" config={spec.input_spec} />
        <SpecTable title="outputs" config={spec.output_spec} />
      </div>
    </StyledSpecTab>
  )
}
