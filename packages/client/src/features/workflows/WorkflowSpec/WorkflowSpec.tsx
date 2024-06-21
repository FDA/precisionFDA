import React from 'react'
import { StyledSpecTab } from '../../apps/SpecTab/styles'
import { MetadataKey, MetadataVal } from '../../home/show.styles'
import { WorkflowSpecTable } from './WorkflowSpecTable'
import { RESOURCE_LABELS } from '../../../types/user'


const renderEmptySpec = (type: string) => {
  return (
    <div className='__table-divider'>
      <div className='__table'>
        <div className='__table_title'>{type}</div>
        <div className='__table_row'>
          No fields specified
        </div>
      </div>
    </div>
  )
}

const renderSpecs = (stages: any[]) => {
  if (!stages.length) return renderEmptySpec('type')
  return (
    stages.map((stage, i) => {

      return(
        <React.Fragment key={`workflow-stage-${i}`}>
          <div className='__header'>
            <div className='__header_item'>
              <MetadataKey>stage</MetadataKey>
              <MetadataVal>{`${stage.stageIndex +1 }`}</MetadataVal>
            </div>
            <div className='__header_item'>
              <MetadataKey>name</MetadataKey>
              <MetadataVal data-testid={`workflow-stage-${stage.stageIndex +1 }-app-name`}>{stage.name}</MetadataVal>
            </div>
            <div className='__header_item'>
              <MetadataKey>default instance type</MetadataKey>
              <MetadataVal data-testid={`workflow-stage-${stage.stageIndex +1 }-app-default-instance-type`}>{RESOURCE_LABELS[stage.instanceType] ?? stage.instanceType}</MetadataVal>
            </div>
          </div>
          <div className='__table-block'>
            <WorkflowSpecTable title="inputs" config={stage.inputs} dataTestId="workflow-inputs" />
            <WorkflowSpecTable title="outputs" config={stage.outputs} dataTestId="workflow-outputs" />
          </div>
        </React.Fragment>
      )
    })
  )
}

const HomeWorkflowsSpec = ({ spec = {}}: { spec: any}) => {
  return (
    <StyledSpecTab>
      {spec.input_spec && renderSpecs(spec.input_spec.stages)}
    </StyledSpecTab>
  )
}

export default HomeWorkflowsSpec

export {
  HomeWorkflowsSpec,
}
